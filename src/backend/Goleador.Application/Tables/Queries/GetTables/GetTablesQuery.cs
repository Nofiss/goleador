using AutoMapper;
using AutoMapper.QueryableExtensions;
using Goleador.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Tables.Queries.GetTables;

public record GetTablesQuery : IRequest<List<TableDto>>;

public class GetTablesQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetTablesQuery, List<TableDto>>
{
    public async Task<List<TableDto>> Handle(
        GetTablesQuery request,
        CancellationToken cancellationToken
    )
    {
        return await context
            .Tables.AsNoTracking()
            .OrderBy(t => t.Name)
            .ProjectTo<TableDto>(mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
