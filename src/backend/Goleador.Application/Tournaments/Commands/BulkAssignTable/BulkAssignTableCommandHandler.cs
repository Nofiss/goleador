using Goleador.Application.Common.Exceptions;
using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
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
        List<Match> matches = await context.Matches
            .Where(m => m.TournamentId == request.TournamentId)
            .ToListAsync(cancellationToken);

        if (matches.Count == 0)
        {
            return Unit.Value;
        }

        var maxRound = matches.Max(m => m.Round);
        var splitRound = Math.Ceiling(maxRound / 2.0);

        IEnumerable<Match> targetMatches = request.Phase switch
        {
            TournamentPhase.All => matches,
            TournamentPhase.FirstLeg => matches.Where(m => m.Round <= splitRound),
            TournamentPhase.SecondLeg => matches.Where(m => m.Round > splitRound),
            // csharpsquid:S3928 - Using ValidationException instead of ArgumentOutOfRangeException for property validation
            _ => throw new ValidationException(nameof(request.Phase), "Invalid tournament phase")
        };

        foreach (Match? match in targetMatches)
        {
            match.AssignTable(request.TableId);
        }

        await context.SaveChangesAsync(cancellationToken);

        // Optimization Bolt ⚡: Invalidate cache when tables are bulk assigned
        cache.Remove($"TournamentDetail-{request.TournamentId}");

        return Unit.Value;
    }
}
