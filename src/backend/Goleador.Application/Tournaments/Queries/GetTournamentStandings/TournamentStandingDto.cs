namespace Goleador.Application.Tournaments.Queries.GetTournamentStandings;

public class TournamentStandingDto
{
    public Guid TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public int Position { get; set; }

    // Statistiche
    public int Points { get; set; }
    public int Played { get; set; }
    public int Won { get; set; }
    public int Drawn { get; set; }
    public int Lost { get; set; }

    // Goal
    public int GoalsFor { get; set; }
    public int GoalsAgainst { get; set; }
    public int GoalDifference => GoalsFor - GoalsAgainst;
}
