using FluentValidation;

namespace Goleador.Application.Matches.Commands.UpdateMatchResult;

public class UpdateMatchResultCommandValidator : AbstractValidator<UpdateMatchResultCommand>
{
    public UpdateMatchResultCommandValidator()
    {
        RuleFor(v => v.Id).NotEmpty();
        RuleFor(v => v.ScoreHome).GreaterThanOrEqualTo(0);
        RuleFor(v => v.ScoreAway).GreaterThanOrEqualTo(0);
    }
}
