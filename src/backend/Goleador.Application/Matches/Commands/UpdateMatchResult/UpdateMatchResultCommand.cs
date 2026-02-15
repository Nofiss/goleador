using MediatR;

namespace Goleador.Application.Matches.Commands.UpdateMatchResult;

public record UpdateMatchResultCommand(
    Guid Id,
    int ScoreHome,
    int ScoreAway,
    int? TableId,
    string RowVersion,
    List<MatchCardUsageCommandDto>? UsedCards = null
) : IRequest<Unit>;

public record MatchCardUsageCommandDto(Guid CardDefinitionId, Guid TeamId);
