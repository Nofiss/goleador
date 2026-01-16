using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goleador.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTournamentRegistrations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TournamentRegistration",
                columns: table => new
                {
                    TournamentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RegisteredAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TournamentRegistration", x => new { x.TournamentId, x.PlayerId });
                    table.ForeignKey(
                        name: "FK_TournamentRegistration_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TournamentRegistration_Tournaments_TournamentId",
                        column: x => x.TournamentId,
                        principalTable: "Tournaments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TournamentRegistration_PlayerId",
                table: "TournamentRegistration",
                column: "PlayerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TournamentRegistration");
        }
    }
}
