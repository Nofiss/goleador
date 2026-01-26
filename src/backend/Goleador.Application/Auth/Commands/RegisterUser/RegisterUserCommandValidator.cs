using FluentValidation;
using Microsoft.Extensions.Configuration;

namespace Goleador.Application.Auth.Commands.RegisterUser;

public class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserCommandValidator(IConfiguration configuration)
    {
        RuleFor(v => v.Email)
            .NotEmpty()
            .WithMessage("L'email è obbligatoria.")
            .EmailAddress()
            .WithMessage("Formato email non valido.");

        RuleFor(v => v.Password)
            .NotEmpty()
            .MinimumLength(8)
            .WithMessage("La password deve essere di almeno 8 caratteri.")
            .Matches(@"[A-Z]")
            .WithMessage("La password deve contenere almeno una lettera maiuscola.")
            .Matches(@"[a-z]")
            .WithMessage("La password deve contenere almeno una lettera minuscola.")
            .Matches(@"[0-9]")
            .WithMessage("La password deve contenere almeno un numero.")
            .Matches(@"[\!\?\*\.]")
            .WithMessage("La password deve contenere almeno un carattere speciale (!?*.).");

        RuleFor(v => v.FirstName).NotEmpty();
        RuleFor(v => v.LastName).NotEmpty();

        var allowedDomains = configuration
            .GetSection("Security:AllowedEmailDomains")
            .Get<string[]>();

        if (allowedDomains != null && allowedDomains.Length != 0)
        {
            RuleFor(v => v.Email)
                .Must(email =>
                {
                    if (string.IsNullOrEmpty(email))
                    {
                        return false;
                    }

                    var parts = email.Split('@');
                    if (parts.Length != 2)
                    {
                        return false;
                    }

                    var domain = parts[1];

                    return allowedDomains.Contains(domain, StringComparer.OrdinalIgnoreCase);
                })
                .WithMessage(
                    $"La registrazione è riservata alle email aziendali (@{string.Join(", @", allowedDomains)})."
                );
        }
    }
}
