using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using Goleador.Domain.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Matches.Events;

public class UpdateEloOnMatchFinish(IApplicationDbContext context) : INotificationHandler<MatchFinishedEvent>
{
    public async Task Handle(MatchFinishedEvent notification, CancellationToken cancellationToken)
    {
        Match? match = await context.Matches
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

        var ratingHome = homeParticipants.Average(p => p.Player.EloRating);
        var ratingAway = awayParticipants.Average(p => p.Player.EloRating);

        var actualScoreHome = 0.5;
        if (match.ScoreHome > match.ScoreAway)
        {
            actualScoreHome = 1.0;
        }
        else if (match.ScoreHome < match.ScoreAway)
        {
            actualScoreHome = 0.0;
        }

        var deltaHome = EloCalculator.CalculateDelta(ratingHome, ratingAway, actualScoreHome);
        var deltaAway = -deltaHome;

        foreach (MatchParticipant? p in homeParticipants)
        {
            p.Player.UpdateElo(deltaHome);
        }

        foreach (MatchParticipant? p in awayParticipants)
        {
            p.Player.UpdateElo(deltaAway);
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
