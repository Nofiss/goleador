using MediatR;

namespace Goleador.Application.Tournaments.Commands.GenerateBalancedTeams;

public record GenerateBalancedTeamsCommand(Guid TournamentId) : IRequest<Unit>;
