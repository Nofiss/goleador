using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;

namespace Goleador.Application.Tables.Commands.CreateTable;

public class CreateTableCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreateTableCommand, int>
{
    // [csharpsquid:S927] Parameter name must match the interface declaration
    public async Task<int> Handle(CreateTableCommand request, CancellationToken cancellationToken)
    {
        var entity = new Table(request.Name, request.Location);

        context.Tables.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
