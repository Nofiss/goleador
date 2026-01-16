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
        Tournament tournament =
            await context
                .Tournaments.Include(t => t.Teams)
                    .ThenInclude(tt => tt.Players)
                .Include(t => t.Registrations)
                    .ThenInclude(r => r.Player)
                .FirstOrDefaultAsync(t => t.Id == request.TournamentId, cancellationToken)
            ?? throw new KeyNotFoundException("Tournament not found");

        var poolPlayerIds = tournament.Registrations.Select(r => r.PlayerId).ToHashSet();

        foreach (Guid reqPlayerId in request.PlayerIds)
        {
            if (!poolPlayerIds.Contains(reqPlayerId))
            {
                throw new InvalidOperationException(
                    $"Il giocatore {reqPlayerId} non è iscritto al torneo."
                );
            }
        }
        var alreadyInTeamIds = tournament
            .Teams.SelectMany(t => t.Players)
            .Select(p => p.Id)
            .ToHashSet();
        if (request.PlayerIds.Any(alreadyInTeamIds.Contains))
        {
            throw new InvalidOperationException("Uno dei giocatori è già assegnato a una squadra.");
        }

        var playersToTeam = tournament
            .Registrations.Where(r => request.PlayerIds.Contains(r.PlayerId))
            .Select(r => r.Player)
            .ToList();

        var team = new TournamentTeam(tournament.Id, request.TeamName, playersToTeam);
        context.TournamentTeams.Add(team);

        await context.SaveChangesAsync(cancellationToken);
        return team.Id;
    }
}
