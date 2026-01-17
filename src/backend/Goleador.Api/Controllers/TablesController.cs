using Goleador.Application.Tables.Commands.CreateTable;
using Goleador.Application.Tables.Commands.DeleteTable;
using Goleador.Application.Tables.Queries.GetTables;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goleador.Api.Controllers;

[Authorize(Roles = "Admin")]
public class TablesController : ApiControllerBase
{
    [HttpGet]
    [AllowAnonymous] // Tutti possono vedere quali tavoli ci sono
    public async Task<ActionResult<List<TableDto>>> GetAll() =>
        await Mediator.Send(new GetTablesQuery());

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateTableCommand command) =>
        await Mediator.Send(command);

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await Mediator.Send(new DeleteTableCommand(id));
        return NoContent();
    }
}
