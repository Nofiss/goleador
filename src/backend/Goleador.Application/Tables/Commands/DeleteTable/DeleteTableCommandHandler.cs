using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;

namespace Goleador.Application.Tables.Commands.DeleteTable;

public class DeleteTableCommandHandler(IApplicationDbContext context)
    : IRequestHandler<DeleteTableCommand, Unit>
{
    // csharpsquid:S927 - Rename parameter 'token' to 'cancellationToken' to match the interface declaration.
    public async Task<Unit> Handle(DeleteTableCommand request, CancellationToken cancellationToken)
    {
        Table? entity = await context.Tables.FindAsync([request.Id], cancellationToken) ?? throw new KeyNotFoundException("Table not found");

        // Nota: Se ci sono partite collegate, EF Core lancerà un'eccezione FK.
        // In un'app reale faresti Soft Delete (IsActive = false).
        // Per ora facciamo hard delete, gestendo l'errore nel frontend.
        context.Tables.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
