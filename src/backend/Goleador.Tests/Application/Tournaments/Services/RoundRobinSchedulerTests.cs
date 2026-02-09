using FluentAssertions;
using Goleador.Application.Tournaments.Services;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;

namespace Goleador.Tests.Application.Tournaments.Services;

public class RoundRobinSchedulerTests
{
    [Fact]
    public void GenerateMatches_Should_Generate_Correct_Number_Of_Matches_For_4_Teams_SingleRound()
    {
        // Arrange
        var tournament = new Tournament("Test", TournamentType.RoundRobin, 1, false, null, null);

        var player1 = new Player("P1", "P1", "P1", "p1@test.com");
        var player2 = new Player("P2", "P2", "P2", "p2@test.com");
        var player3 = new Player("P3", "P3", "P3", "p3@test.com");
        var player4 = new Player("P4", "P4", "P4", "p4@test.com");

        var teams = new List<TournamentTeam>
        {
            new(tournament.Id, "A", [player1]),
            new(tournament.Id, "B", [player2]),
            new(tournament.Id, "C", [player3]),
            new(tournament.Id, "D", [player4]),
        };

        // Act
        List<Match> matches = RoundRobinScheduler.GenerateMatches(tournament, new List<TournamentTeam>(teams));

        // Assert
        // Formula Girone all'italiana (n * (n-1)) / 2
        // 4 * 3 / 2 = 6 matches
        matches.Should().HaveCount(6);

        // Verify each team plays 3 matches
        foreach (var team in teams)
        {
            var playerId = team.Players.First().Id;
            var count = matches.Count(m => m.Participants.Any(p => p.PlayerId == playerId));
            count.Should().Be(3);
        }
    }

    [Fact]
    public void GenerateMatches_Should_Generate_Correct_Number_Of_Matches_For_3_Teams_SingleRound()
    {
        // Arrange
        var tournament = new Tournament("Test", TournamentType.RoundRobin, 1, false, null, null);

        var player1 = new Player("P1", "P1", "P1", "p1@test.com");
        var player2 = new Player("P2", "P2", "P2", "p2@test.com");
        var player3 = new Player("P3", "P3", "P3", "p3@test.com");

        var teams = new List<TournamentTeam>
        {
            new(tournament.Id, "A", [player1]),
            new(tournament.Id, "B", [player2]),
            new(tournament.Id, "C", [player3]),
        };

        // Act
        List<Match> matches = RoundRobinScheduler.GenerateMatches(tournament, new List<TournamentTeam>(teams));

        // Assert
        // 3 teams -> 3 matches (each team plays 2 matches, 1 rest round)
        // A vs B, A vs C, B vs C
        matches.Should().HaveCount(3);

        foreach (var team in teams)
        {
            var playerId = team.Players.First().Id;
            var count = matches.Count(m => m.Participants.Any(p => p.PlayerId == playerId));
            count.Should().Be(2);
        }
    }

    [Fact]
    public void GenerateMatches_Should_Generate_Double_Matches_For_ReturnRound()
    {
        // Arrange
        var tournament = new Tournament("Test", TournamentType.RoundRobin, 1, true, null, null); // true = Ritorno

        var player1 = new Player("P1", "P1", "P1", "p1@test.com");
        var player2 = new Player("P2", "P2", "P2", "p2@test.com");
        var player3 = new Player("P3", "P3", "P3", "p3@test.com");

        var teams = new List<TournamentTeam>
        {
            new(tournament.Id, "A", [player1]),
            new(tournament.Id, "B", [player2]),
            new(tournament.Id, "C", [player3]),
        };

        // Act
        List<Match> matches = RoundRobinScheduler.GenerateMatches(tournament, new List<TournamentTeam>(teams));

        // Assert
        // 3 Teams -> 3 matches first leg + 3 matches second leg = 6 matches
        matches.Should().HaveCount(6);

        // Verify return matches exist (Home/Away swapped)
        var firstMatch = matches.First(m => m.Round == 1);
        var firstHomePlayerId = firstMatch.Participants.First(p => p.Side == Side.Home).PlayerId;
        var firstAwayPlayerId = firstMatch.Participants.First(p => p.Side == Side.Away).PlayerId;

        // There should be a match with swapped players in the second leg (rounds 4-6)
        matches.Should().Contain(m =>
            m.Round > 3 &&
            m.Participants.Any(p => p.PlayerId == firstAwayPlayerId && p.Side == Side.Home) &&
            m.Participants.Any(p => p.PlayerId == firstHomePlayerId && p.Side == Side.Away));
    }
}
