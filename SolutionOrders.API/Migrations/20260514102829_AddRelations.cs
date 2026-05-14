using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SolutionOrders.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Klient",
                table: "Wypozyczenia");

            migrationBuilder.DropColumn(
                name: "Rower",
                table: "Wypozyczenia");

            migrationBuilder.AddColumn<int>(
                name: "KlientId",
                table: "Wypozyczenia",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "PozycjeWypozyczenia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WypozyczenieId = table.Column<int>(type: "int", nullable: false),
                    RowerId = table.Column<int>(type: "int", nullable: false),
                    CenaZaGodzine = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PozycjeWypozyczenia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PozycjeWypozyczenia_Rowery_RowerId",
                        column: x => x.RowerId,
                        principalTable: "Rowery",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PozycjeWypozyczenia_Wypozyczenia_WypozyczenieId",
                        column: x => x.WypozyczenieId,
                        principalTable: "Wypozyczenia",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Rowery",
                keyColumn: "Id",
                keyValue: 2,
                column: "Status",
                value: "Dostępny");

            migrationBuilder.InsertData(
                table: "Wypozyczenia",
                columns: new[] { "Id", "DataWypozyczenia", "DataZwrotu", "KlientId", "Status" },
                values: new object[] { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, 1, "Aktywne" });

            migrationBuilder.InsertData(
                table: "PozycjeWypozyczenia",
                columns: new[] { "Id", "CenaZaGodzine", "RowerId", "WypozyczenieId" },
                values: new object[] { 1, 15m, 1, 1 });

            migrationBuilder.CreateIndex(
                name: "IX_Wypozyczenia_KlientId",
                table: "Wypozyczenia",
                column: "KlientId");

            migrationBuilder.CreateIndex(
                name: "IX_PozycjeWypozyczenia_RowerId",
                table: "PozycjeWypozyczenia",
                column: "RowerId");

            migrationBuilder.CreateIndex(
                name: "IX_PozycjeWypozyczenia_WypozyczenieId",
                table: "PozycjeWypozyczenia",
                column: "WypozyczenieId");

            migrationBuilder.AddForeignKey(
                name: "FK_Wypozyczenia_Klienci_KlientId",
                table: "Wypozyczenia",
                column: "KlientId",
                principalTable: "Klienci",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Wypozyczenia_Klienci_KlientId",
                table: "Wypozyczenia");

            migrationBuilder.DropTable(
                name: "PozycjeWypozyczenia");

            migrationBuilder.DropIndex(
                name: "IX_Wypozyczenia_KlientId",
                table: "Wypozyczenia");

            migrationBuilder.DeleteData(
                table: "Wypozyczenia",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DropColumn(
                name: "KlientId",
                table: "Wypozyczenia");

            migrationBuilder.AddColumn<string>(
                name: "Klient",
                table: "Wypozyczenia",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Rower",
                table: "Wypozyczenia",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Rowery",
                keyColumn: "Id",
                keyValue: 2,
                column: "Status",
                value: "Wypożyczony");
        }
    }
}
