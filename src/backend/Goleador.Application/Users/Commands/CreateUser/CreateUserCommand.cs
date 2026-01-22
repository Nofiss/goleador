using MediatR;

namespace Goleador.Application.Users.Commands.CreateUser;

public record CreateUserCommand(string Email, string Username, string Password) : IRequest<string>;
