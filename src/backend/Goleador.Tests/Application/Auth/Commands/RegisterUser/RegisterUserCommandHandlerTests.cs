using FluentAssertions;
using Goleador.Application.Auth.Commands.RegisterUser;
using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using Goleador.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace Goleador.Tests.Application.Auth.Commands.RegisterUser;

public class RegisterUserCommandHandlerTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IIdentityService> _mockIdentityService;
    private readonly RegisterUserCommandHandler _handler;

    public RegisterUserCommandHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);

        _mockIdentityService = new Mock<IIdentityService>();

        _handler = new RegisterUserCommandHandler(_context, _mockIdentityService.Object);
    }

    [Fact]
    public async Task Handle_Should_Generate_Unique_Username_When_Default_Exists()
    {
        // Arrange
        var command = new RegisterUserCommand("mario.rossi@example.com", "Password123!", "Mario", "Rossi");

        // MRossi già esiste in Identity
        _mockIdentityService.Setup(s => s.ExistsByUsernameAsync("MRossi")).ReturnsAsync(true);
        // MRossi1 è libero
        _mockIdentityService.Setup(s => s.ExistsByUsernameAsync("MRossi1")).ReturnsAsync(false);

        _mockIdentityService.Setup(s => s.CreateUserAsync(command.Email, "MRossi1", command.Password))
            .ReturnsAsync((true, "user-id", Array.Empty<string>()));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be("RegistrationSuccessful");

        // Verifica che sia stato creato un utente con MRossi1
        _mockIdentityService.Verify(s => s.CreateUserAsync(command.Email, "MRossi1", command.Password), Times.Once());

        // Verifica che sia stato creato un Player con Nickname MRossi1
        var player = await _context.Players.FirstOrDefaultAsync(p => p.UserId == "user-id");
        player.Should().NotBeNull();
        player!.Nickname.Should().Be("MRossi1");
    }

    [Fact]
    public async Task Handle_Should_Generate_Username_Correctly_With_Single_Letter_LastName()
    {
        // Arrange
        var command = new RegisterUserCommand("m.r@example.com", "Password123!", "Mario", "R");

        // MR è libero
        _mockIdentityService.Setup(s => s.ExistsByUsernameAsync("MR")).ReturnsAsync(false);

        _mockIdentityService.Setup(s => s.CreateUserAsync(command.Email, "MR", command.Password))
            .ReturnsAsync((true, "user-id", Array.Empty<string>()));

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _mockIdentityService.Verify(s => s.CreateUserAsync(command.Email, "MR", command.Password), Times.Once());
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
