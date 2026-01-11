namespace Goleador.Domain.ValueObjects;

public class TournamentScoringRules
{
    // Punteggi Base
    public int PointsForWin { get; private set; } = 3;
    public int PointsForDraw { get; private set; } = 1;
    public int PointsForLoss { get; private set; } = 0;

    // Bonus 1: "Segnati 4+ goal"
    public int? GoalThreshold { get; private set; } // Es. 4
    public int GoalThresholdBonus { get; private set; } // Es. 1 punto extra

    // Bonus 2: "Vittoria schiacciante" (es. 10-0, cappotto)
    public bool EnableTenZeroBonus { get; private set; } // Attiva bonus per 10-0
    public int TenZeroBonus { get; private set; } // Es. 1 punto extra

    TournamentScoringRules() { } // EF Core

    public TournamentScoringRules(
        int win,
        int draw,
        int loss,
        int? goalThreshold,
        int goalThresholdBonus,
        bool enableTenZero,
        int tenZeroBonus
    )
    {
        PointsForWin = win;
        PointsForDraw = draw;
        PointsForLoss = loss;
        GoalThreshold = goalThreshold;
        GoalThresholdBonus = goalThresholdBonus;
        EnableTenZeroBonus = enableTenZero;
        TenZeroBonus = tenZeroBonus;
    }

    // Factory per default
    public static TournamentScoringRules Default() => new(3, 1, 0, null, 0, false, 0);
}
