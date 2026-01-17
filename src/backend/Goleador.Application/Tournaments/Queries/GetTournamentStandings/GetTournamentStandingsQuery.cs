using MediatR;

namespace Goleador.Application.Tournaments.Queries.GetTournamentStandings;

public record GetTournamentStandingsQuery(Guid TournamentId)
    : IRequest<List<TournamentStandingDto>>;
