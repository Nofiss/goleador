using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;

namespace Goleador.Application.Auth.Commands.Register;

public class RegisterUserCommandHandler(
    IApplicationDbContext context,
    IIdentityService identityService
) : IRequestHandler<RegisterUserCommand, string>
{
    public async Task<string> Handle(
        RegisterUserCommand request,
        CancellationToken cancellationToken
    )
    {
        // 1. Crea Utente su Identity
        (var success, var userId, var errors) = await identityService.CreateUserAsync(
            request.Email,
            request.Password
        );

        if (!success)
        {
            throw new Exception(string.Join(",", errors));
        }

        // 2. Crea Player su Domain collegato all'User
        var player = new Player(
            request.Nickname,
            request.FirstName,
            request.LastName,
            request.Email,
            userId
        );

        context.Players.Add(player);
        await context.SaveChangesAsync(cancellationToken);

        // 3. (Opzionale) Genera e ritorna il Token JWT qui, oppure ritorna Unit e fai fare login al frontend
        return "RegistrationSuccessful";
    }
}
