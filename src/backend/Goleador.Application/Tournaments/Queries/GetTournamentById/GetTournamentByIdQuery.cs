using Goleador.Application.Common.Interfaces;

namespace Goleador.Application.Tournaments.Queries.GetTournamentById;

public record GetTournamentByIdQuery(Guid Id) : ICacheableQuery<TournamentDetailDto>
{
    public string CacheKey => $"TournamentDetail-{Id}";
    public TimeSpan? Expiration => TimeSpan.FromSeconds(30);
}
