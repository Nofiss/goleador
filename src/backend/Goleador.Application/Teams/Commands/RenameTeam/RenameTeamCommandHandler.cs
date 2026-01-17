using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;

namespace Goleador.Application.Teams.Commands.RenameTeam;

public class RenameTeamCommandHandler(IApplicationDbContext context)
    : IRequestHandler<RenameTeamCommand, Unit>
{
    public async Task<Unit> Handle(RenameTeamCommand request, CancellationToken cancellationToken)
    {
        TournamentTeam team =
            await context.TournamentTeams.FindAsync([request.TeamId], cancellationToken)
            ?? throw new KeyNotFoundException($"Team with ID {request.TeamId} not found.");

        team.Rename(request.NewName);

        await context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
