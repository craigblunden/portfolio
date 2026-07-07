using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class CreateGoals : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "GoalId",
                table: "Todos",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.CreateTable(
                name: "Goals",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Summary = table.Column<string>(type: "TEXT", nullable: false),
                    Tags = table.Column<string>(type: "TEXT", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Goals", x => x.Id);
                }
            );

            migrationBuilder.CreateIndex(name: "IX_Todos_GoalId", table: "Todos", column: "GoalId");

            migrationBuilder.AddForeignKey(
                name: "FK_Todos_Goals_GoalId",
                table: "Todos",
                column: "GoalId",
                principalTable: "Goals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_Todos_Goals_GoalId", table: "Todos");

            migrationBuilder.DropTable(name: "Goals");

            migrationBuilder.DropIndex(name: "IX_Todos_GoalId", table: "Todos");

            migrationBuilder.DropColumn(name: "GoalId", table: "Todos");
        }
    }
}
