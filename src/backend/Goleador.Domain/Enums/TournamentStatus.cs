namespace Goleador.Domain.Enums;

public enum TournamentStatus
{
    Setup = 0,    // Fase di iscrizione squadre
    Active = 1,   // Calendario generato, partite in corso
    Finished = 2  // Torneo concluso, vincitore decretato
}
