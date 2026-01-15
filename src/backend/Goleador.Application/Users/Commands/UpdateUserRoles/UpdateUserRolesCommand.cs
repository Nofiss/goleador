using MediatR;

namespace Goleador.Application.Users.Commands.UpdateUserRoles;

public record UpdateUserRolesCommand(string UserId, List<string> NewRoles) : IRequest<Unit>;
