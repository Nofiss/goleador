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

        return !success
            ? throw new Exception($"Reset password failed: {string.Join(", ", errors)}")
            : Unit.Value;
    }
}
