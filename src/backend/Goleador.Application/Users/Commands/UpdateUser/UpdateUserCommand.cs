using MediatR;

namespace Goleador.Application.Users.Commands.UpdateUser;

public record UpdateUserCommand(string UserId, string Email, string Username) : IRequest<Unit>;
