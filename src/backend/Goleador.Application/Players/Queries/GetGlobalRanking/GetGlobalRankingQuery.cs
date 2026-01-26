using Goleador.Application.Common.Interfaces;
using MediatR;

namespace Goleador.Application.Players.Queries.GetGlobalRanking;

public record GetGlobalRankingQuery : ICacheableQuery<List<PlayerRankingDto>>
{
    public string CacheKey => "GlobalRanking";
    public TimeSpan? Expiration => TimeSpan.FromMinutes(10);
}
