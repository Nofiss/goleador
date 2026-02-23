using FluentAssertions;
using Goleador.Application.Players.Queries.GetPlayerStatistics;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using Goleador.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Tests.Application.Players.Queries;

public class GetPlayerStatisticsQueryTests
{
    [Fact]
    public async Task Handle_Should_Calculate_Statistics_Correctly()
    {
        // Arrange
        DbContextOptions<ApplicationDbContext> options =
            new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

        using var context = new ApplicationDbContext(options);

        var player = new Player("Bolt", "Usain", "Bolt", "bolt@fast.com");
        var opponent = new Player("Slow", "John", "Doe", "slow@slow.com");
        context.Players.AddRange(player, opponent);
        await context.SaveChangesAsync();

        // 1. Win (Home)
        var m1 = new Match(2, 1);
        m1.AddParticipant(player.Id, Side.Home);
        m1.AddParticipant(opponent.Id, Side.Away);
        m1.SetResult(2, 1);

        // 2. Loss (Away)
        var m2 = new Match(3, 0);
        m2.AddParticipant(opponent.Id, Side.Home);
        m2.AddParticipant(player.Id, Side.Away);
        m2.SetResult(3, 0);

        // 3. Draw (Home)
        var m3 = new Match(1, 1);
        m3.AddParticipant(player.Id, Side.Home);
        m3.AddParticipant(opponent.Id, Side.Away);
        m3.SetResult(1, 1);

        context.Matches.AddRange(m1, m2, m3);
        await context.SaveChangesAsync();

        var handler = new GetPlayerStatisticsQueryHandler(context);

        // Act
        PlayerStatisticsDto result = await handler.Handle(new GetPlayerStatisticsQuery(player.Id), CancellationToken.None);

        // Assert
        result.Nickname.Should().Be("Bolt");
        result.MatchesPlayed.Should().Be(3);
        result.Wins.Should().Be(1);
        result.Losses.Should().Be(1);
        result.Draws.Should().Be(1);
        result.GoalsFor.Should().Be(3);
        result.GoalsAgainst.Should().Be(5);
        result.RecentForm.Should().HaveCount(3);
        // RecentForm should be in descending order of DatePlayed: m3, m2, m1
        result.RecentForm.Should().Equal("D", "L", "W");
    }

    [Fact]
    public async Task Benchmark_GetPlayerStatistics()
    {
        // Arrange
        DbContextOptions<ApplicationDbContext> options =
            new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "BenchmarkDB")
                .Options;

        using var context = new ApplicationDbContext(options);

        var player = new Player("Bolt", "Usain", "Bolt", "bolt@fast.com");
        context.Players.Add(player);
        await context.SaveChangesAsync();

        // Aggiungiamo 1000 partite
        for (var i = 0; i < 1000; i++)
        {
            var m = new Match(1, 0);
            m.AddParticipant(player.Id, Side.Home);
            m.SetResult(1, 0);
            context.Matches.Add(m);
        }
        await context.SaveChangesAsync();

        var handler = new GetPlayerStatisticsQueryHandler(context);
        var sw = System.Diagnostics.Stopwatch.StartNew();

        // Act
        PlayerStatisticsDto result = await handler.Handle(new GetPlayerStatisticsQuery(player.Id), CancellationToken.None);

        sw.Stop();

        Console.WriteLine($"[BENCHMARK] Execution time for 1000 matches: {sw.ElapsedMilliseconds}ms");
    }
}
