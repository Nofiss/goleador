using Goleador.Application.Common.Exceptions;
using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Auth.Commands.RegisterUser;

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
        // 1. Generazione Username Univoco
        string baseUsername =
            $"{char.ToUpper(request.FirstName[0])}{char.ToUpper(request.LastName[0])}{request.LastName[1..]}";
        string username = baseUsername;
        int counter = 1;

        while (await identityService.ExistsByUsernameAsync(username))
        {
            username = $"{baseUsername}{counter++}";
        }

        // Verifichiamo se esiste già un Player con questo nickname (che ora coincide con lo username generato)
        Player? existingPlayer = await context.Players.FirstOrDefaultAsync(
            p => p.Nickname == username,
            cancellationToken
        );

        if (existingPlayer != null && !string.IsNullOrEmpty(existingPlayer.UserId))
        {
            // Questo scenario è improbabile se identityService.ExistsByUsernameAsync funziona correttamente,
            // ma lo gestiamo per sicurezza.
            throw new InvalidOperationException(
                $"Lo username generato '{username}' è già associato a un altro utente."
            );
        }

        // 2. Crea Utente su Identity
        (var success, var userId, var errors) = await identityService.CreateUserAsync(
            request.Email,
            username,
            request.Password
        );

        if (!success)
        {
            // csharpsquid:S112 - Using ValidationException instead of generic Exception
            throw new ValidationException("Identity", errors);
        }

        if (existingPlayer != null)
        {
            existingPlayer.SetUser(userId);
            existingPlayer.UpdateDetails(request.FirstName, request.LastName, request.Email);
        }
        else
        {
            var player = new Player(
                username,
                request.FirstName,
                request.LastName,
                request.Email,
                userId
            );

            context.Players.Add(player);
        }

        await context.SaveChangesAsync(cancellationToken);

        return "RegistrationSuccessful";
    }
}
