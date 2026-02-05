using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Goleador.Infrastructure.Hubs;

[Authorize]
public class TournamentHub : Hub
{
    public async Task JoinGroup(string tournamentId)
    {
        // Security: Validate that tournamentId is a valid Guid to prevent joining arbitrary groups.
        if (Guid.TryParse(tournamentId, out _))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, tournamentId);
        }
    }
}
