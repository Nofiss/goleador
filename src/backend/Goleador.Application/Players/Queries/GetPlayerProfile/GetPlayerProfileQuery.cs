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
    // SonarQube: csharpsquid:S3776 - Refactored to reduce cognitive complexity from 33 to below 15.
    public async Task<PlayerProfileDto> Handle(
        GetPlayerProfileQuery request,
        CancellationToken cancellationToken
    )
    {
        var player = await FetchPlayerAsync(request.PlayerId, cancellationToken);
        var matches = await FetchMatchesAsync(request.PlayerId, cancellationToken);

        var topPartner = partnerList
            .GroupBy(p => new { p!.PlayerId, p.Nickname })
            .OrderByDescending(g => g.Count())
            .FirstOrDefault();

        var dto = new PlayerProfileDto
        {
            Id = player.Id,
            FullName = $"{player.FirstName} {player.LastName}".Trim(),
            Nickname = player.Nickname,
            EloRating = player.EloRating,
            TotalMatches = stats?.TotalMatches ?? 0,
            Wins = stats?.Wins ?? 0,
            Losses = stats?.Losses ?? 0,
            GoalsFor = stats?.GoalsFor ?? 0,
            GoalsAgainst = stats?.GoalsAgainst ?? 0,
            WinRate = (stats?.TotalMatches ?? 0) == 0 ? 0 : Math.Round((double)stats!.Wins / stats.TotalMatches * 100, 1),
            Nemesis = topNemesis == null ? null : new RelatedPlayerDto { PlayerId = topNemesis.Key.PlayerId, Nickname = topNemesis.Key.Nickname, Count = topNemesis.Count() },
            BestPartner = topPartner == null ? null : new RelatedPlayerDto { PlayerId = topPartner.Key.PlayerId, Nickname = topPartner.Key.Nickname, Count = topPartner.Count() },
            RecentMatches = recentMatches.Select(m => {
                var myParticipant = m.Participants.First(p => p.PlayerId == request.PlayerId);
                var mySide = myParticipant.Side;
                var myScore = mySide == Side.Home ? m.ScoreHome : m.ScoreAway;
                var oppScore = mySide == Side.Home ? m.ScoreAway : m.ScoreHome;
                return new MatchBriefDto {
                    Id = m.Id,
                    DatePlayed = m.DatePlayed,
                    ScoreHome = m.ScoreHome,
                    ScoreAway = m.ScoreAway,
                    HomeTeamName = string.Join(" - ", m.Participants.Where(p => p.Side == Side.Home).Select(p => p.Nickname)),
                    AwayTeamName = string.Join(" - ", m.Participants.Where(p => p.Side == Side.Away).Select(p => p.Nickname)),
                    Result = myScore > oppScore ? "W" : (myScore < oppScore ? "L" : "D")
                };
            }).ToList()
        };

        if (matches.Count == 0)
        {
            return dto;
        }

        var stats = new PlayerMatchStats();
        ProcessMatches(matches, request.PlayerId, dto, stats);

        dto.Wins = stats.Wins;
        dto.Losses = stats.Losses;
        dto.GoalsFor = stats.GoalsFor;
        dto.GoalsAgainst = stats.GoalsAgainst;
        dto.WinRate = dto.TotalMatches == 0 ? 0 : Math.Round((double)stats.Wins / dto.TotalMatches * 100, 1);

        UpdateBestPartnerAndNemesis(dto, stats);

        return dto;
    }

    private async Task<Player> FetchPlayerAsync(Guid playerId, CancellationToken cancellationToken)
    {
        return await context.Players
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == playerId, cancellationToken)
            ?? throw new KeyNotFoundException("Player not found");
    }

    private async Task<List<MatchProjection>> FetchMatchesAsync(Guid playerId, CancellationToken cancellationToken)
    {
        // Optimization Bolt ⚡: Use .Select() projection instead of .Include()
        // This fetches only the required scalar properties from the database, reducing
        // data transfer and memory pressure significantly (O(1) columns instead of fetching full entity graphs).
        return await context.Matches
            .AsNoTracking()
            .Where(m => m.Status == MatchStatus.Played &&
                        m.Participants.Any(p => p.PlayerId == playerId))
            .OrderByDescending(m => m.DatePlayed)
            .Select(m => new MatchProjection
            {
                Id = m.Id,
                DatePlayed = m.DatePlayed,
                ScoreHome = m.ScoreHome,
                ScoreAway = m.ScoreAway,
                Participants = m.Participants.Select(p => new ParticipantProjection
                {
                    PlayerId = p.PlayerId,
                    Side = p.Side,
                    Nickname = p.Player.Nickname
                }).ToList()
            })
            .ToListAsync(cancellationToken);
    }

    private void ProcessMatches(List<MatchProjection> matches, Guid playerId, PlayerProfileDto dto, PlayerMatchStats stats)
    {
        foreach (var match in matches)
        {
            var myParticipant = match.Participants.First(p => p.PlayerId == playerId);
            var mySide = myParticipant.Side;
            var myScore = mySide == Side.Home ? match.ScoreHome : match.ScoreAway;
            var opponentScore = mySide == Side.Home ? match.ScoreAway : match.ScoreHome;

            stats.GoalsFor += myScore;
            stats.GoalsAgainst += opponentScore;

            var result = DetermineMatchResult(match, mySide, myScore, opponentScore, playerId, stats);

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
    }

    private static string DetermineMatchResult(MatchProjection match, Side mySide, int myScore, int opponentScore, Guid playerId, PlayerMatchStats stats)
    {
        if (myScore > opponentScore)
        {
            stats.Wins++;
            TrackPartnerWin(match.Participants, mySide, playerId, stats.PartnersWins);
            return "W";
        }

        if (myScore < opponentScore)
        {
            stats.Losses++;
            TrackOpponentLosses(match.Participants, mySide, stats.OpponentsLosses);
            return "L";
        }

        return "D";
    }

    private static void TrackPartnerWin(List<ParticipantProjection> participants, Side mySide, Guid playerId, Dictionary<Guid, (string Nickname, int Count)> partnersWins)
    {
        var partner = participants.FirstOrDefault(p => p.Side == mySide && p.PlayerId != playerId);
        if (partner != null)
        {
            partnersWins[partner.PlayerId] = partnersWins.TryGetValue(partner.PlayerId, out var val)
                ? (partner.Nickname, val.Count + 1)
                : (partner.Nickname, 1);
        }
    }

    private static void TrackOpponentLosses(List<ParticipantProjection> participants, Side mySide, Dictionary<Guid, (string Nickname, int Count)> opponentsLosses)
    {
        var opponents = participants.Where(p => p.Side != mySide);
        foreach (var opponent in opponents)
        {
            opponentsLosses[opponent.PlayerId] = opponentsLosses.TryGetValue(opponent.PlayerId, out var val)
                ? (opponent.Nickname, val.Count + 1)
                : (opponent.Nickname, 1);
        }
    }

    private static void UpdateBestPartnerAndNemesis(PlayerProfileDto dto, PlayerMatchStats stats)
    {
        var topNemesis = stats.OpponentsLosses.OrderByDescending(x => x.Value.Count).FirstOrDefault();
        if (topNemesis.Key != Guid.Empty)
        {
            dto.Nemesis = new RelatedPlayerDto
            {
                PlayerId = topNemesis.Key,
                Nickname = topNemesis.Value.Nickname,
                Count = topNemesis.Value.Count
            };
        }

        var topPartner = stats.PartnersWins.OrderByDescending(x => x.Value.Count).FirstOrDefault();
        if (topPartner.Key != Guid.Empty)
        {
            dto.BestPartner = new RelatedPlayerDto
            {
                PlayerId = topPartner.Key,
                Nickname = topPartner.Value.Nickname,
                Count = topPartner.Value.Count
            };
        }
    }

    private static string GetFormattedTeamName(IEnumerable<ParticipantProjection> participants, Side side)
    {
        var sideParticipants = participants.Where(p => p.Side == side).ToList();
        if (sideParticipants.Count == 0) return "Unknown";
        return string.Join(" - ", sideParticipants.Select(p => p.Nickname));
    }

    private class MatchProjection
    {
        public Guid Id { get; set; }
        public DateTime DatePlayed { get; set; }
        public int ScoreHome { get; set; }
        public int ScoreAway { get; set; }
        public List<ParticipantProjection> Participants { get; set; } = [];
    }

    private class ParticipantProjection
    {
        public Guid PlayerId { get; set; }
        public Side Side { get; set; }
        public string Nickname { get; set; } = string.Empty;
    }

    private class PlayerMatchStats
    {
        public int Wins { get; set; }
        public int Losses { get; set; }
        public int GoalsFor { get; set; }
        public int GoalsAgainst { get; set; }
        public Dictionary<Guid, (string Nickname, int Count)> OpponentsLosses { get; } = new();
        public Dictionary<Guid, (string Nickname, int Count)> PartnersWins { get; } = new();
    }
}
