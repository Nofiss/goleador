using FluentValidation;

namespace Goleador.Application.Auth.Commands.ResetPassword;

public class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordCommandValidator()
    {
        RuleFor(v => v.Email)
            .NotEmpty().WithMessage("L'email è obbligatoria.")
            .EmailAddress().WithMessage("L'indirizzo email non è valido.");

        RuleFor(v => v.Token)
            .NotEmpty().WithMessage("Il token è obbligatorio.");

        RuleFor(v => v.NewPassword)
            .NotEmpty().WithMessage("La nuova password è obbligatoria.")
            .MinimumLength(8).WithMessage("La password deve essere di almeno 8 caratteri.")
            .Matches(@"[A-Z]").WithMessage("La password deve contenere almeno una lettera maiuscola.")
            .Matches(@"[a-z]").WithMessage("La password deve contenere almeno una lettera minuscola.")
            .Matches(@"[0-9]").WithMessage("La password deve contenere almeno un numero.")
            .Matches(@"[\!\?\*\.]").WithMessage("La password deve contenere almeno un carattere speciale (!?*.).");
    }
}
