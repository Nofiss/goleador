using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Tournaments.Commands.RegisterTeam;

public class RegisterTeamCommandHandler(IApplicationDbContext context)
    : IRequestHandler<RegisterTeamCommand, Guid>
{
    public async Task<Guid> Handle(RegisterTeamCommand request, CancellationToken cancellationToken)
    {
        // 1. Recupera il torneo
        Tournament tournament =
            await context
                .Tournaments.Include(t => t.Teams) // Carica le squadre esistenti per controlli futuri
                .FirstOrDefaultAsync(t => t.Id == request.TournamentId, cancellationToken)
            ?? throw new KeyNotFoundException("Tournament not found");

        // 2. Recupera i giocatori dal DB
        List<Player> players = await context
            .Players.Where(p => request.PlayerIds.Contains(p.Id))
            .ToListAsync(cancellationToken);

        if (players.Count != request.PlayerIds.Count)
        {
            throw new KeyNotFoundException("One or more players not found");
        }

        // 3. Crea la squadra
        var team = new TournamentTeam(tournament.Id, request.TeamName, players);

        // 4. Aggiungi al torneo (questo metodo fa i check di validità stato e numero giocatori)
        tournament.RegisterTeam(team);

        await context.SaveChangesAsync(cancellationToken);

        return team.Id;
    }
}
