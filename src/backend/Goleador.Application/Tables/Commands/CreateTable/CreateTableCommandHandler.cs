using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;

namespace Goleador.Application.Tables.Commands.CreateTable;

public class CreateTableCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreateTableCommand, int>
{
    public async Task<int> Handle(CreateTableCommand request, CancellationToken token)
    {
        var entity = new Table(request.Name, request.Location);

        context.Tables.Add(entity);
        await context.SaveChangesAsync(token);
        return entity.Id;
    }
}
