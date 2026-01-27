namespace Goleador.Application.Players.Queries.GetPendingMatches;

public class PendingMatchDto
{
    public Guid Id { get; set; }
    public string? TournamentName { get; set; }
    public string OpponentName { get; set; } = string.Empty;
    public int Round { get; set; }
    public string? TableName { get; set; }
}
