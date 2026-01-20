using System.Web;
using Goleador.Application.Common.Interfaces;
using MediatR;

namespace Goleador.Application.Auth.Commands.ForgotPassword;

public class ForgotPasswordCommandHandler(
    IIdentityService identityService,
    IEmailService emailService
) : IRequestHandler<ForgotPasswordCommand, Unit>
{
    public async Task<Unit> Handle(
        ForgotPasswordCommand request,
        CancellationToken cancellationToken
    )
    {
        // 1. Chiedi il token al servizio (senza toccare UserManager)
        var token = await identityService.GeneratePasswordResetTokenAsync(request.Email);

        // Se l'utente non esiste (token null), non fare nulla ma ritorna successo per sicurezza
        if (token == null)
        {
            return Unit.Value;
        }

        // 2. Crea Link
        // Nota: Identity genera token con caratteri speciali (+, /), è FONDAMENTALE fare l'encode
        var encodedToken = HttpUtility.UrlEncode(token);

        // In produzione l'URL base dovrebbe venire da appsettings (es. builder.Configuration["AppUrl"])
        var resetLink =
            $"http://localhost:5173/reset-password?email={request.Email}&token={encodedToken}";

        // 3. Invia Mail
        await emailService.SendEmailAsync(
            request.Email,
            "Reset Password Goleador",
            $"Clicca qui per resettare la password: {resetLink}"
        );

        return Unit.Value;
    }
}
