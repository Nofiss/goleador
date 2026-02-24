using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using Goleador.Domain.ValueObjects;
using MediatR;
using Microsoft.Extensions.Caching.Memory;

namespace Goleador.Application.Tournaments.Commands.CreateTournament;

public class CreateTournamentCommandHandler(IApplicationDbContext context, IMemoryCache cache)
    : IRequestHandler<CreateTournamentCommand, Guid>
{
    public async Task<Guid> Handle(
        CreateTournamentCommand request,
        CancellationToken cancellationToken
    )
    {
        var rules = new TournamentScoringRules(
            request.PointsForWin,
            request.PointsForDraw,
            request.PointsForLoss,
            request.GoalThreshold,
            request.GoalThresholdBonus,
            request.EnableTenZeroBonus,
            request.TenZeroBonus
        );

        var entity = new Tournament(
            request.Name,
            request.Type,
            request.TeamSize,
            request.HasReturnMatches,
            request.Rules,
            rules
        );

        if (request.Cards != null)
        {
            foreach (CreateTournamentCardDto card in request.Cards)
            {
                entity.AddCardDefinition(card.Name, card.Description, card.Effect);
            }
        }

        context.Tournaments.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        // Optimization Bolt ⚡: Invalidate tournaments list cache when a new tournament is created
        cache.Remove("TournamentsList");

        return entity.Id;
    }
}
