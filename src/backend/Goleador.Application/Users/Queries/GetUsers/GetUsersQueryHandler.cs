using Goleador.Application.Common.Interfaces;
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

        // Optimization Bolt ⚡: Use a selective projection to fetch only required fields (UserId, Id, Nickname).
        // This avoids over-fetching full Player entities (O(1) columns) and reduces memory usage (O(N) objects).
        var linkedPlayers = await context
            .Players.AsNoTracking()
            .Where(p => p.UserId != null)
            .Select(p => new { p.UserId, p.Id, p.Nickname })
            .ToListAsync(cancellationToken);

        var result = new List<UserDto>();

        // Ottimizzazione Bolt ⚡: Usiamo un dizionario per evitare una ricerca O(N) dentro un loop O(N).
        var playerMap = linkedPlayers.ToDictionary(p => p.UserId!);

        foreach ((var id, var email, var username, var roles) in identityUsers)
        {
            playerMap.TryGetValue(id, out var player);

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
