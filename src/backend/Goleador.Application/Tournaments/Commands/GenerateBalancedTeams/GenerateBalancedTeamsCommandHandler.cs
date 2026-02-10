using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Goleador.Application.Tournaments.Commands.GenerateBalancedTeams;

public class GenerateBalancedTeamsCommandHandler(
    IApplicationDbContext context,
    ITeamGeneratorService aiService,
    IMemoryCache cache
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

        // Prendi solo i team con 1 giocatore (quelli in attesa di pairing)
        var pendingTeams = tournament.Teams.Where(t => t.Players.Count == 1).ToList();

        if (pendingTeams.Count < 2)
        {
            throw new Exception("Servono almeno 2 giocatori per generare squadre.");
        }

        // 2. Calcola Skill Score per ogni giocatore in batch (Bolt ⚡ Optimization)
        // Evitiamo il problema N+1 eliminando i singoli mediator.Send per ogni giocatore.
        var playerIds = pendingTeams.Select(t => t.Players.First().Id).ToList();

        var playerStats = await context.Matches
            .AsNoTracking()
            .Where(m => m.Status == MatchStatus.Played)
            .SelectMany(m => m.Participants)
            .Where(p => playerIds.Contains(p.PlayerId))
            .GroupBy(p => p.PlayerId)
            .Select(g => new
            {
                PlayerId = g.Key,
                Wins = g.Count(p => (p.Side == Side.Home && p.Match.ScoreHome > p.Match.ScoreAway) ||
                                   (p.Side == Side.Away && p.Match.ScoreAway > p.Match.ScoreHome)),
                Draws = g.Count(p => p.Match.ScoreHome == p.Match.ScoreAway),
                Total = g.Count()
            })
            .ToDictionaryAsync(x => x.PlayerId, x => x, token);

        var playerSkills = new Dictionary<Guid, double>();
        foreach (var playerId in playerIds)
        {
            playerStats.TryGetValue(playerId, out var stats);
            int wins = stats?.Wins ?? 0;
            int draws = stats?.Draws ?? 0;
            int total = stats?.Total ?? 0;
            double winRate = total == 0 ? 0 : Math.Round((double)wins / total * 100, 1);

            // Formula Skill: (Wins * 3) + (Draws * 1) + WinRate
            var skill = (wins * 3) + (draws * 1) + winRate;
            playerSkills.Add(playerId, skill);
        }

        // 3. Chiama l'AI
        List<(Guid Player1, Guid Player2)> pairs = await aiService.GenerateBalancedTeamsAsync(
            playerSkills
        );

        // 4. Applica le modifiche al DB
        // A. Rimuovi i team "Pending" singoli
        context.TournamentTeams.RemoveRange(pendingTeams);

        // Mappa per lookup veloce O(1) invece di O(N) dentro il loop (Bolt ⚡ Optimization)
        var pendingPlayersMap = pendingTeams.ToDictionary(t => t.Players.First().Id, t => t.Players.First());

        // B. Crea i nuovi Team Accoppiati
        foreach ((Guid Player1, Guid Player2) in pairs)
        {
            if (!pendingPlayersMap.TryGetValue(Player1, out var p1) ||
                !pendingPlayersMap.TryGetValue(Player2, out var p2))
            {
                continue;
            }

            // Nome generato
            var teamName = $"{p1.Nickname} & {p2.Nickname}";

            var newTeam = new TournamentTeam(tournament.Id, teamName, [p1, p2]);
            context.TournamentTeams.Add(newTeam);
        }

        await context.SaveChangesAsync(token);

        // Optimization Bolt ⚡: Invalidate cache when teams are generated
        cache.Remove($"TournamentDetail-{tournament.Id}");

        return Unit.Value;
    }
}
