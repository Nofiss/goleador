using Goleador.Application.Matches.Commands.CreateMatch;
using Goleador.Application.Matches.Commands.UpdateMatchResult;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goleador.Api.Controllers;

public class MatchesController : ApiControllerBase
{
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Guid>> Create(CreateMatchCommand command) =>
        await Mediator.Send(command);

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin, Referee")]
    public async Task<IActionResult> UpdateResult(Guid id, UpdateMatchResultCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest();
        }

        await Mediator.Send(command);
        return NoContent();
    }
}
