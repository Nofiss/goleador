using MediatR;

namespace Goleador.Application.Players.Queries.GetGlobalRanking;

public record GetGlobalRankingQuery : IRequest<List<PlayerRankingDto>>;
