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
            throw new InvalidOperationException("Non puoi eliminare il tuo stesso account.");
        }

        (var success, var errors) = await identityService.DeleteUserAsync(request.UserId);

        if (!success)
        {
            throw new Exception(string.Join(", ", errors));
        }

        return Unit.Value;
    }
}
