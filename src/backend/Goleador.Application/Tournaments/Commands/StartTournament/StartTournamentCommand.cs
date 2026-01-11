using MediatR;

namespace Goleador.Application.Tournaments.Commands.StartTournament;

public record StartTournamentCommand(Guid TournamentId) : IRequest<Unit>;
