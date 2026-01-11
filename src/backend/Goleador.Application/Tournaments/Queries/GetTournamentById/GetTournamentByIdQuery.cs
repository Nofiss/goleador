using AutoMapper;
using AutoMapper.QueryableExtensions;
using Goleador.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Tournaments.Queries.GetTournamentById;

public record GetTournamentByIdQuery(Guid Id) : IRequest<TournamentDetailDto>;

public class GetTournamentByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetTournamentByIdQuery, TournamentDetailDto>
{
    public async Task<TournamentDetailDto> Handle(
        GetTournamentByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        TournamentDetailDto tournament =
            await context
                .Tournaments.AsNoTracking()
                .Where(t => t.Id == request.Id)
                .ProjectTo<TournamentDetailDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken)
            ?? throw new KeyNotFoundException("Tournament not found");

        return tournament;
    }
}
