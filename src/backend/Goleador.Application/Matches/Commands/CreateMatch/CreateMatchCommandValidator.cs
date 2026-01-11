using FluentValidation;

namespace Goleador.Application.Matches.Commands.CreateMatch;

public class CreateMatchCommandValidator : AbstractValidator<CreateMatchCommand>
{
    public CreateMatchCommandValidator()
    {
        RuleFor(x => x.PlayerHomeId)
            .NotEmpty()
            .NotEqual(x => x.PlayerAwayId)
            .WithMessage("A player cannot play against themselves.");

        RuleFor(x => x.PlayerAwayId).NotEmpty();

        RuleFor(x => x.ScoreHome).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ScoreAway).GreaterThanOrEqualTo(0);
    }
}
