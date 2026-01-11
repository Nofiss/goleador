using Goleador.Application.Matches.Commands.CreateMatch;
using Goleador.Application.Matches.Commands.UpdateMatchResult;
using Microsoft.AspNetCore.Mvc;

namespace Goleador.Api.Controllers;

public class MatchesController : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<Guid>> CreateAsync(CreateMatchCommand command) =>
        await Mediator.Send(command);

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateResultAsync(Guid id, UpdateMatchResultCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest();
        }

        await Mediator.Send(command);
        return NoContent();
    }
}
