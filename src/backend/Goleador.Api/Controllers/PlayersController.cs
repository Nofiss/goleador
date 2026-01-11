using Goleador.Application.Players.Commands.CreatePlayer;
using Goleador.Application.Players.Queries.GetPlayers;
using Microsoft.AspNetCore.Mvc;

namespace Goleador.Api.Controllers;

public class PlayersController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<PlayerDto>>> GetAllAsync() =>
        await Mediator.Send(new GetPlayersQuery());

    [HttpPost]
    public async Task<ActionResult<Guid>> CreateAsync(CreatePlayerCommand command)
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
