using FluentAssertions;
using Goleador.Application.Common.Interfaces;
using Goleador.Application.Players.Queries.GetPendingMatches;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using Goleador.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace Goleador.Tests.Application.Players.Queries.GetPendingMatches;

public class GetMyPendingMatchesQueryHandlerTests
{
    [Fact]
    public async Task Handle_Should_Return_Only_Scheduled_Matches_For_Current_User()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new ApplicationDbContext(options);

        var userId = "test-user-id";
        var player = new Player("Me", "My", "Self", "me@example.com", userId);
        var opponent = new Player("Opponent", "His", "Name", "him@example.com");
        context.Players.AddRange(player, opponent);

        var tournament = new Tournament("Champions", TournamentType.RoundRobin, 1, false, null, null);
        context.Tournaments.Add(tournament);

        var table = new Table("Table 1", "Main Room");
        context.Tables.Add(table);
        await context.SaveChangesAsync(); // Need to save to get table Id

        // Match 1: Scheduled, current user is participant
        var m1 = new Goleador.Domain.Entities.Match(0, 0, tournament.Id, table.Id, 1);
        m1.AddParticipant(player.Id, Side.Home);
        m1.AddParticipant(opponent.Id, Side.Away);

        // Match 2: Played, current user is participant
        var m2 = new Goleador.Domain.Entities.Match(0, 0, tournament.Id, table.Id, 2);
        m2.AddParticipant(player.Id, Side.Home);
        m2.AddParticipant(opponent.Id, Side.Away);
        m2.SetResult(3, 1);

        // Match 3: Scheduled, current user is NOT participant
        var otherPlayer1 = new Player("Other1", "O1", "O1", "o1@e.c");
        var otherPlayer2 = new Player("Other2", "O2", "O2", "o2@e.c");
        context.Players.AddRange(otherPlayer1, otherPlayer2);
        var m3 = new Goleador.Domain.Entities.Match(0, 0, tournament.Id, table.Id, 3);
        m3.AddParticipant(otherPlayer1.Id, Side.Home);
        m3.AddParticipant(otherPlayer2.Id, Side.Away);

        context.Matches.AddRange(m1, m2, m3);
        await context.SaveChangesAsync();

        var mockCurrentUserService = new Mock<ICurrentUserService>();
        mockCurrentUserService.Setup(m => m.UserId).Returns(userId);

        var handler = new GetMyPendingMatchesQueryHandler(context, mockCurrentUserService.Object);

        // Act
        var result = await handler.Handle(new GetMyPendingMatchesQuery(), CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result[0].Id.Should().Be(m1.Id);
        result[0].TournamentName.Should().Be("Champions");
        result[0].OpponentName.Should().Be("Opponent");
        result[0].Round.Should().Be(1);
        result[0].TableName.Should().Be("Table 1");
    }

    [Fact]
    public async Task Handle_Should_Throw_UnauthorizedAccessException_When_No_Current_User()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new ApplicationDbContext(options);

        var mockCurrentUserService = new Mock<ICurrentUserService>();
        mockCurrentUserService.Setup(m => m.UserId).Returns((string?)null);

        var handler = new GetMyPendingMatchesQueryHandler(context, mockCurrentUserService.Object);

        // Act
        var act = () => handler.Handle(new GetMyPendingMatchesQuery(), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task Handle_Should_Throw_KeyNotFoundException_When_Player_Not_Found()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new ApplicationDbContext(options);

        var mockCurrentUserService = new Mock<ICurrentUserService>();
        mockCurrentUserService.Setup(m => m.UserId).Returns("non-existent-user");

        var handler = new GetMyPendingMatchesQueryHandler(context, mockCurrentUserService.Object);

        // Act
        var act = () => handler.Handle(new GetMyPendingMatchesQuery(), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }
}
