using Goleador.Application.Common.Interfaces;
using MediatR;

namespace Goleador.Application.Users.Commands.CreateUser;

public class CreateUserCommandHandler(IIdentityService identityService) : IRequestHandler<CreateUserCommand, string>
{
    public async Task<string> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        (var success, var userId, var errors) = await identityService.CreateUserByAdminAsync(
            request.Email,
            request.Username,
            request.Password
        );

        return !success ? throw new Exception(string.Join(", ", errors)) : userId;
    }
}
