using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Players.Queries.GetPlayerProfile;

public record GetPlayerProfileQuery(Guid PlayerId) : IRequest<PlayerProfileDto>;

public class GetPlayerProfileQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetPlayerProfileQuery, PlayerProfileDto>
{
    public async Task<PlayerProfileDto> Handle(
        GetPlayerProfileQuery request,
        CancellationToken cancellationToken
    )
    {
        var player = await context.Players
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.PlayerId, cancellationToken)
            ?? throw new KeyNotFoundException("Player not found");

        // Optimization Bolt ⚡: Use .Select() projection instead of .Include()
        // This fetches only the required scalar properties from the database, reducing
        // data transfer and memory pressure significantly (O(1) columns instead of fetching full entity graphs).
        var matches = await context.Matches
            .AsNoTracking()
            .Where(m => m.Status == MatchStatus.Played &&
                        m.Participants.Any(p => p.PlayerId == request.PlayerId))
            .OrderByDescending(m => m.DatePlayed)
            .Select(m => new {
                m.Id,
                m.DatePlayed,
                m.ScoreHome,
                m.ScoreAway,
                Participants = m.Participants.Select(p => new {
                    p.PlayerId,
                    p.Side,
                    p.Player.Nickname
                }).ToList()
            })
            .ToListAsync(cancellationToken);

        var dto = new PlayerProfileDto
        {
            Id = player.Id,
            FullName = $"{player.FirstName} {player.LastName}".Trim(),
            Nickname = player.Nickname,
            EloRating = player.EloRating,
            TotalMatches = matches.Count
        };

        if (matches.Count == 0)
        {
            return dto;
        }

        var wins = 0;
        var losses = 0;
        var goalsFor = 0;
        var goalsAgainst = 0;
        var opponentsLosses = new Dictionary<Guid, (string Nickname, int Count)>();
        var partnersWins = new Dictionary<Guid, (string Nickname, int Count)>();

        foreach (var match in matches)
        {
            var myParticipant = match.Participants.First(p => p.PlayerId == request.PlayerId);
            var mySide = myParticipant.Side;
            var myScore = mySide == Side.Home ? match.ScoreHome : match.ScoreAway;
            var opponentScore = mySide == Side.Home ? match.ScoreAway : match.ScoreHome;

            goalsFor += myScore;
            goalsAgainst += opponentScore;

            string result;
            if (myScore > opponentScore)
            {
                wins++;
                result = "W";

                // Best Partner Logic: teammates in won matches
                var partner = match.Participants.FirstOrDefault(p => p.Side == mySide && p.PlayerId != request.PlayerId);
                if (partner != null)
                {
                    if (partnersWins.TryGetValue(partner.PlayerId, out var val))
                    {
                        partnersWins[partner.PlayerId] = (partner.Nickname, val.Count + 1);
                    }
                    else
                    {
                        partnersWins[partner.PlayerId] = (partner.Nickname, 1);
                    }
                }
            }
            else if (myScore < opponentScore)
            {
                losses++;
                result = "L";

                // Nemesis Logic: opponents in lost matches
                var opponents = match.Participants.Where(p => p.Side != mySide);
                foreach (var opponent in opponents)
                {
                    if (opponentsLosses.TryGetValue(opponent.PlayerId, out var val))
                    {
                        opponentsLosses[opponent.PlayerId] = (opponent.Nickname, val.Count + 1);
                    }
                    else
                    {
                        opponentsLosses[opponent.PlayerId] = (opponent.Nickname, 1);
                    }
                }
            }
            else
            {
                result = "D";
            }

            if (dto.RecentMatches.Count < 5)
            {
                dto.RecentMatches.Add(new MatchBriefDto
                {
                    Id = match.Id,
                    DatePlayed = match.DatePlayed,
                    ScoreHome = match.ScoreHome,
                    ScoreAway = match.ScoreAway,
                    HomeTeamName = GetFormattedTeamName(match.Participants, Side.Home),
                    AwayTeamName = GetFormattedTeamName(match.Participants, Side.Away),
                    Result = result
                });
            }
        }

        dto.Wins = wins;
        dto.Losses = losses;
        dto.GoalsFor = goalsFor;
        dto.GoalsAgainst = goalsAgainst;
        dto.WinRate = dto.TotalMatches == 0 ? 0 : Math.Round((double)wins / dto.TotalMatches * 100, 1);

        var topNemesis = opponentsLosses.OrderByDescending(x => x.Value.Count).FirstOrDefault();
        if (topNemesis.Key != Guid.Empty)
        {
            dto.Nemesis = new RelatedPlayerDto
            {
                PlayerId = topNemesis.Key,
                Nickname = topNemesis.Value.Nickname,
                Count = topNemesis.Value.Count
            };
        }

        var topPartner = partnersWins.OrderByDescending(x => x.Value.Count).FirstOrDefault();
        if (topPartner.Key != Guid.Empty)
        {
            dto.BestPartner = new RelatedPlayerDto
            {
                PlayerId = topPartner.Key,
                Nickname = topPartner.Value.Nickname,
                Count = topPartner.Value.Count
            };
        }

        return dto;
    }

    private static string GetFormattedTeamName(IEnumerable<dynamic> participants, Side side)
    {
        var sideParticipants = participants.Where(p => p.Side == side).ToList();
        if (sideParticipants.Count == 0) return "Unknown";
        return string.Join(" - ", sideParticipants.Select(p => (string)p.Nickname));
    }
}
