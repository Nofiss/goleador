namespace Goleador.Application.Players.Queries.GetPendingMatches;

public class PendingMatchDto
{
    public Guid Id { get; set; }
    public Guid TournamentId { get; set; }
    public string? TournamentName { get; set; }
    public string HomeTeamName { get; set; } = string.Empty;
    public string AwayTeamName { get; set; } = string.Empty;
    public string OpponentName { get; set; } = string.Empty;
    public int Round { get; set; }
    public string? TableName { get; set; }
}
