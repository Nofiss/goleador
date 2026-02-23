using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goleador.Infrastructure.Migrations;

/// <inheritdoc />
public partial class UpdateModelChanges : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "LogoUrl",
            table: "TournamentTeams",
            type: "nvarchar(max)",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "SponsorUrl",
            table: "TournamentTeams",
            type: "nvarchar(max)",
            nullable: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "LogoUrl",
            table: "TournamentTeams");

        migrationBuilder.DropColumn(
            name: "SponsorUrl",
            table: "TournamentTeams");
    }
}
