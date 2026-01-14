using FluentValidation;

namespace Goleador.Application.Tables.Commands.CreateTable;

public class CreateTableValidator : AbstractValidator<CreateTableCommand>
{
    public CreateTableValidator()
    {
        RuleFor(v => v.Name).NotEmpty().MaximumLength(50);
        RuleFor(v => v.Location).NotEmpty().MaximumLength(100);
    }
}
