using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goleador.Infrastructure.Migrations;

/// <inheritdoc />
public partial class AddTableEntity : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Tables",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                Location = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Tables", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Matches_TableId",
            table: "Matches",
            column: "TableId");

        migrationBuilder.AddForeignKey(
            name: "FK_Matches_Tables_TableId",
            table: "Matches",
            column: "TableId",
            principalTable: "Tables",
            principalColumn: "Id");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Matches_Tables_TableId",
            table: "Matches");

        migrationBuilder.DropTable(
            name: "Tables");

        migrationBuilder.DropIndex(
            name: "IX_Matches_TableId",
            table: "Matches");
    }
}
