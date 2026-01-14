using MediatR;

namespace Goleador.Application.Tournaments.Commands.JoinTournament;

public record JoinTournamentCommand(Guid TournamentId, string TeamName) : IRequest<Guid>;
