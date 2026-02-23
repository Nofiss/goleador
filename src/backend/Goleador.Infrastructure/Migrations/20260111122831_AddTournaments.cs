using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goleador.Infrastructure.Migrations;

/// <inheritdoc />
public partial class AddTournaments : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<Guid>(
            name: "TournamentId",
            table: "Matches",
            type: "uniqueidentifier",
            nullable: true);

        migrationBuilder.CreateTable(
            name: "Tournaments",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                Type = table.Column<int>(type: "int", nullable: false),
                Status = table.Column<int>(type: "int", nullable: false),
                TeamSize = table.Column<int>(type: "int", nullable: false),
                HasReturnMatches = table.Column<bool>(type: "bit", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Tournaments", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "TournamentTeams",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                TournamentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_TournamentTeams", x => x.Id);
                table.ForeignKey(
                    name: "FK_TournamentTeams_Tournaments_TournamentId",
                    column: x => x.TournamentId,
                    principalTable: "Tournaments",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "PlayerTournamentTeam",
            columns: table => new
            {
                PlayersId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                TournamentTeamId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_PlayerTournamentTeam", x => new { x.PlayersId, x.TournamentTeamId });
                table.ForeignKey(
                    name: "FK_PlayerTournamentTeam_Players_PlayersId",
                    column: x => x.PlayersId,
                    principalTable: "Players",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_PlayerTournamentTeam_TournamentTeams_TournamentTeamId",
                    column: x => x.TournamentTeamId,
                    principalTable: "TournamentTeams",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Matches_TournamentId",
            table: "Matches",
            column: "TournamentId");

        migrationBuilder.CreateIndex(
            name: "IX_PlayerTournamentTeam_TournamentTeamId",
            table: "PlayerTournamentTeam",
            column: "TournamentTeamId");

        migrationBuilder.CreateIndex(
            name: "IX_TournamentTeams_TournamentId",
            table: "TournamentTeams",
            column: "TournamentId");

        migrationBuilder.AddForeignKey(
            name: "FK_Matches_Tournaments_TournamentId",
            table: "Matches",
            column: "TournamentId",
            principalTable: "Tournaments",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Matches_Tournaments_TournamentId",
            table: "Matches");

        migrationBuilder.DropTable(
            name: "PlayerTournamentTeam");

        migrationBuilder.DropTable(
            name: "TournamentTeams");

        migrationBuilder.DropTable(
            name: "Tournaments");

        migrationBuilder.DropIndex(
            name: "IX_Matches_TournamentId",
            table: "Matches");

        migrationBuilder.DropColumn(
            name: "TournamentId",
            table: "Matches");
    }
}
