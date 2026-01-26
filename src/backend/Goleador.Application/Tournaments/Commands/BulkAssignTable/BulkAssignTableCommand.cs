using Goleador.Domain.Enums;
using MediatR;

namespace Goleador.Application.Tournaments.Commands.BulkAssignTable;

public record BulkAssignTableCommand(
    Guid TournamentId,
    int? TableId,
    TournamentPhase Phase
) : IRequest<Unit>;
