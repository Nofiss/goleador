using MediatR;

namespace Goleador.Application.Tables.Commands.CreateTable;

public record CreateTableCommand(string Name, string Location) : IRequest<int>;
