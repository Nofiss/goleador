using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Tournaments.Commands.UpdateTournamentRules;

public class UpdateTournamentRulesCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdateTournamentRulesCommand>
{
    public async Task Handle(UpdateTournamentRulesCommand request, CancellationToken cancellationToken)
    {
        Tournament tournament = await context.Tournaments
            .FirstOrDefaultAsync(t => t.Id == request.TournamentId, cancellationToken)
            ?? throw new KeyNotFoundException("Tournament not found");

        tournament.UpdateRules(request.Rules);

        await context.SaveChangesAsync(cancellationToken);
    }
}
