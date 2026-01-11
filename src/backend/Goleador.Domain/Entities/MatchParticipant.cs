using Goleador.Domain.Enums;

namespace Goleador.Domain.Entities;

public class MatchParticipant(Guid playerId, Side side)
{
    public Guid MatchId { get; set; }
    public Match Match { get; set; } = null!;

    public Guid PlayerId { get; set; } = playerId;
    public Player Player { get; set; } = null!;

    public Side Side { get; set; } = side;
}
