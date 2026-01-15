using MediatR;

namespace Goleador.Application.Users.Commands.LinkUserToPlayer;

public record LinkUserToPlayerCommand(string UserId, Guid? PlayerId) : IRequest<Unit>;
