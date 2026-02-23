using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goleador.Infrastructure.Migrations;

/// <inheritdoc />
public partial class AddUserIdToPlayer : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "UserId",
            table: "Players",
            type: "nvarchar(450)",
            maxLength: 450,
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_Players_UserId",
            table: "Players",
            column: "UserId",
            unique: true,
            filter: "[UserId] IS NOT NULL");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_Players_UserId",
            table: "Players");

        migrationBuilder.DropColumn(
            name: "UserId",
            table: "Players");
    }
}
