namespace Goleador.Domain.Entities;

public class TournamentRegistration
{
    public Guid TournamentId { get; private set; }
    public Tournament Tournament { get; private set; } = null!;

    public Guid PlayerId { get; private set; }
    public Player Player { get; private set; } = null!;

    public DateTime RegisteredAt { get; private set; }

    TournamentRegistration() { }

    public TournamentRegistration(Guid tournamentId, Guid playerId)
    {
        TournamentId = tournamentId;
        PlayerId = playerId;
        RegisteredAt = DateTime.UtcNow;
    }
}
