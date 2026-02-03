using Goleador.Application.Players.Commands.CreatePlayer;
using Goleador.Application.Players.Queries.GetGlobalRanking;
using Goleador.Application.Players.Queries.GetPendingMatches;
using Goleador.Application.Players.Queries.GetPlayerProfile;
using Goleador.Application.Players.Queries.GetPlayers;
using Goleador.Application.Players.Queries.GetPlayerStatistics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goleador.Api.Controllers;

[Authorize]
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

    [HttpGet("ranking")]
    [AllowAnonymous]
    public async Task<ActionResult<List<PlayerRankingDto>>> GetRanking() =>
        await Mediator.Send(new GetGlobalRankingQuery());

    [HttpGet("{id}/profile")]
    [AllowAnonymous]
    public async Task<ActionResult<PlayerProfileDto>> GetProfile(Guid id) =>
        await Mediator.Send(new GetPlayerProfileQuery(id));

    [HttpGet("me/profile")]
    [Authorize]
    public async Task<ActionResult<PlayerProfileDto>> GetMyProfile() =>
        await Mediator.Send(new GetMyPlayerProfileQuery());

    [HttpGet("me/pending-matches")]
    [Authorize]
    public async Task<ActionResult<List<PendingMatchDto>>> GetMyPendingMatches() =>
        await Mediator.Send(new GetMyPendingMatchesQuery());

    [HttpPost]
    [Authorize(Roles = "Admin")]
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
