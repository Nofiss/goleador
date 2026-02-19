using Goleador.Application.Common.Exceptions;
using Goleador.Application.Common.Interfaces;
using MediatR;

namespace Goleador.Application.Users.Commands.DeleteUser;

public class DeleteUserCommandHandler(
    IIdentityService identityService,
    ICurrentUserService currentUser
) : IRequestHandler<DeleteUserCommand, Unit>
{
    public async Task<Unit> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        if (request.UserId == currentUser.UserId)
        {
            throw new ForbiddenAccessException("Non puoi eliminare il tuo stesso account.");
        }

        (var success, var errors) = await identityService.DeleteUserAsync(request.UserId);

        if (!success)
        {
            // csharpsquid:S112 - Using ValidationException instead of generic Exception
            throw new ValidationException("Identity", errors);
        }

        return Unit.Value;
    }
}
