using Goleador.Application.Common.Interfaces;
using MediatR;

namespace Goleador.Application.Users.Commands.UpdateUser;

public class UpdateUserCommandHandler(IIdentityService identityService) : IRequestHandler<UpdateUserCommand, Unit>
{
    public async Task<Unit> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        (var success, var errors) = await identityService.UpdateUserDetailsAsync(
            request.UserId,
            request.Email,
            request.Username
        );

        if (!success)
        {
            throw new Exception(string.Join(", ", errors));
        }

        return Unit.Value;
    }
}
