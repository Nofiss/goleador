using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;
using Microsoft.Extensions.Caching.Memory;

namespace Goleador.Application.Players.Commands.CreatePlayer;

public class CreatePlayerCommandHandler(IApplicationDbContext context, IMemoryCache cache)
    : IRequestHandler<CreatePlayerCommand, Guid>
{
    public async Task<Guid> Handle(CreatePlayerCommand request, CancellationToken cancellationToken)
    {
        // 1. Creazione dell'entità di Dominio (qui scatta la validazione interna del costruttore Player)
        var entity = new Player(
            request.Nickname,
            request.FirstName,
            request.LastName,
            request.Email
        );

        // 2. Aggiunta al contesto
        context.Players.Add(entity);

        // 3. Salvataggio (EF Core converte in SQL INSERT)
        await context.SaveChangesAsync(cancellationToken);

        // Optimization Bolt ⚡: Invalidate players list cache when a new player is created
        cache.Remove("PlayersList");

        // 4. Ritorna l'ID generato
        return entity.Id;
    }
}
