using FluentValidation;

namespace Goleador.Application.Players.Commands.CreatePlayer;

public class CreatePlayerCommandValidator : AbstractValidator<CreatePlayerCommand>
{
    public CreatePlayerCommandValidator()
    {
        RuleFor(v => v.Nickname)
            .NotEmpty()
            .WithMessage("Nickname is required.")
            .MaximumLength(50)
            .WithMessage("Nickname must not exceed 50 characters.");

        RuleFor(v => v.Email)
            .NotEmpty()
            .WithMessage("Email is required.")
            .EmailAddress()
            .WithMessage("Email is not valid.");

        RuleFor(v => v.FirstName).NotEmpty().MaximumLength(100);

        RuleFor(v => v.LastName).NotEmpty().MaximumLength(100);
    }
}
