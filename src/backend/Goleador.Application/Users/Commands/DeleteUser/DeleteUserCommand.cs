using MediatR;

namespace Goleador.Application.Users.Commands.DeleteUser;

public record DeleteUserCommand(string UserId) : IRequest<Unit>;
