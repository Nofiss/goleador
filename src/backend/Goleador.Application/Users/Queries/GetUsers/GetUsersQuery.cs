using MediatR;

namespace Goleador.Application.Users.Queries.GetUsers;

public record GetUsersQuery : IRequest<List<UserDto>>;
