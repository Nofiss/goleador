using MediatR;

namespace Goleador.Application.Tournaments.Commands.AddLateTeam;

public record AddLateTeamCommand(
    Guid TournamentId,
    string TeamName,
    List<Guid> PlayerIds
) : IRequest<Guid>;
