using Goleador.Domain.Enums;
using MediatR;

namespace Goleador.Application.Tournaments.Commands.CreateTournament;

public record CreateTournamentCommand(
    string Name,
    TournamentType Type,
    int TeamSize, // 1 o 2
    bool HasReturnMatches,
    string? Notes,

    // Opzioni Scoring
    int PointsForWin = 3,
    int PointsForDraw = 1,
    int PointsForLoss = 0,
    int? GoalThreshold = null,
    int GoalThresholdBonus = 0,
    bool EnableTenZeroBonus = false,
    int TenZeroBonus = 0
) : IRequest<Guid>;
