using FluentAssertions;
using Goleador.Application.Tournaments.Queries.GetTournamentStandings;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using Goleador.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Tests.Application.Tournaments.Queries;

public class GetTournamentStandingsQueryTests
{
    [Fact]
    public async Task Handle_Should_Calculate_Points_Correctly()
    {
        // Arrange: Setup DB In-Memory
        DbContextOptions<ApplicationDbContext> options =
            new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // DB univoco per ogni test
                .Options;

        using var context = new ApplicationDbContext(options);

        // 1. Crea Torneo
        var tournament = new Tournament("Serie A", TournamentType.RoundRobin, 1, false, null, null);

        // 2. Crea Giocatori
        var p1 = new Player("P1", "N", "S", "e1");
        var p2 = new Player("P2", "N", "S", "e2");

        // 3. Crea Squadre
        var t1 = new TournamentTeam(tournament.Id, "Juve", [p1]);
        var t2 = new TournamentTeam(tournament.Id, "Inter", [p2]);
        tournament.RegisterTeam(t1);
        tournament.RegisterTeam(t2);

        context.Players.AddRange(p1, p2);
        context.Tournaments.Add(tournament);
        await context.SaveChangesAsync();

        // 4. Crea una Partita Giocata: Juve batte Inter 3-1
        var match = new Match(0, 0, tournament.Id);
        match.AddParticipant(p1.Id, Side.Home); // Juve
        match.AddParticipant(p2.Id, Side.Away); // Inter

        match.SetResult(3, 1); // Vittoria casa

        context.Matches.Add(match);
        await context.SaveChangesAsync();

        // Act
        var handler = new GetTournamentStandingsQueryHandler(context);
        List<TournamentStandingDto> result = await handler.Handle(
            new GetTournamentStandingsQuery(tournament.Id),
            CancellationToken.None
        );

        // Assert
        TournamentStandingDto juveStats = result.First(x => x.TeamName == "Juve");
        TournamentStandingDto interStats = result.First(x => x.TeamName == "Inter");

        // Juve: 3 punti, 1 Vinta, GD +2
        juveStats.Points.Should().Be(3);
        juveStats.Won.Should().Be(1);
        juveStats.GoalDifference.Should().Be(2);

        // Inter: 0 punti, 1 Persa, GD -2
        interStats.Points.Should().Be(0);
        interStats.Lost.Should().Be(1);
        interStats.GoalDifference.Should().Be(-2);
    }

    [Fact]
    public async Task Handle_Should_Calculate_ProjectedPoints_Correctly()
    {
        // Arrange
        DbContextOptions<ApplicationDbContext> options =
            new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

        using var context = new ApplicationDbContext(options);

        var tournament = new Tournament("Test", TournamentType.RoundRobin, 1, false, null, null);
        var p1 = new Player("P1", "N", "S", "e1");
        var p2 = new Player("P2", "N", "S", "e2");
        var t1 = new TournamentTeam(tournament.Id, "Team1", [p1]);
        var t2 = new TournamentTeam(tournament.Id, "Team2", [p2]);
        tournament.RegisterTeam(t1);
        tournament.RegisterTeam(t2);

        context.Players.AddRange(p1, p2);
        context.Tournaments.Add(tournament);

        // 2 partite totali tra loro
        var m1 = new Match(0, 0, tournament.Id);
        m1.AddParticipant(p1.Id, Side.Home);
        m1.AddParticipant(p2.Id, Side.Away);
        m1.SetResult(2, 0); // Team1 vince (3pt)

        var m2 = new Match(1, 0, tournament.Id);
        m2.AddParticipant(p2.Id, Side.Home);
        m2.AddParticipant(p1.Id, Side.Away);
        // m2 non è ancora giocata (Scheduled)

        context.Matches.AddRange(m1, m2);
        await context.SaveChangesAsync();

        // Act
        var handler = new GetTournamentStandingsQueryHandler(context);
        var result = await handler.Handle(new GetTournamentStandingsQuery(tournament.Id), CancellationToken.None);

        // Assert
        var stats1 = result.First(x => x.TeamName == "Team1");
        var stats2 = result.First(x => x.TeamName == "Team2");

        // Team 1: 3 punti in 1 partita. PPG = 3. Remaining = 1. Projected = 3 + 3*1 = 6.
        stats1.Points.Should().Be(3);
        stats1.Played.Should().Be(1);
        stats1.MatchesRemaining.Should().Be(1);
        stats1.ProjectedPoints.Should().Be(6);

        // Team 2: 0 punti in 1 partita. PPG = 0. Remaining = 1. Projected = 0 + 0*1 = 0.
        stats2.Points.Should().Be(0);
        stats2.Played.Should().Be(1);
        stats2.MatchesRemaining.Should().Be(1);
        stats2.ProjectedPoints.Should().Be(0);
    }
}
