using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goleador.Infrastructure.Migrations;

/// <inheritdoc />
public partial class SoftDelete : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "DeletedAt",
            table: "TournamentTeams",
            type: "datetimeoffset",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "IsDeleted",
            table: "TournamentTeams",
            type: "bit",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "DeletedAt",
            table: "Tournaments",
            type: "datetimeoffset",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "IsDeleted",
            table: "Tournaments",
            type: "bit",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "DeletedAt",
            table: "Players",
            type: "datetimeoffset",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "IsDeleted",
            table: "Players",
            type: "bit",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "DeletedAt",
            table: "Matches",
            type: "datetimeoffset",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "IsDeleted",
            table: "Matches",
            type: "bit",
            nullable: false,
            defaultValue: false);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "DeletedAt",
            table: "TournamentTeams");

        migrationBuilder.DropColumn(
            name: "IsDeleted",
            table: "TournamentTeams");

        migrationBuilder.DropColumn(
            name: "DeletedAt",
            table: "Tournaments");

        migrationBuilder.DropColumn(
            name: "IsDeleted",
            table: "Tournaments");

        migrationBuilder.DropColumn(
            name: "DeletedAt",
            table: "Players");

        migrationBuilder.DropColumn(
            name: "IsDeleted",
            table: "Players");

        migrationBuilder.DropColumn(
            name: "DeletedAt",
            table: "Matches");

        migrationBuilder.DropColumn(
            name: "IsDeleted",
            table: "Matches");
    }
}
