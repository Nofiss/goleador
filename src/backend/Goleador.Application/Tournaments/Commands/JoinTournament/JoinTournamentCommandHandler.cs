using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Tournaments.Commands.JoinTournament;

public class JoinTournamentCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService
) : IRequestHandler<JoinTournamentCommand, Guid>
{
    public async Task<Guid> Handle(
        JoinTournamentCommand request,
        CancellationToken cancellationToken
    )
    {
        var userId = currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException();
        }

        // 1. Trova il Player collegato all'Utente
        Player player =
            await context.Players.FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken)
            ?? throw new Exception("Nessun profilo giocatore associato al tuo utente.");

        // 2. Trova il Torneo
        Tournament tournament =
            await context
                .Tournaments.Include(t => t.Teams)
                    .ThenInclude(tt => tt.Players)
                .FirstOrDefaultAsync(t => t.Id == request.TournamentId, cancellationToken)
            ?? throw new KeyNotFoundException("Torneo non trovato.");

        // 3. Validazioni
        if (tournament.Status != TournamentStatus.Setup)
        {
            throw new InvalidOperationException("Le iscrizioni sono chiuse.");
        }

        // Verifica se è già iscritto
        if (tournament.Teams.Any(t => t.Players.Any(p => p.Id == player.Id)))
        {
            throw new InvalidOperationException("Sei già iscritto a questo torneo.");
        }

        // 4. Logica Iscrizione
        // CASO A: Torneo 1vs1 -> Crea subito il Team
        if (tournament.TeamSize == 1)
        {
            var team = new TournamentTeam(tournament.Id, request.TeamName, [player]);
            tournament.RegisterTeam(team);
            await context.SaveChangesAsync(cancellationToken);
            return team.Id;
        }
        // CASO B: Torneo 2vs2 (o NvsN) -> Qui è complesso.
        // L'utente crea un team "incompleto" o si unisce a uno esistente?
        // PER ORA: Supportiamo solo 1vs1 per il "Join Rapido".
        // Per il 2vs2, l'Admin deve continuare a usare "RegisterTeam" manualmente per formare le coppie.
        else
        {
            throw new NotImplementedException(
                "L'auto-iscrizione è supportata solo per tornei 1vs1 al momento."
            );
        }
    }
}
