using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Goleador.Application.Tournaments.Commands.AddLateTeam;

public class AddLateTeamCommandHandler(IApplicationDbContext context, IMemoryCache cache)
    : IRequestHandler<AddLateTeamCommand, Guid>
{
    public async Task<Guid> Handle(AddLateTeamCommand request, CancellationToken cancellationToken)
    {
        Tournament tournament = await context.Tournaments
            .Include(t => t.Teams)
                .ThenInclude(tt => tt.Players)
            .Include(t => t.Registrations)
                .ThenInclude(r => r.Player)
            .Include(t => t.Matches)
                .ThenInclude(m => m.Participants)
            .FirstOrDefaultAsync(t => t.Id == request.TournamentId, cancellationToken)
            ?? throw new KeyNotFoundException("Tournament not found");

        // Validazioni pool giocatori (come in RegisterTeam)
        var poolPlayerIds = tournament.Registrations.Select(r => r.PlayerId).ToHashSet();
        foreach (Guid reqPlayerId in request.PlayerIds)
        {
            if (!poolPlayerIds.Contains(reqPlayerId))
            {
                throw new InvalidOperationException($"Il giocatore {reqPlayerId} non è iscritto al torneo.");
            }
        }

        var alreadyInTeamIds = tournament.Teams
            .SelectMany(t => t.Players)
            .Select(p => p.Id)
            .ToHashSet();

        if (request.PlayerIds.Any(alreadyInTeamIds.Contains))
        {
            throw new InvalidOperationException("Uno dei giocatori è già assegnato a una squadra.");
        }

        var playersToTeam = tournament.Registrations
            .Where(r => request.PlayerIds.Contains(r.PlayerId))
            .Select(r => r.Player)
            .ToList();

        // 1. Aggiunta squadra
        var newTeam = new TournamentTeam(tournament.Id, request.TeamName, playersToTeam);
        tournament.AddLateTeam(newTeam);
        context.TournamentTeams.Add(newTeam);

        // 2. Generazione Partite Incrementali
        var existingTeams = tournament.Teams.Where(t => t.Id != newTeam.Id).ToList();
        var maxRound = tournament.Matches.Any() ? tournament.Matches.Max(m => m.Round) : 0;

        var currentRoundOffset = 1;
        var newMatches = new List<Match>();

        foreach (TournamentTeam? existingTeam in existingTeams)
        {
            // Partita Andata
            var roundHome = maxRound + currentRoundOffset;
            Match matchHome = CreateMatch(tournament.Id, newTeam, existingTeam, roundHome);
            newMatches.Add(matchHome);

            if (tournament.HasReturnMatches)
            {
                // Partita Ritorno
                var roundAway = maxRound + currentRoundOffset + 1;
                Match matchAway = CreateMatch(tournament.Id, existingTeam, newTeam, roundAway);
                newMatches.Add(matchAway);
                currentRoundOffset += 2;
            }
            else
            {
                currentRoundOffset += 1;
            }
        }

        context.Matches.AddRange(newMatches);
        await context.SaveChangesAsync(cancellationToken);

        // Optimization Bolt ⚡: Invalidate cache when a late team is added
        cache.Remove($"TournamentDetail-{tournament.Id}");

        return newTeam.Id;
    }

    static Match CreateMatch(Guid tournamentId, TournamentTeam home, TournamentTeam away, int round)
    {
        var match = new Match(0, 0, tournamentId, null, round);

        foreach (Player player in home.Players)
        {
            match.AddParticipant(player.Id, Side.Home);
        }

        foreach (Player player in away.Players)
        {
            match.AddParticipant(player.Id, Side.Away);
        }

        return match;
    }
}
