using Goleador.Domain.Enums;

namespace Goleador.Application.Matches.Queries.GetRecentMatches;

public class MatchDto
{
    public Guid Id { get; set; }
    public DateTime DatePlayed { get; set; }
    public int ScoreHome { get; set; }
    public int ScoreAway { get; set; }
    public string HomeTeamName { get; set; } = string.Empty;
    public string AwayTeamName { get; set; } = string.Empty;
    public MatchStatus Status { get; set; }
    public bool HasCardsHome { get; set; }
    public bool HasCardsAway { get; set; }
}
