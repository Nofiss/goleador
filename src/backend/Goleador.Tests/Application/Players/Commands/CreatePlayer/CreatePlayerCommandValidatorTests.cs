using FluentValidation.TestHelper;
using Goleador.Application.Players.Commands.CreatePlayer;

namespace Goleador.Tests.Application.Players.Commands.CreatePlayer;

public class CreatePlayerCommandValidatorTests
{
    readonly CreatePlayerCommandValidator _validator;

    public CreatePlayerCommandValidatorTests() => _validator = new CreatePlayerCommandValidator();

    [Fact]
    public void Should_Have_Error_When_Nickname_Is_Empty()
    {
        // Arrange
        var command = new CreatePlayerCommand("", "Mario", "Rossi", "mario@test.com");

        // Act
        TestValidationResult<CreatePlayerCommand> result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Nickname);
    }

    [Fact]
    public void Should_Have_Error_When_Email_Is_Invalid()
    {
        // Arrange
        var command = new CreatePlayerCommand("Bomber", "Mario", "Rossi", "email-non-valida");

        // Act
        TestValidationResult<CreatePlayerCommand> result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Should_Not_Have_Error_When_Command_Is_Valid()
    {
        // Arrange
        var command = new CreatePlayerCommand("Bomber", "Mario", "Rossi", "mario@test.com");

        // Act
        TestValidationResult<CreatePlayerCommand> result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}
