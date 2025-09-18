import * as XLSX from "xlsx";

export default function ExportarExcel({ data, fileName = "tabela.xlsx" }) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    // gera um novo array apenas com as colunas desejadas
   const exportData = data.map((row) => ({
  "ADVOGADO(A)": row["ADVOGADO(A)"] || "",
  "PREPOSTO(A)": row["PREPOSTO(A)"] || "",
}));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tabela");

    XLSX.writeFile(wb, fileName);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
    >
      Exportar Excel
    </button>
  );
}

