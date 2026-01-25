namespace Goleador.Application.Players.Queries.GetPlayerProfile;

public class MatchBriefDto
{
    public Guid Id { get; set; }
    public DateTime DatePlayed { get; set; }
    public int ScoreHome { get; set; }
    public int ScoreAway { get; set; }
    public string HomeTeamName { get; set; } = string.Empty;
    public string AwayTeamName { get; set; } = string.Empty;
    public string Result { get; set; } = string.Empty; // "W", "L", "D"
}
