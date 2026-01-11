using AutoMapper;
using AutoMapper.QueryableExtensions;
using Goleador.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Players.Queries.GetPlayers;

public record GetPlayersQuery : IRequest<List<PlayerDto>>;

public class GetPlayersQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetPlayersQuery, List<PlayerDto>>
{
    public async Task<List<PlayerDto>> Handle(
        GetPlayersQuery request,
        CancellationToken cancellationToken
    )
    {
        // ProjectTo è potentissimo: trasforma la query SQL per selezionare SOLO i campi che servono al DTO.
        // Non scarica tutto il Player per poi mapparlo in memoria, fa tutto sul DB.
        return await context
            .Players.AsNoTracking() // Importante per le performance in lettura
            .OrderBy(p => p.Nickname)
            .ProjectTo<PlayerDto>(mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
