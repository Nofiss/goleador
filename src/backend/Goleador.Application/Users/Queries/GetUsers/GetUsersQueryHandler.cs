using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Users.Queries.GetUsers;

public class GetUsersQueryHandler(IIdentityService identityService, IApplicationDbContext context)
    : IRequestHandler<GetUsersQuery, List<UserDto>>
{
    public async Task<List<UserDto>> Handle(
        GetUsersQuery request,
        CancellationToken cancellationToken
    )
    {
        List<(string Id, string Email, string Username, string[] Roles)> identityUsers =
            await identityService.GetAllUsersAsync();

        List<Player> linkedPlayers = await context
            .Players.AsNoTracking()
            .Where(p => p.UserId != null)
            .ToListAsync(cancellationToken);

        var result = new List<UserDto>();

        foreach ((var id, var email, var username, var roles) in identityUsers)
        {
            Player? player = linkedPlayers.FirstOrDefault(p => p.UserId == id);

            result.Add(
                new UserDto
                {
                    Id = id,
                    Email = email,
                    Username = username,
                    Roles = [.. roles],
                    PlayerId = player?.Id,
                    PlayerName = player?.Nickname,
                }
            );
        }

        return result;
    }
}
