using MediatR;

namespace Goleador.Application.Tournaments.Commands.UpdateTournamentRules;

public record UpdateTournamentRulesCommand(Guid TournamentId, string? Rules) : IRequest;
