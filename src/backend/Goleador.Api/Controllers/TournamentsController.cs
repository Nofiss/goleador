using Goleador.Application.Tournaments.Commands.CreateTournament;
using Goleador.Application.Tournaments.Commands.RegisterTeam;
using Goleador.Application.Tournaments.Commands.StartTournament;
using Goleador.Application.Tournaments.Queries.GetTournamentById;
using Goleador.Application.Tournaments.Queries.GetTournaments;
using Goleador.Application.Tournaments.Queries.GetTournamentStandings;
using Microsoft.AspNetCore.Mvc;

namespace Goleador.Api.Controllers;

public class TournamentsController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<TournamentDto>>> GetAllAsync() =>
        await Mediator.Send(new GetTournamentsQuery());

    [HttpGet("{id}")]
    public async Task<ActionResult<TournamentDetailDto>> GetByIdAsync(Guid id) =>
        await Mediator.Send(new GetTournamentByIdQuery(id));

    [HttpPost]
    public async Task<ActionResult<Guid>> CreateAsync(CreateTournamentCommand command) =>
        await Mediator.Send(command);

    [HttpPost("{id}/teams")]
    public async Task<ActionResult<Guid>> RegisterTeamAsync(Guid id, RegisterTeamCommand command) =>
        id != command.TournamentId
            ? (ActionResult<Guid>)BadRequest()
            : (ActionResult<Guid>)await Mediator.Send(command);

    [HttpPost("{id}/start")]
    public async Task<IActionResult> StartAsync(Guid id)
    {
        await Mediator.Send(new StartTournamentCommand(id));
        return NoContent();
    }

    [HttpGet("{id}/standings")]
    public async Task<ActionResult<List<TournamentStandingDto>>> GetStandingsAsync(Guid id) =>
        await Mediator.Send(new GetTournamentStandingsQuery(id));
}
