namespace Goleador.Application.Players.Queries.GetGlobalRanking;

public class PlayerRankingDto
{
    public Guid Id { get; set; }
    public string Nickname { get; set; } = string.Empty;
    public int EloRating { get; set; }
    public int TotalMatches { get; set; }
    public double WinRate { get; set; }
}
