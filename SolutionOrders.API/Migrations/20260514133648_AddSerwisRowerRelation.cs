using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SolutionOrders.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSerwisRowerRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Rower",
                table: "Serwisy");

            migrationBuilder.AddColumn<int>(
                name: "RowerId",
                table: "Serwisy",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Serwisy_RowerId",
                table: "Serwisy",
                column: "RowerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Serwisy_Rowery_RowerId",
                table: "Serwisy",
                column: "RowerId",
                principalTable: "Rowery",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Serwisy_Rowery_RowerId",
                table: "Serwisy");

            migrationBuilder.DropIndex(
                name: "IX_Serwisy_RowerId",
                table: "Serwisy");

            migrationBuilder.DropColumn(
                name: "RowerId",
                table: "Serwisy");

            migrationBuilder.AddColumn<string>(
                name: "Rower",
                table: "Serwisy",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
