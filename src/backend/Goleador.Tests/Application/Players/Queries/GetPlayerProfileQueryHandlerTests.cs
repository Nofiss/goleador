using FluentAssertions;
using Goleador.Application.Players.Queries.GetPlayerProfile;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using Goleador.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Tests.Application.Players.Queries;

public class GetPlayerProfileQueryHandlerTests
{
    [Fact]
    public async Task Handle_Should_Return_Full_Profile_Correctly()
    {
        // Arrange
        DbContextOptions<ApplicationDbContext> options =
            new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

        using var context = new ApplicationDbContext(options);

        var player = new Player("Bolt", "Usain", "Bolt", "bolt@fast.com");
        var opponent = new Player("SlowOpp", "John", "Doe", "slow@slow.com");
        var partner = new Player("GoodP", "Good", "P", "partner@fast.com");
        context.Players.AddRange(player, opponent, partner);
        await context.SaveChangesAsync();

        // 1. Win with partner (Home)
        var m1 = new Match(0, 0);
        m1.AddParticipant(player.Id, Side.Home);
        m1.AddParticipant(partner.Id, Side.Home);
        m1.AddParticipant(opponent.Id, Side.Away);
        m1.SetResult(2, 1);

        context.Matches.Add(m1);
        await context.SaveChangesAsync();
        await Task.Delay(100); // Ensure different timestamps

        // 2. Loss against opponent (Away)
        var m2 = new Match(0, 0);
        m2.AddParticipant(opponent.Id, Side.Home);
        m2.AddParticipant(player.Id, Side.Away);
        m2.SetResult(3, 0);

        context.Matches.Add(m2);
        await context.SaveChangesAsync();

        var handler = new GetPlayerProfileQueryHandler(context);

        // Act
        PlayerProfileDto result = await handler.Handle(new GetPlayerProfileQuery(player.Id), CancellationToken.None);

        // Assert
        result.Nickname.Should().Be("Bolt");
        result.FullName.Should().Be("Usain Bolt");
        result.TotalMatches.Should().Be(2);
        result.Wins.Should().Be(1);
        result.Losses.Should().Be(1);
        result.GoalsFor.Should().Be(2); // From m1: 2, from m2: 0
        result.GoalsAgainst.Should().Be(4); // From m1: 1, from m2: 3
        result.WinRate.Should().Be(50.0);

        result.BestPartner.Should().NotBeNull();
        result.BestPartner!.Nickname.Should().Be("GoodP");
        result.BestPartner.Count.Should().Be(1);

        result.Nemesis.Should().NotBeNull();
        result.Nemesis!.Nickname.Should().Be("SlowOpp");
        result.Nemesis.Count.Should().Be(1);

        result.RecentMatches.Should().HaveCount(2);
        // m2 has later DatePlayed, so it should be first
        result.RecentMatches[0].Id.Should().Be(m2.Id);
        result.RecentMatches[1].Id.Should().Be(m1.Id);
    }
}
