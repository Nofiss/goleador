using Goleador.Application.Users.Commands.LinkUserToPlayer;
using Goleador.Application.Users.Commands.UpdateUserRoles;
using Goleador.Application.Users.Queries.GetUsers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goleador.Api.Controllers;

[Authorize(Roles = "Admin")]
public class UsersController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetAllAsync() =>
        await Mediator.Send(new GetUsersQuery());

    [HttpPut("{id}/roles")]
    public async Task<IActionResult> UpdateRolesAsync(string id, UpdateUserRolesCommand command)
    {
        if (id != command.UserId)
        {
            return BadRequest();
        }

        await Mediator.Send(command);
        return NoContent();
    }

    [HttpPut("{id}/link-player")]
    public async Task<IActionResult> LinkPlayerAsync(string id, [FromBody] Guid? playerId)
    {
        // playerId può essere null
        await Mediator.Send(new LinkUserToPlayerCommand(id, playerId));
        return NoContent();
    }
}
