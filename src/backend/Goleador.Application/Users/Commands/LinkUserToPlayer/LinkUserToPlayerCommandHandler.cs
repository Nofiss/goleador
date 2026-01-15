using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Users.Commands.LinkUserToPlayer;

public class LinkUserToPlayerCommandHandler(IApplicationDbContext context)
    : IRequestHandler<LinkUserToPlayerCommand, Unit>
{
    public async Task<Unit> Handle(
        LinkUserToPlayerCommand request,
        CancellationToken cancellationToken
    )
    {
        if (request.PlayerId == null)
        {
            Player? existingLink = await context.Players.FirstOrDefaultAsync(
                p => p.UserId == request.UserId,
                cancellationToken
            );
            existingLink?.RemoveUserLink();
        }
        else
        {
            Player player =
                await context.Players.FindAsync([request.PlayerId], cancellationToken)
                ?? throw new KeyNotFoundException("Player not found");

            if (player.UserId != null && player.UserId != request.UserId)
            {
                throw new InvalidOperationException(
                    $"Il giocatore è già collegato a un altro utente ({player.UserId})."
                );
            }

            Player? userOldPlayer = await context.Players.FirstOrDefaultAsync(
                p => p.UserId == request.UserId && p.Id != request.PlayerId,
                cancellationToken
            );
            userOldPlayer?.RemoveUserLink();

            player.SetUser(request.UserId);
        }

        await context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
