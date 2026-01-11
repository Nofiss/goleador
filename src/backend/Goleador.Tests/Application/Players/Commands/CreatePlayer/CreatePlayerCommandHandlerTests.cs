using FluentAssertions;
using Goleador.Application.Common.Interfaces;
using Goleador.Application.Players.Commands.CreatePlayer;
using Goleador.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace Goleador.Tests.Application.Players.Commands.CreatePlayer;

public class CreatePlayerCommandHandlerTests
{
    readonly Mock<IApplicationDbContext> _mockContext;
    readonly Mock<DbSet<Player>> _mockSet;
    readonly CreatePlayerCommandHandler _handler;

    public CreatePlayerCommandHandlerTests()
    {
        // 1. Mock del DbSet (la tabella)
        _mockSet = new Mock<DbSet<Player>>();

        // 2. Mock del Context (il database)
        _mockContext = new Mock<IApplicationDbContext>();

        // Quando qualcuno chiede context.Players, restituisci il mio mockSet
        _mockContext.Setup(m => m.Players).Returns(_mockSet.Object);

        // 3. Istanza dell'handler con il mock
        _handler = new CreatePlayerCommandHandler(_mockContext.Object);
    }

    [Fact]
    public async Task Handle_Should_Create_Player_And_Save_To_Db()
    {
        // Arrange
        var command = new CreatePlayerCommand(
            "TheBomber",
            "Francesco",
            "Totti",
            "francesco@asroma.it"
        );

        // Act
        Guid result = await _handler.Handle(command, CancellationToken.None);

        // Assert

        // 1. Verifica che sia stato restituito un Guid valido
        result.Should().NotBeEmpty();

        // 2. Verifica che il metodo Add sia stato chiamato ESATTAMENTE una volta con QUALSIASI Player
        _mockSet.Verify(m => m.Add(It.IsAny<Player>()), Times.Once());

        // 3. Verifica che il metodo Add sia stato chiamato con i dati corretti (Ispezione)
        _mockSet.Verify(
            m =>
                m.Add(
                    It.Is<Player>(p => p.Nickname == command.Nickname && p.Email == command.Email)
                ),
            Times.Once()
        );

        // 4. Verifica che sia stato chiamato SaveChangesAsync
        _mockContext.Verify(m => m.SaveChangesAsync(CancellationToken.None), Times.Once());
    }
}
