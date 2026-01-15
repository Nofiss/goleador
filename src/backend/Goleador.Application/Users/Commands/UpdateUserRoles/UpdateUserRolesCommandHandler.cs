using Goleador.Application.Common.Interfaces;
using MediatR;

namespace Goleador.Application.Users.Commands.UpdateUserRoles;

public class UpdateUserRolesCommandHandler(
    IIdentityService identityService,
    ICurrentUserService currentUser
) : IRequestHandler<UpdateUserRolesCommand, Unit>
{
    public async Task<Unit> Handle(
        UpdateUserRolesCommand request,
        CancellationToken cancellationToken
    )
    {
        if (request.UserId == currentUser.UserId)
        {
            throw new InvalidOperationException("Non puoi modificare i tuoi permessi da solo.");
        }

        (var success, var errors) = await identityService.UpdateUserRolesAsync(
            request.UserId,
            [.. request.NewRoles]
        );

        return !success ? throw new Exception(string.Join(", ", errors)) : Unit.Value;
    }
}
