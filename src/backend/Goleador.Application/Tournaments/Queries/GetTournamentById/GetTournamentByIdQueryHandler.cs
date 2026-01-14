using AutoMapper;
using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Tournaments.Queries.GetTournamentById;

public class GetTournamentByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetTournamentByIdQuery, TournamentDetailDto>
{
    public async Task<TournamentDetailDto> Handle(
        GetTournamentByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        // 1. Carica TUTTO (Torneo, Squadre+Giocatori, Partite+Partecipanti)
        Tournament tournament =
            await context
                .Tournaments.AsNoTracking()
                .Include(t => t.Teams)
                    .ThenInclude(tt => tt.Players)
                .Include(t => t.Matches)
                    .ThenInclude(m => m.Participants)
                .Include(t => t.Matches)
                    .ThenInclude(m => m.Table)
                .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken)
            ?? throw new KeyNotFoundException("Tournament not found");

        // 2. Mappa base con AutoMapper
        TournamentDetailDto dto = mapper.Map<TournamentDetailDto>(tournament);

        // 3. ARRITCCHIMENTO DATI (Fix Nomi Squadre nelle Partite)
        // Per ogni partita, dobbiamo capire chi sono "Home" e "Away" guardando i giocatori
        foreach (TournamentMatchDto matchDto in dto.Matches)
        {
            Match matchEntity = tournament.Matches.First(m => m.Id == matchDto.Id);

            // Trova gli ID dei giocatori Home e Away
            var homePlayerIds = matchEntity
                .Participants.Where(p => p.Side == Domain.Enums.Side.Home)
                .Select(p => p.PlayerId)
                .ToList();
            var awayPlayerIds = matchEntity
                .Participants.Where(p => p.Side == Domain.Enums.Side.Away)
                .Select(p => p.PlayerId)
                .ToList();

            // Trova il Team che contiene questi giocatori
            TournamentTeam? homeTeam = tournament.Teams.FirstOrDefault(t =>
                t.Players.Select(p => p.Id).Intersect(homePlayerIds).Any()
            );
            TournamentTeam? awayTeam = tournament.Teams.FirstOrDefault(t =>
                t.Players.Select(p => p.Id).Intersect(awayPlayerIds).Any()
            );

            matchDto.HomeTeamName = homeTeam?.Name ?? "TBD";
            matchDto.AwayTeamName = awayTeam?.Name ?? "TBD";

            matchDto.TableId = matchEntity.TableId;
            matchDto.TableName = matchEntity.Table?.Name;
        }

        // 4. Ordinamento Partite (Prima quelle da giocare, poi per data)
        dto.Matches =
        [
            .. dto
                .Matches.OrderBy(m => m.Status) // 0 (Scheduled) prima di 1 (Played)
                .ThenBy(m => m.Id),
        ];

        return dto;
    }
}
