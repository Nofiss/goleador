using Goleador.Application.Common.Exceptions;
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
            // csharpsquid:S112 - Using ValidationException instead of generic Exception
            throw new ValidationException("Identity", errors);
        }

        return Unit.Value;
    }
}
