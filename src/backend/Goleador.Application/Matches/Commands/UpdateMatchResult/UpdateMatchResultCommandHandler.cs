using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Matches.Commands.UpdateMatchResult;

public class UpdateMatchResultCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdateMatchResultCommand, Unit>
{
    public async Task<Unit> Handle(
        UpdateMatchResultCommand request,
        CancellationToken cancellationToken
    )
    {
        // 1. Recupera la partita
        Match match =
            await context.Matches.FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Match with ID {request.Id} not found.");

        // 2. Aggiorna tramite metodo di dominio
        match.SetResult(request.ScoreHome, request.ScoreAway);

        // Aggiorna tavolo (Se passato, altrimenti lascia quello che c'era o null)
        if (request.TableId.HasValue)
        {
            // Nota: Nel dominio Match dovresti esporre un metodo AssignTable(int tableId) 
            // per purezza, oppure usare reflection/internal set. 
            // Assumiamo che tu abbia aggiunto: public void AssignTable(int? tableId) { TableId = tableId; }
            // Oppure se usi proprietà private set, aggiungi il metodo nell'entità.

            // Esempio Entity Match:
            // public void AssignTable(int? tableId) => TableId = tableId;

            match.AssignTable(request.TableId);
        }

        // 3. Salva
        await context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
