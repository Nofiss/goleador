using Microsoft.AspNetCore.SignalR;

namespace Goleador.Infrastructure.Hubs;

public class TournamentHub : Hub
{
    public async Task JoinGroup(string tournamentId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, tournamentId);
    }
}
