using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Players.Queries.GetPlayerProfile;

public record GetMyPlayerProfileQuery : IRequest<PlayerProfileDto>;

public class GetMyPlayerProfileQueryHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService,
    ISender mediator)
    : IRequestHandler<GetMyPlayerProfileQuery, PlayerProfileDto>
{
    public async Task<PlayerProfileDto> Handle(GetMyPlayerProfileQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException();
        }

        Player? player = await context.Players
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        return player == null
            ? throw new KeyNotFoundException("Player not found for current user")
            : await mediator.Send(new GetPlayerProfileQuery(player.Id), cancellationToken);
    }
}
