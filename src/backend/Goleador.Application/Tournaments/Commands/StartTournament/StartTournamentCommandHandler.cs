using Goleador.Application.Common.Interfaces;
using Goleador.Application.Tournaments.Services;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Goleador.Application.Tournaments.Commands.StartTournament;

public class StartTournamentCommandHandler(IApplicationDbContext context, IMemoryCache cache)
    : IRequestHandler<StartTournamentCommand, Unit>
{
    public async Task<Unit> Handle(
        StartTournamentCommand request,
        CancellationToken cancellationToken
    )
    {
        // 1. Carica il torneo CON le squadre E i giocatori (fondamentale per lo scheduler)
        Tournament tournament =
            await context
                .Tournaments.Include(t => t.Teams)
                    .ThenInclude(tt => tt.Players)
                .FirstOrDefaultAsync(t => t.Id == request.TournamentId, cancellationToken)
            ?? throw new KeyNotFoundException("Tournament not found");

        // 2. Validazioni di Dominio (tramite metodo dell'entità o qui)
        if (tournament.Status != TournamentStatus.Setup)
        {
            throw new InvalidOperationException("Tournament is already active or finished.");
        }

        if (tournament.Teams.Count < 2)
        {
            throw new InvalidOperationException("Not enough teams to start.");
        }

        // 3. Generazione Partite (Strategy Pattern in base al tipo)
        List<Match> matches = [];

        if (tournament.Type == TournamentType.RoundRobin)
        {
            // Passiamo una COPIA della lista squadre perché lo scheduler la manipola (rotazione)
            var teamsCopy = tournament.Teams.ToList();
            matches = RoundRobinScheduler.GenerateMatches(tournament, teamsCopy);
        }
        else
        {
            throw new NotImplementedException("Elimination mode not yet supported.");
        }

        // 4. Salva le partite generate
        context.Matches.AddRange(matches);

        // 5. Aggiorna stato torneo
        tournament.StartTournament(); // Metodo creato nell'entità Tournament precedentemente

        await context.SaveChangesAsync(cancellationToken);

        // Optimization Bolt ⚡: Invalidate cache when tournament starts
        cache.Remove($"TournamentDetail-{tournament.Id}");

        return Unit.Value;
    }
}
