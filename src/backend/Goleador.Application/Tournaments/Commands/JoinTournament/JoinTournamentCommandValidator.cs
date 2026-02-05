using FluentValidation;

namespace Goleador.Application.Tournaments.Commands.JoinTournament;

public class JoinTournamentCommandValidator : AbstractValidator<JoinTournamentCommand>
{
    public JoinTournamentCommandValidator()
    {
        RuleFor(v => v.TournamentId)
            .NotEmpty().WithMessage("L'ID del torneo è obbligatorio.");

        RuleFor(v => v.TeamName)
            .NotEmpty().WithMessage("Il nome della squadra è obbligatorio.")
            .MaximumLength(50).WithMessage("Il nome della squadra non può superare i 50 caratteri.");
    }
}
