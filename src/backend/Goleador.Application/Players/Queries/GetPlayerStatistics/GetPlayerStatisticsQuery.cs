using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Players.Queries.GetPlayerStatistics;

public record GetPlayerStatisticsQuery(Guid PlayerId) : IRequest<PlayerStatisticsDto>;

public class GetPlayerStatisticsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetPlayerStatisticsQuery, PlayerStatisticsDto>
{
    public async Task<PlayerStatisticsDto> Handle(
        GetPlayerStatisticsQuery request,
        CancellationToken cancellationToken
    )
    {
        // 1. Recupera il giocatore (per il nome)
        Player player =
            await context
                .Players.AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == request.PlayerId, cancellationToken)
            ?? throw new KeyNotFoundException("Player not found");

        // 2. Recupera tutte le partite GIOCATE (Status = Played) dove il giocatore era presente
        // Dobbiamo includere i Participants per sapere in che squadra (Side) giocava
        List<Match> matches = await context
            .Matches.AsNoTracking()
            .Include(m => m.Participants)
            .Where(m =>
                m.Status == MatchStatus.Played
                && m.Participants.Any(p => p.PlayerId == request.PlayerId)
            )
            .OrderByDescending(m => m.DatePlayed) // Dalla più recente
            .ToListAsync(cancellationToken);

        // 3. Calcolo Statistiche
        var stats = new PlayerStatisticsDto
        {
            PlayerId = player.Id,
            Nickname = player.Nickname,
            MatchesPlayed = matches.Count,
        };

        foreach (Match match in matches)
        {
            // Trova in che lato giocava il nostro player (Home o Away)
            MatchParticipant participant = match.Participants.First(p =>
                p.PlayerId == request.PlayerId
            );
            Side mySide = participant.Side;

            // Determina i goal miei e dell'avversario
            var myScore = mySide == Side.Home ? match.ScoreHome : match.ScoreAway;
            var opponentScore = mySide == Side.Home ? match.ScoreAway : match.ScoreHome;

            // Aggiorna contatori
            stats.GoalsFor += myScore;
            stats.GoalsAgainst += opponentScore;

            string resultChar; // W, D, L

            if (myScore > opponentScore)
            {
                stats.Wins++;
                resultChar = "W";
            }
            else if (myScore < opponentScore)
            {
                stats.Losses++;
                resultChar = "L";
            }
            else
            {
                stats.Draws++;
                resultChar = "D";
            }

            // Aggiungi al trend solo se non ne abbiamo già 5
            if (stats.RecentForm.Count < 5)
            {
                stats.RecentForm.Add(resultChar);
            }
        }

        // Il loop era ordinato per data decrescente (più recenti prima),
        // quindi RecentForm è già nell'ordine giusto (Recente -> Vecchio).
        // Se lo vuoi visualizzare da sinistra (vecchio) a destra (recente), fai .Reverse() sul frontend.

        return stats;
    }
}
