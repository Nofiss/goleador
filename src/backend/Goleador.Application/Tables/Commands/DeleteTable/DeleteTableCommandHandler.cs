using System;
using System.Collections.Generic;
using System.Text;
using Goleador.Application.Common.Interfaces;
using MediatR;

namespace Goleador.Application.Tables.Commands.DeleteTable;

public class DeleteTableCommandHandler(IApplicationDbContext context)
    : IRequestHandler<DeleteTableCommand, Unit>
{
    public async Task<Unit> Handle(DeleteTableCommand request, CancellationToken token)
    {
        var entity = await context.Tables.FindAsync(new object[] { request.Id }, token);
        if (entity == null)
            throw new KeyNotFoundException("Table not found");

        // Nota: Se ci sono partite collegate, EF Core lancerà un'eccezione FK.
        // In un'app reale faresti Soft Delete (IsActive = false).
        // Per ora facciamo hard delete, gestendo l'errore nel frontend.
        context.Tables.Remove(entity);
        await context.SaveChangesAsync(token);
        return Unit.Value;
    }
}
