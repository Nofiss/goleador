using MediatR;

namespace Goleador.Application.Tournaments.Queries.GetTournamentById;

public record GetTournamentByIdQuery(Guid Id) : IRequest<TournamentDetailDto>;
