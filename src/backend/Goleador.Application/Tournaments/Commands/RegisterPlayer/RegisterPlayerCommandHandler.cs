using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Tournaments.Commands.RegisterPlayer;

public class RegisterPlayerCommandHandler(IApplicationDbContext context)
    : IRequestHandler<RegisterPlayerCommand, Unit>
{
    public async Task<Unit> Handle(
        RegisterPlayerCommand request,
        CancellationToken cancellationToken
    )
    {
        Tournament tournament =
            await context
                .Tournaments.Include(t => t.Registrations)
                .FirstOrDefaultAsync(t => t.Id == request.TournamentId, cancellationToken)
            ?? throw new KeyNotFoundException(
                $"Tournament with ID {request.TournamentId} not found."
            );

        var playerExists = await context.Players.AnyAsync(
            p => p.Id == request.PlayerId,
            cancellationToken
        );

        if (!playerExists)
        {
            throw new KeyNotFoundException($"Player with ID {request.PlayerId} not found.");
        }

        tournament.RegisterPlayer(request.PlayerId);

        await context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
