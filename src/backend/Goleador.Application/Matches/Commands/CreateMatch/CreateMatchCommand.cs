using MediatR;

namespace Goleador.Application.Matches.Commands.CreateMatch;

public record CreateMatchCommand(Guid PlayerHomeId, Guid PlayerAwayId, int ScoreHome, int ScoreAway)
    : IRequest<Guid>;
