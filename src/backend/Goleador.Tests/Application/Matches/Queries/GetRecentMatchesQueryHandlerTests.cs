using FluentAssertions;
using Goleador.Application.Matches.Queries.GetRecentMatches;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using Goleador.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Tests.Application.Matches.Queries;

public class GetRecentMatchesQueryHandlerTests
{
    [Fact]
    public async Task Handle_Should_Return_Last_10_Played_Matches_With_Correct_Names()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new ApplicationDbContext(options);

        var p1 = new Player("Player1", "One", "P1", "p1@test.com");
        var p2 = new Player("Player2", "Two", "P2", "p2@test.com");
        context.Players.AddRange(p1, p2);
        await context.SaveChangesAsync();

        // Create 12 matches, 11 played, 1 scheduled
        for (int i = 1; i <= 11; i++)
        {
            var match = new Match(0, 0);
            match.AddParticipant(p1.Id, Side.Home);
            match.AddParticipant(p2.Id, Side.Away);
            match.SetResult(i, 0); // i goals for home
            // Set DatePlayed to ensure order
            typeof(Match).GetProperty(nameof(Match.DatePlayed))?.SetValue(match, DateTime.UtcNow.AddMinutes(i));
            context.Matches.Add(match);
        }

        var scheduledMatch = new Match(0, 0);
        scheduledMatch.AddParticipant(p1.Id, Side.Home);
        scheduledMatch.AddParticipant(p2.Id, Side.Away);
        context.Matches.Add(scheduledMatch);

        await context.SaveChangesAsync();

        var handler = new GetRecentMatchesQueryHandler(context);

        // Act
        var result = await handler.Handle(new GetRecentMatchesQuery(), CancellationToken.None);

        // Assert
        result.Should().HaveCount(10);
        result.First().ScoreHome.Should().Be(11); // The last played match (i=11)
        result.Last().ScoreHome.Should().Be(2);   // The 10th most recent played match (i=2)
        result.All(m => m.Status == MatchStatus.Played).Should().BeTrue();
        result.All(m => m.HomeTeamName == "Player1").Should().BeTrue();
        result.All(m => m.AwayTeamName == "Player2").Should().BeTrue();
    }
}
