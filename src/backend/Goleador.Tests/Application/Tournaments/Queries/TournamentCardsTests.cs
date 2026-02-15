using FluentAssertions;
using Goleador.Application.Tournaments.Queries.GetTournamentStandings;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using Goleador.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Tests.Application.Tournaments.Queries;

public class TournamentCardsTests
{
    [Fact]
    public async Task Handle_Should_DoublePoints_When_Card_Played_And_Win()
    {
        // Arrange
        DbContextOptions<ApplicationDbContext> options =
            new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

        using var context = new ApplicationDbContext(options);

        var tournament = new Tournament("Card Test", TournamentType.RoundRobin, 1, false, null, null);
        var cardDef = new TournamentCardDefinition(tournament.Id, "Double", "Double points", CardEffect.DoublePoints);

        // Use reflection to add card definition since it's private/readonly list and we want to bypass Setup status if needed
        // Actually, we can just use the public method if we are in Setup.
        tournament.AddCardDefinition("Double", "Double points", CardEffect.DoublePoints);
        var actualCardDef = tournament.CardDefinitions.First();

        var p1 = new Player("P1", "N", "S", "e1");
        var p2 = new Player("P2", "N", "S", "e2");
        var t1 = new TournamentTeam(tournament.Id, "Team1", [p1]);
        var t2 = new TournamentTeam(tournament.Id, "Team2", [p2]);
        tournament.RegisterTeam(t1);
        tournament.RegisterTeam(t2);

        context.Players.AddRange(p1, p2);
        context.Tournaments.Add(tournament);
        await context.SaveChangesAsync();

        // Partita: Team1 vince 1-0 e ha giocato la carta DoublePoints
        var match = new Match(1, 0, tournament.Id);
        match.AddParticipant(p1.Id, Side.Home);
        match.AddParticipant(p2.Id, Side.Away);
        match.PlayCard(t1.Id, actualCardDef.Id);
        match.SetResult(1, 0);

        context.Matches.Add(match);
        await context.SaveChangesAsync();

        // Act
        var handler = new GetTournamentStandingsQueryHandler(context);
        var result = await handler.Handle(new GetTournamentStandingsQuery(tournament.Id), CancellationToken.None);

        // Assert
        var stats1 = result.First(x => x.TeamName == "Team1");
        // Normal win = 3 pts. With DoublePoints = 6 pts.
        stats1.Points.Should().Be(6);
        stats1.Won.Should().Be(1);
    }

    [Fact]
    public async Task Handle_Should_NOT_DoublePoints_When_Card_Played_And_Draw()
    {
        // Arrange
        DbContextOptions<ApplicationDbContext> options =
            new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

        using var context = new ApplicationDbContext(options);

        var tournament = new Tournament("Card Test Draw", TournamentType.RoundRobin, 1, false, null, null);
        tournament.AddCardDefinition("Double", "Double points", CardEffect.DoublePoints);
        var actualCardDef = tournament.CardDefinitions.First();

        var p1 = new Player("P1", "N", "S", "e1");
        var p2 = new Player("P2", "N", "S", "e2");
        var t1 = new TournamentTeam(tournament.Id, "Team1", [p1]);
        var t2 = new TournamentTeam(tournament.Id, "Team2", [p2]);
        tournament.RegisterTeam(t1);
        tournament.RegisterTeam(t2);

        context.Players.AddRange(p1, p2);
        context.Tournaments.Add(tournament);
        await context.SaveChangesAsync();

        // Partita: Pareggio 1-1, Team1 ha giocato la carta DoublePoints
        var match = new Match(1, 1, tournament.Id);
        match.AddParticipant(p1.Id, Side.Home);
        match.AddParticipant(p2.Id, Side.Away);
        match.PlayCard(t1.Id, actualCardDef.Id);
        match.SetResult(1, 1);

        context.Matches.Add(match);
        await context.SaveChangesAsync();

        // Act
        var handler = new GetTournamentStandingsQueryHandler(context);
        var result = await handler.Handle(new GetTournamentStandingsQuery(tournament.Id), CancellationToken.None);

        // Assert
        var stats1 = result.First(x => x.TeamName == "Team1");
        // Draw = 1 pt. DoublePoints only applies on win.
        stats1.Points.Should().Be(1);
        stats1.Drawn.Should().Be(1);
    }
}
