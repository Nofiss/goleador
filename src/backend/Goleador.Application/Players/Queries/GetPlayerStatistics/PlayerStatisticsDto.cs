namespace Goleador.Application.Players.Queries.GetPlayerStatistics;

public class PlayerStatisticsDto
{
    public Guid PlayerId { get; set; }
    public string Nickname { get; set; } = string.Empty;

    // Totali
    public int MatchesPlayed { get; set; }
    public int Wins { get; set; }
    public int Draws { get; set; }
    public int Losses { get; set; }

    // Goal (della squadra in cui giocava)
    public int GoalsFor { get; set; }
    public int GoalsAgainst { get; set; }
    public int GoalDifference => GoalsFor - GoalsAgainst;

    // Percentuale
    public double WinRate =>
        MatchesPlayed == 0 ? 0 : Math.Round((double)Wins / MatchesPlayed * 100, 1);

    // Ultime 5 partite (es. ["W", "L", "W", "D", "W"])
    public List<string> RecentForm { get; set; } = [];
}
