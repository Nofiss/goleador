using Goleador.Application.Matches.Commands.CreateMatch;
using Microsoft.AspNetCore.Mvc;

namespace Goleador.Api.Controllers;

public class MatchesController : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<Guid>> CreateAsync(CreateMatchCommand command) =>
        await Mediator.Send(command);
}
