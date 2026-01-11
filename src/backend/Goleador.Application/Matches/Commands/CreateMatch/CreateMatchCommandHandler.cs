using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using MediatR;

namespace Goleador.Application.Matches.Commands.CreateMatch;

public class CreateMatchCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreateMatchCommand, Guid>
{
    public async Task<Guid> Handle(CreateMatchCommand request, CancellationToken cancellationToken)
    {
        // 1. Crea la partita
        var match = new Match(request.ScoreHome, request.ScoreAway);

        // 2. Aggiungi i partecipanti
        match.AddParticipant(request.PlayerHomeId, Side.Home);
        match.AddParticipant(request.PlayerAwayId, Side.Away);

        // 3. Salva
        context.Matches.Add(match);
        await context.SaveChangesAsync(cancellationToken);

        return match.Id;
    }
}
