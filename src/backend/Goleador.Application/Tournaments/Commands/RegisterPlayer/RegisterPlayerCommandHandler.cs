using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Tournaments.Commands.RegisterPlayer;

public class RegisterPlayerCommandHandler(IApplicationDbContext context)
    : IRequestHandler<RegisterPlayerCommand>
{
    public async Task Handle(RegisterPlayerCommand request, CancellationToken cancellationToken)
    {
        Tournament tournament =
            await context
                .Tournaments.Include(t => t.Registrations)
                .FirstOrDefaultAsync(t => t.Id == request.TournamentId, cancellationToken)
            ?? throw new KeyNotFoundException("Tournament not found");


        tournament.RegisterPlayer(request.PlayerId);

        await context.SaveChangesAsync(cancellationToken);
    }
}
