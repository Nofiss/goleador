using Goleador.Application.Users.Commands.CreateUser;
using Goleador.Application.Users.Commands.DeleteUser;
using Goleador.Application.Users.Commands.LinkUserToPlayer;
using Goleador.Application.Users.Commands.UpdateUser;
using Goleador.Application.Users.Commands.UpdateUserRoles;
using Goleador.Application.Users.Queries.GetUsers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goleador.Api.Controllers;

[Authorize(Roles = "Admin")]
public class UsersController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetAll() =>
        await Mediator.Send(new GetUsersQuery());

    [HttpPost]
    public async Task<ActionResult<string>> Create(CreateUserCommand command) =>
        await Mediator.Send(command);

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, UpdateUserCommand command)
    {
        if (id != command.UserId)
        {
            return BadRequest();
        }

        await Mediator.Send(command);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await Mediator.Send(new DeleteUserCommand(id));
        return NoContent();
    }

    [HttpPut("{id}/roles")]
    public async Task<IActionResult> UpdateRoles(string id, UpdateUserRolesCommand command)
    {
        if (id != command.UserId)
        {
            return BadRequest();
        }

        await Mediator.Send(command);
        return NoContent();
    }

    [HttpPut("{id}/link-player")]
    public async Task<IActionResult> LinkPlayer(string id, [FromBody] Guid? playerId)
    {
        // playerId può essere null
        await Mediator.Send(new LinkUserToPlayerCommand(id, playerId));
        return NoContent();
    }
}
