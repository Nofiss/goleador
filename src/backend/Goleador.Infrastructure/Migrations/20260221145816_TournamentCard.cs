using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goleador.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TournamentCard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TournamentCardDefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TournamentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Effect = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TournamentCardDefinitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TournamentCardDefinitions_Tournaments_TournamentId",
                        column: x => x.TournamentId,
                        principalTable: "Tournaments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MatchCardUsages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MatchId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TeamId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CardDefinitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MatchCardUsages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MatchCardUsages_Matches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "Matches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MatchCardUsages_TournamentCardDefinitions_CardDefinitionId",
                        column: x => x.CardDefinitionId,
                        principalTable: "TournamentCardDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MatchCardUsages_TournamentTeams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "TournamentTeams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MatchCardUsages_CardDefinitionId",
                table: "MatchCardUsages",
                column: "CardDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_MatchCardUsages_MatchId",
                table: "MatchCardUsages",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_MatchCardUsages_TeamId",
                table: "MatchCardUsages",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentCardDefinitions_TournamentId",
                table: "TournamentCardDefinitions",
                column: "TournamentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MatchCardUsages");

            migrationBuilder.DropTable(
                name: "TournamentCardDefinitions");
        }
    }
}
