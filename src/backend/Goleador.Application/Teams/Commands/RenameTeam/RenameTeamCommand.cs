using MediatR;

namespace Goleador.Application.Teams.Commands.RenameTeam;

public record RenameTeamCommand(Guid TeamId, string NewName) : IRequest<Unit>;
