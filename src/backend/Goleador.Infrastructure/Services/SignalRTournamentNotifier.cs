using Goleador.Application.Common.Interfaces;
using Goleador.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Goleador.Infrastructure.Services;

public class SignalRTournamentNotifier(IHubContext<TournamentHub> hubContext) : ITournamentNotifier
{
    readonly IHubContext<TournamentHub> _hubContext = hubContext;

    public async Task NotifyMatchUpdated(Guid tournamentId, Guid matchId) => await _hubContext.Clients.Group(tournamentId.ToString()).SendAsync("MatchUpdated", matchId);
}
