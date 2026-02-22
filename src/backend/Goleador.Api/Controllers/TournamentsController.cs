using Goleador.Application.Teams.Commands.RenameTeam;
using Goleador.Application.Teams.Commands.UploadBranding;
using Goleador.Application.Tournaments.Commands.AddLateTeam;
using Goleador.Application.Tournaments.Commands.CreateTournament;
using Goleador.Application.Tournaments.Commands.GenerateBalancedTeams;
using Goleador.Application.Tournaments.Commands.JoinTournament;
using Goleador.Application.Tournaments.Commands.RegisterPlayer;
using Goleador.Application.Tournaments.Commands.RegisterTeam;
using Goleador.Application.Tournaments.Commands.StartTournament;
using Goleador.Application.Tournaments.Commands.UpdateTournamentRules;
using Goleador.Application.Tournaments.Commands.BulkAssignTable;
using Goleador.Application.Tournaments.Queries.GetTournamentById;
using Goleador.Application.Tournaments.Queries.GetTournaments;
using Goleador.Application.Tournaments.Queries.GetTournamentStandings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goleador.Api.Controllers;

[Authorize]
public class TournamentsController : ApiControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<TournamentDto>>> GetAll() =>
        await Mediator.Send(new GetTournamentsQuery());

    /// <summary>
    /// Recupera i dettagli di un torneo specifico tramite il suo ID.
    /// </summary>
    /// <param name="id">L'identificatore univoco del torneo.</param>
    /// <returns>I dettagli del torneo richiesto.</returns>
    /// <response code="200">Ritorna i dettagli del torneo.</response>
    /// <response code="404">Se il torneo non è stato trovato.</response>
    [HttpGet("{id}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(TournamentDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TournamentDetailDto>> GetById(Guid id) =>
        await Mediator.Send(new GetTournamentByIdQuery(id));

    /// <summary>
    /// Crea un nuovo torneo in fase di Setup.
    /// </summary>
    /// <param name="command">Dati del torneo (Nome, Tipo, Formato)</param>
    /// <returns>L'ID del torneo creato</returns>
    /// <response code="201">Il torneo è stato creato con successo.</response>
    /// <response code="400">Se i dati inviati non sono validi.</response>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Guid>> Create(CreateTournamentCommand command) =>
        await Mediator.Send(command);

    [HttpPost("{id}/register-player")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RegisterPlayer(
        Guid id,
        [FromBody] RegisterPlayerRequest request
    )
    {
        await Mediator.Send(new RegisterPlayerCommand(id, request.PlayerId));
        return NoContent();
    }

    [HttpPost("{id}/teams")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Guid>> RegisterTeam(Guid id, RegisterTeamCommand command) =>
        id != command.TournamentId
            ? (ActionResult<Guid>)BadRequest()
            : (ActionResult<Guid>)await Mediator.Send(command);

    [HttpPost("{id}/teams/late")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Guid>> AddLateTeam(Guid id, AddLateTeamCommand command) =>
        id != command.TournamentId
            ? (ActionResult<Guid>)BadRequest()
            : (ActionResult<Guid>)await Mediator.Send(command);

    [HttpPut("teams/{teamId}/rename")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RenameTeam(
        Guid teamId,
        [FromBody] RenameTeamRequest request
    )
    {
        await Mediator.Send(new RenameTeamCommand(teamId, request.NewName));
        return NoContent();
    }

    [HttpPost("teams/{teamId}/branding")]
    [Authorize(Roles = "Admin")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<BrandingUrlsDto>> UploadBranding(
        Guid teamId,
        IFormFile? logo,
        IFormFile? sponsor
    )
    {
        var command = new UploadTeamBrandingCommand(
            teamId,
            logo != null ? new FileDto(logo.OpenReadStream(), logo.FileName, logo.Length) : null,
            sponsor != null ? new FileDto(sponsor.OpenReadStream(), sponsor.FileName, sponsor.Length) : null
        );

        return await Mediator.Send(command);
    }

    [HttpPost("{id}/start")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Start(Guid id)
    {
        await Mediator.Send(new StartTournamentCommand(id));
        return NoContent();
    }

    [HttpGet("{id}/standings")]
    [AllowAnonymous]
    public async Task<ActionResult<List<TournamentStandingDto>>> GetStandings(Guid id) =>
        await Mediator.Send(new GetTournamentStandingsQuery(id));

    [HttpPost("{id}/join")]
    [Authorize]
    public async Task<ActionResult<Guid>> Join(Guid id, [FromBody] string teamName) =>
        await Mediator.Send(new JoinTournamentCommand(id, teamName));

    [HttpPost("{id}/generate-teams")]
    [Authorize(Roles = "Admin")] // Solo l'admin può premere il bottone magico
    public async Task<IActionResult> GenerateTeams(Guid id)
    {
        await Mediator.Send(new GenerateBalancedTeamsCommand(id));
        return NoContent();
    }

    [HttpPut("{id}/tables/bulk-assign")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> BulkAssignTable(
        Guid id,
        [FromBody] BulkAssignTableRequest request
    )
    {
        await Mediator.Send(new BulkAssignTableCommand(id, request.TableId, request.Phase));
        return NoContent();
    }

    [HttpPut("{id}/rules")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRules(Guid id, [FromBody] UpdateTournamentRulesRequest request)
    {
        await Mediator.Send(new UpdateTournamentRulesCommand(id, request.Rules));
        return NoContent();
    }
}

public record UpdateTournamentRulesRequest(string? Rules);
