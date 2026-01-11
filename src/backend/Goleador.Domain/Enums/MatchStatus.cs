namespace Goleador.Domain.Enums;

public enum MatchStatus
{
    Scheduled = 0, // Pianificata (0-0 provvisorio)
    Played = 1,    // Terminata (Risultato definitivo)
    Cancelled = 2  // Annullata
}
