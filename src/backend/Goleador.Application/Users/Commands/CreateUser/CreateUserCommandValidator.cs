using FluentValidation;

namespace Goleador.Application.Users.Commands.CreateUser;

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(v => v.Email)
            .NotEmpty().WithMessage("L'email è obbligatoria.")
            .EmailAddress().WithMessage("L'indirizzo email non è valido.");

        RuleFor(v => v.Username)
            .NotEmpty().WithMessage("Lo username è obbligatorio.")
            .MinimumLength(3).WithMessage("Lo username deve essere di almeno 3 caratteri.");

        RuleFor(v => v.Password)
            .NotEmpty().WithMessage("La password è obbligatoria.")
            .MinimumLength(6).WithMessage("La password deve essere di almeno 6 caratteri.");
    }
}
