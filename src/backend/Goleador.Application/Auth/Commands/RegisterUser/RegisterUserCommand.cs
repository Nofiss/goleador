using MediatR;

namespace Goleador.Application.Auth.Commands.Register;

public record RegisterUserCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string Nickname
) : IRequest<string>;
