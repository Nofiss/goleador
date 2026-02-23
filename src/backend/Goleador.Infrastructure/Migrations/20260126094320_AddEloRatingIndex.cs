using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goleador.Infrastructure.Migrations;

/// <inheritdoc />
public partial class AddEloRatingIndex : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateIndex(
            name: "IX_Players_EloRating",
            table: "Players",
            column: "EloRating");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_Players_EloRating",
            table: "Players");
    }
}
