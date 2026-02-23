using Goleador.Application.Common.Interfaces;

namespace Goleador.Application.Tournaments.Queries.GetTournamentStandings;

public record GetTournamentStandingsQuery(Guid TournamentId)
    : ICacheableQuery<List<TournamentStandingDto>>
{
    public string CacheKey => $"Standings-{TournamentId}";
    public TimeSpan? Expiration => TimeSpan.FromMinutes(5);
}
