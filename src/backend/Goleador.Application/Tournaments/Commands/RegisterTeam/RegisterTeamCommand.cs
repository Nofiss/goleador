using MediatR;

namespace Goleador.Application.Tournaments.Commands.RegisterTeam;

public record RegisterTeamCommand(Guid TournamentId, string TeamName, List<Guid> PlayerIds)
    : IRequest<Guid>;
