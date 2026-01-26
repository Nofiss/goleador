using FluentValidation.TestHelper;
using Goleador.Application.Auth.Commands.RegisterUser;
using Microsoft.Extensions.Configuration;
using Moq;

namespace Goleador.Tests.Application.Auth.Commands.RegisterUser;

public class RegisterUserCommandValidatorTests
{
    private readonly RegisterUserCommandValidator _validator;

    public RegisterUserCommandValidatorTests()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Security:AllowedEmailDomains:0"] = "test.com"
            })
            .Build();
        _validator = new RegisterUserCommandValidator(configuration);
    }

    [Theory]
    [InlineData("short")]
    [InlineData("nospecial1")]
    [InlineData("NoDigit!")]
    [InlineData("nouppercase1!")]
    [InlineData("NOLOWERCASE1!")]
    public void Should_Have_Error_When_Password_Is_Weak(string password)
    {
        var command = new RegisterUserCommand("test@test.com", password, "FirstName", "LastName");
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Should_Not_Have_Error_When_Password_Is_Strong()
    {
        var command = new RegisterUserCommand("test@test.com", "StrongPass1!", "FirstName", "LastName");
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.Password);
    }
}
