using MediatR;

namespace Goleador.Application.Players.Queries.GetPendingMatches;

public record GetMyPendingMatchesQuery : IRequest<List<PendingMatchDto>>;
