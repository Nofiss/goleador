using System.Web;
using Goleador.Application.Common.Interfaces;
using MediatR;
using Microsoft.Extensions.Configuration;

namespace Goleador.Application.Auth.Commands.ForgotPassword;

public class ForgotPasswordCommandHandler(
    IIdentityService identityService,
    IEmailService emailService,
    IConfiguration configuration
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

        // In produzione l'URL base viene da appsettings (es. App:ClientUrl)
        var clientUrl = configuration["App:ClientUrl"] ?? "http://localhost:5173";
        var resetLink =
            $"{clientUrl.TrimEnd('/')}/reset-password?email={HttpUtility.UrlEncode(request.Email)}&token={encodedToken}";

        // 3. Invia Mail
        await emailService.SendEmailAsync(
            request.Email,
            "Reset Password Goleador",
            $"Clicca qui per resettare la password: {resetLink}"
        );

        return Unit.Value;
    }
}
