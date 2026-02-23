using FluentValidation.TestHelper;
using Goleador.Application.Auth.Commands.ResetPassword;

namespace Goleador.Tests.Application.Auth.Commands.ResetPassword;

public class ResetPasswordCommandValidatorTests
{
    readonly ResetPasswordCommandValidator _validator;

    public ResetPasswordCommandValidatorTests() => _validator = new ResetPasswordCommandValidator();

    [Theory]
    [InlineData("short")]
    [InlineData("nospecial1")]
    [InlineData("NoDigit!")]
    [InlineData("nouppercase1!")]
    [InlineData("NOLOWERCASE1!")]
    public void Should_Have_Error_When_Password_Is_Weak(string password)
    {
        var command = new ResetPasswordCommand("test@test.com", "valid-token", password);
        TestValidationResult<ResetPasswordCommand> result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.NewPassword);
    }

    [Fact]
    public void Should_Not_Have_Error_When_Command_Is_Valid()
    {
        var command = new ResetPasswordCommand("test@test.com", "valid-token", "StrongPass1!");
        TestValidationResult<ResetPasswordCommand> result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }
}
