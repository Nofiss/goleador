namespace Goleador.Application.Players.Queries.GetPlayerProfile;

public class PlayerProfileDto
{
    public string FullName { get; set; } = string.Empty;
    public string Nickname { get; set; } = string.Empty;
    public int EloRating { get; set; }

    public int TotalMatches { get; set; }
    public int Wins { get; set; }
    public int Losses { get; set; }
    public double WinRate { get; set; }

    public RelatedPlayerDto? Nemesis { get; set; }
    public RelatedPlayerDto? BestPartner { get; set; }

    public List<MatchBriefDto> RecentMatches { get; set; } = [];
}
