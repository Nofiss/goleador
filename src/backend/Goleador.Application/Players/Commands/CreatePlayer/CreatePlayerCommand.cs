using MediatR;

namespace Goleador.Application.Players.Commands.CreatePlayer;

public record CreatePlayerCommand(string Nickname, string FirstName, string LastName, string Email)
    : IRequest<Guid>;
