using MediatR;

namespace Goleador.Application.Tournaments.Commands.RegisterPlayer;

public record RegisterPlayerCommand(Guid TournamentId, Guid PlayerId) : IRequest;
