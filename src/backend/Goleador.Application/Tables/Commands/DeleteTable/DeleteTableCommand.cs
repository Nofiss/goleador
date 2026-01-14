using MediatR;

namespace Goleador.Application.Tables.Commands.DeleteTable;

public record DeleteTableCommand(int Id) : IRequest<Unit>;
