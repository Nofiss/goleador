using FluentValidation;

namespace Goleador.Application.Users.Commands.UpdateUser;

public class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator()
    {
        RuleFor(v => v.UserId)
            .NotEmpty().WithMessage("L'ID utente è obbligatorio.");

        RuleFor(v => v.Email)
            .NotEmpty().WithMessage("L'email è obbligatoria.")
            .EmailAddress().WithMessage("L'indirizzo email non è valido.");

        RuleFor(v => v.Username)
            .NotEmpty().WithMessage("Lo username è obbligatorio.")
            .MinimumLength(3).WithMessage("Lo username deve essere di almeno 3 caratteri.");
    }
}
