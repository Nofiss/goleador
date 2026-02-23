using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goleador.Infrastructure.Migrations;

/// <inheritdoc />
public partial class AddTournamentNotesAndScoring : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "Notes",
            table: "Tournaments",
            type: "nvarchar(2000)",
            maxLength: 2000,
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "ScoringRules_EnableTenZeroBonus",
            table: "Tournaments",
            type: "bit",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<int>(
            name: "ScoringRules_GoalThreshold",
            table: "Tournaments",
            type: "int",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "ScoringRules_GoalThresholdBonus",
            table: "Tournaments",
            type: "int",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<int>(
            name: "ScoringRules_PointsForDraw",
            table: "Tournaments",
            type: "int",
            nullable: false,
            defaultValue: 1);

        migrationBuilder.AddColumn<int>(
            name: "ScoringRules_PointsForLoss",
            table: "Tournaments",
            type: "int",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<int>(
            name: "ScoringRules_PointsForWin",
            table: "Tournaments",
            type: "int",
            nullable: false,
            defaultValue: 3);

        migrationBuilder.AddColumn<int>(
            name: "ScoringRules_TenZeroBonus",
            table: "Tournaments",
            type: "int",
            nullable: false,
            defaultValue: 0);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "Notes",
            table: "Tournaments");

        migrationBuilder.DropColumn(
            name: "ScoringRules_EnableTenZeroBonus",
            table: "Tournaments");

        migrationBuilder.DropColumn(
            name: "ScoringRules_GoalThreshold",
            table: "Tournaments");

        migrationBuilder.DropColumn(
            name: "ScoringRules_GoalThresholdBonus",
            table: "Tournaments");

        migrationBuilder.DropColumn(
            name: "ScoringRules_PointsForDraw",
            table: "Tournaments");

        migrationBuilder.DropColumn(
            name: "ScoringRules_PointsForLoss",
            table: "Tournaments");

        migrationBuilder.DropColumn(
            name: "ScoringRules_PointsForWin",
            table: "Tournaments");

        migrationBuilder.DropColumn(
            name: "ScoringRules_TenZeroBonus",
            table: "Tournaments");
    }
}
