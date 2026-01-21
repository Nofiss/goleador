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
                .AsSplitQuery()
                .Include(t => t.Registrations)
                    .ThenInclude(r => r.Player)
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

        var playerTeamMap = new Dictionary<Guid, (string Name, Guid Id)>();
        foreach (TournamentTeam team in tournament.Teams)
        {
            foreach (Player player in team.Players)
            {
                if (!playerTeamMap.ContainsKey(player.Id))
                {
                    playerTeamMap[player.Id] = (team.Name, team.Id);
                }
            }
        }

        foreach (TournamentMatchDto matchDto in dto.Matches)
        {
            // Troviamo l'entità corrispondente in memoria (veloce perché hanno lo stesso indice o ID)
            // Nota: Per sicurezza usiamo First, ma ottimizzabile se la lista è ordinata uguale.
            Match? matchEntity = tournament.Matches.FirstOrDefault(m => m.Id == matchDto.Id);
            if (matchEntity == null)
            {
                continue;
            }

            // Estraiamo i partecipanti
            MatchParticipant? homeParticipant = matchEntity.Participants.FirstOrDefault(p =>
                p.Side == Domain.Enums.Side.Home
            );
            MatchParticipant? awayParticipant = matchEntity.Participants.FirstOrDefault(p =>
                p.Side == Domain.Enums.Side.Away
            );

            // Lookup istantaneo dal Dizionario
            matchDto.HomeTeamName =
                homeParticipant != null
                && playerTeamMap.TryGetValue(
                    homeParticipant.PlayerId,
                    out (string Name, Guid Id) homeTeam
                )
                    ? homeTeam.Name
                    : "N/A";

            matchDto.AwayTeamName =
                awayParticipant != null
                && playerTeamMap.TryGetValue(
                    awayParticipant.PlayerId,
                    out (string Name, Guid Id) awayTeam
                )
                    ? awayTeam.Name
                    : "N/A";

            // Mapping Tavolo
            matchDto.TableId = matchEntity.TableId;
            matchDto.TableName = matchEntity.Table?.Name ?? string.Empty;
        }

        dto.RegisteredPlayers =
        [
            .. tournament.Registrations.Select(r => new TeamPlayerDto
            {
                Id = r.Player.Id,
                Nickname = r.Player.Nickname,
            }),
        ];

        // 4. Ordinamento Partite (Prima quelle da giocare, poi per data)
        dto.Matches = [.. dto.Matches.OrderBy(m => m.Round)];

        return dto;
    }
}
