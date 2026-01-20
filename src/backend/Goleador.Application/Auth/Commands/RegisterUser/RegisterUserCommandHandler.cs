using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

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
        Player? existingPlayer = await context.Players.FirstOrDefaultAsync(
            p => p.Nickname == request.Nickname,
            cancellationToken
        );

        if (existingPlayer != null && !string.IsNullOrEmpty(existingPlayer.UserId))
        {
            throw new InvalidOperationException(
                $"Il nickname '{request.Nickname}' è già in uso da un altro utente registrato."
            );
        }

        // 1. Crea Utente su Identity
        (var success, var userId, var errors) = await identityService.CreateUserAsync(
            request.Email,
            request.Password
        );

        if (!success)
        {
            throw new Exception(string.Join(",", errors));
        }

        if (existingPlayer != null)
        {
            existingPlayer.SetUser(userId);
            existingPlayer.UpdateDetails(request.FirstName, request.LastName, request.Email);
        }
        else
        {
            var player = new Player(
                request.Nickname,
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
