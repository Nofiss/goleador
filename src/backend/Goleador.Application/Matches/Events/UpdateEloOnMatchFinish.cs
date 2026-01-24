using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Enums;
using Goleador.Domain.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Matches.Events;

public class UpdateEloOnMatchFinish(IApplicationDbContext context) : INotificationHandler<MatchFinishedEvent>
{
    public async Task Handle(MatchFinishedEvent notification, CancellationToken cancellationToken)
    {
        var match = await context.Matches
            .Include(m => m.Participants)
                .ThenInclude(p => p.Player)
            .FirstOrDefaultAsync(m => m.Id == notification.MatchId, cancellationToken);

        if (match == null || match.Status != MatchStatus.Played)
        {
            return;
        }

        var homeParticipants = match.Participants.Where(p => p.Side == Side.Home).ToList();
        var awayParticipants = match.Participants.Where(p => p.Side == Side.Away).ToList();

        if (homeParticipants.Count == 0 || awayParticipants.Count == 0)
        {
            return;
        }

        double ratingHome = homeParticipants.Average(p => p.Player.EloRating);
        double ratingAway = awayParticipants.Average(p => p.Player.EloRating);

        double actualScoreHome = 0.5;
        if (match.ScoreHome > match.ScoreAway)
        {
            actualScoreHome = 1.0;
        }
        else if (match.ScoreHome < match.ScoreAway)
        {
            actualScoreHome = 0.0;
        }

        int deltaHome = EloCalculator.CalculateDelta(ratingHome, ratingAway, actualScoreHome);
        int deltaAway = -deltaHome;

        foreach (var p in homeParticipants)
        {
            p.Player.UpdateElo(deltaHome);
        }

        foreach (var p in awayParticipants)
        {
            p.Player.UpdateElo(deltaAway);
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
