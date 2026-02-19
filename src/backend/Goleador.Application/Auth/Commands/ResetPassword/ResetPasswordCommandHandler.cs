using Goleador.Application.Common.Exceptions;
using Goleador.Application.Common.Interfaces;
using MediatR;

namespace Goleador.Application.Auth.Commands.ResetPassword;

public class ResetPasswordCommandHandler(IIdentityService identityService)
    : IRequestHandler<ResetPasswordCommand, Unit>
{
    public async Task<Unit> Handle(
        ResetPasswordCommand request,
        CancellationToken cancellationToken
    )
    {
        // Delega tutto al servizio infrastrutturale
        (var success, var errors) = await identityService.ResetPasswordAsync(
            request.Email,
            request.Token,
            request.NewPassword
        );

        // csharpsquid:S112 - Using ValidationException instead of generic Exception
        return !success ? throw new ValidationException("Identity", errors) : Unit.Value;
    }
}
