using Goleador.Domain.Enums;

namespace Goleador.Application.Tournaments.Commands.BulkAssignTable;

public record BulkAssignTableRequest(int? TableId, TournamentPhase Phase);
