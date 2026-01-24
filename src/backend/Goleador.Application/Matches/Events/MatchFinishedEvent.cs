using MediatR;

namespace Goleador.Application.Matches.Events;

public record MatchFinishedEvent(Guid MatchId) : INotification;
