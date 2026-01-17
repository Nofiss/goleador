using Goleador.Application.Players.Commands.CreatePlayer;
using Goleador.Application.Players.Queries.GetPlayers;
using Goleador.Application.Players.Queries.GetPlayerStatistics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goleador.Api.Controllers;

[Authorize(Roles = "Admin")]
public class PlayersController : ApiControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<PlayerDto>>> GetAll() =>
        await Mediator.Send(new GetPlayersQuery());

    [HttpGet("{id}/statistics")]
    [AllowAnonymous]
    public async Task<ActionResult<PlayerStatisticsDto>> GetStatistics(Guid id) =>
        await Mediator.Send(new GetPlayerStatisticsQuery(id));

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreatePlayerCommand command)
    {
        // Invia il comando al layer Application tramite MediatR.
        // Non sappiamo (e non ci interessa) chi lo gestirà.
        Guid playerId = await Mediator.Send(command);

        // Restituisce l'ID del giocatore creato.
        // In un'API REST pura, idealmente restituirebbe 201 Created con l'header Location,
        // ma per ora va benissimo restituire l'ID direttamente.
        return Ok(playerId);
    }
}
