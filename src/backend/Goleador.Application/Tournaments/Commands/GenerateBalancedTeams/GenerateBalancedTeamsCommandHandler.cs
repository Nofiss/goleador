using Goleador.Application.Common.Interfaces;
using Goleador.Application.Players.Queries.GetPlayerStatistics;
using Goleador.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Tournaments.Commands.GenerateBalancedTeams;

public class GenerateBalancedTeamsCommandHandler(
    IApplicationDbContext context,
    ITeamGeneratorService aiService,
    IMediator mediator
) : IRequestHandler<GenerateBalancedTeamsCommand, Unit>
{
    public async Task<Unit> Handle(GenerateBalancedTeamsCommand request, CancellationToken token)
    {
        // 1. Recupera Torneo e Iscritti Singoli
        Tournament tournament =
            await context
                .Tournaments.Include(t => t.Teams)
                    .ThenInclude(tt => tt.Players)
                .FirstOrDefaultAsync(t => t.Id == request.TournamentId, token)
            ?? throw new KeyNotFoundException("Torneo non trovato.");
        ;

        // Prendi solo i team con 1 giocatore (quelli in attesa di pairing)
        var pendingTeams = tournament.Teams.Where(t => t.Players.Count == 1).ToList();

        if (pendingTeams.Count < 2)
        {
            throw new Exception("Servono almeno 2 giocatori per generare squadre.");
        }

        // 2. Calcola Skill Score per ogni giocatore
        // Usiamo una logica semplice: WinRate * (Log(PartiteGiocate) + 1)
        // Oppure riusiamo la query GetPlayerStatisticsQuery
        var playerSkills = new Dictionary<Guid, double>();

        foreach (TournamentTeam? team in pendingTeams)
        {
            Player player = team.Players.First();
            // Chiamiamo la query delle statistiche (o calcoliamo al volo)
            PlayerStatisticsDto stats = await mediator.Send(
                new GetPlayerStatisticsQuery(player.Id),
                token
            );

            // Formula Skill: Punti totali + (WinRate * 2)
            // Esempio: Un giocatore con 50% winrate e 10 partite è meglio di uno con 100% winrate e 1 partita.
            var skill = (stats.Wins * 3) + (stats.Draws * 1) + stats.WinRate;
            playerSkills.Add(player.Id, skill);
        }

        // 3. Chiama l'AI
        List<(Guid Player1, Guid Player2)> pairs = await aiService.GenerateBalancedTeamsAsync(
            playerSkills
        );

        // 4. Applica le modifiche al DB
        // A. Rimuovi i team "Pending" singoli
        context.TournamentTeams.RemoveRange(pendingTeams);

        // B. Crea i nuovi Team Accoppiati
        var teamCounter = 1;
        foreach ((Guid Player1, Guid Player2) in pairs)
        {
            Player p1 = pendingTeams.First(t => t.Players.First().Id == Player1).Players.First();
            Player p2 = pendingTeams.First(t => t.Players.First().Id == Player2).Players.First();

            // Nome generato (o chiedilo all'AI di inventare nomi divertenti!)
            var teamName = $"{p1.Nickname} & {p2.Nickname}";

            var newTeam = new TournamentTeam(tournament.Id, teamName, [p1, p2]);
            context.TournamentTeams.Add(newTeam);
            teamCounter++;
        }

        await context.SaveChangesAsync(token);
        return Unit.Value;
    }
}
