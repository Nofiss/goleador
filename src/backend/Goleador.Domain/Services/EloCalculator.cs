namespace Goleador.Domain.Services;

public static class EloCalculator
{
    const int KFactor = 32;

    public static int CalculateDelta(double ratingA, double ratingB, double actualScore)
    {
        // Expected score formula: Ea = 1 / (1 + 10 ^ ((Rb - Ra) / 400))
        var expectedScore = 1.0 / (1.0 + Math.Pow(10, (ratingB - ratingA) / 400.0));

        // New rating formula: Ra' = Ra + K * (Score - Ea)
        // Delta = K * (Score - Ea)
        return (int)Math.Round(KFactor * (actualScore - expectedScore));
    }
}
