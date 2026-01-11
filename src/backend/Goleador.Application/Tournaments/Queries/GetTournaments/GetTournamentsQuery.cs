using AutoMapper;
using AutoMapper.QueryableExtensions;
using Goleador.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Tournaments.Queries.GetTournaments;

public record GetTournamentsQuery : IRequest<List<TournamentDto>>;

public class GetTournamentsQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetTournamentsQuery, List<TournamentDto>>
{
    public async Task<List<TournamentDto>> Handle(
        GetTournamentsQuery request,
        CancellationToken cancellationToken
    )
    {
        return await context
            .Tournaments.AsNoTracking()
            .OrderByDescending(t => t.Status) // Prima Attivi, poi Setup, poi Finiti (logica semplice)
            .ProjectTo<TournamentDto>(mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
