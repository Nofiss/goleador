namespace Goleador.Application.Common.Interfaces;

public interface ITournamentNotifier
{
    Task NotifyMatchUpdated(Guid tournamentId, Guid matchId);
}
