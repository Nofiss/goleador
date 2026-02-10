using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Goleador.Application.Tournaments.Commands.BulkAssignTable;

public class BulkAssignTableCommandHandler(IApplicationDbContext context, IMemoryCache cache)
    : IRequestHandler<BulkAssignTableCommand, Unit>
{
    public async Task<Unit> Handle(
        BulkAssignTableCommand request,
        CancellationToken cancellationToken
    )
    {
        var matches = await context.Matches
            .Where(m => m.TournamentId == request.TournamentId)
            .ToListAsync(cancellationToken);

        if (matches.Count == 0)
        {
            return Unit.Value;
        }

        int maxRound = matches.Max(m => m.Round);
        double splitRound = Math.Ceiling(maxRound / 2.0);

        var targetMatches = request.Phase switch
        {
            TournamentPhase.All => matches,
            TournamentPhase.FirstLeg => matches.Where(m => m.Round <= splitRound),
            TournamentPhase.SecondLeg => matches.Where(m => m.Round > splitRound),
            _ => throw new ArgumentOutOfRangeException(nameof(request.Phase), "Invalid tournament phase")
        };

        foreach (var match in targetMatches)
        {
            match.AssignTable(request.TableId);
        }

        await context.SaveChangesAsync(cancellationToken);

        // Optimization Bolt ⚡: Invalidate cache when tables are bulk assigned
        cache.Remove($"TournamentDetail-{request.TournamentId}");

        return Unit.Value;
    }
}
