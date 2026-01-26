using Goleador.Application.Teams.Commands.RenameTeam;
using Goleador.Application.Tournaments.Commands.CreateTournament;
using Goleador.Application.Tournaments.Commands.GenerateBalancedTeams;
using Goleador.Application.Tournaments.Commands.JoinTournament;
using Goleador.Application.Tournaments.Commands.RegisterPlayer;
using Goleador.Application.Tournaments.Commands.RegisterTeam;
using Goleador.Application.Tournaments.Commands.StartTournament;
using Goleador.Application.Tournaments.Commands.BulkAssignTable;
using Goleador.Application.Tournaments.Queries.GetTournamentById;
using Goleador.Application.Tournaments.Queries.GetTournaments;
using Goleador.Application.Tournaments.Queries.GetTournamentStandings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goleador.Api.Controllers;

[Authorize(Roles = "Admin")]
public class TournamentsController : ApiControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<TournamentDto>>> GetAll() =>
        await Mediator.Send(new GetTournamentsQuery());

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<TournamentDetailDto>> GetById(Guid id) =>
        await Mediator.Send(new GetTournamentByIdQuery(id));

    [HttpPost]
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
    public async Task<ActionResult<Guid>> RegisterTeam(Guid id, RegisterTeamCommand command) =>
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

    [HttpPost("{id}/start")]
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
}
