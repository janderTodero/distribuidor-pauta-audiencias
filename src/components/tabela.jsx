import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";

export default function Tabela({ pauta, setPauta }) {
  const [columns, setColumns] = useState([]);
  const [columnSizing, setColumnSizing] = useState({});
  const [maxRows, setMaxRows] = useState("");
  const topScrollRef = useRef(null);
  const tableWrapperRef = useRef(null);

  const excelDateToJSDate = (excelDate) => {
    if (typeof excelDate !== "number") return new Date(excelDate);
    const utc_days = Math.floor(excelDate - 25569 + 1);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    const fractional_day = excelDate - Math.floor(excelDate) + 0.0000001;
    let total_seconds = Math.floor(86400 * fractional_day);
    const seconds = total_seconds % 60;
    total_seconds -= seconds;
    const hours = Math.floor(total_seconds / 3600);
    const minutes = Math.floor((total_seconds % 3600) / 60);
    date_info.setHours(hours);
    date_info.setMinutes(minutes);
    date_info.setSeconds(seconds);
    return date_info;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const sheetName = workbook.SheetNames.find((name) =>
        name.toLowerCase().includes("pauta")
      );
      if (!sheetName) {
        alert("Não foi encontrada a aba PAUTA no Excel.");
        return;
      }
      const ws = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const limit = maxRows ? parseInt(maxRows) - 1 : jsonData.length;
      const limitedData = jsonData.slice(0, limit).map((row, idx) => {
        const newRow = {};
        Object.keys(row).forEach((key) => {
          if (row[key] !== "" && row[key] !== null && row[key] !== undefined) {
            newRow[key] = row[key];
          }
        });
        let d = new Date();
        if (newRow["DATA"]) {
          d = excelDateToJSDate(newRow["DATA"]);
          if (newRow["HORA"]) {
            const h = excelDateToJSDate(newRow["HORA"]);
            d.setHours(h.getHours());
            d.setMinutes(h.getMinutes());
            d.setSeconds(h.getSeconds());
          }
        }
        newRow["datetime"] = d;
        return { ...newRow, _rowIndex: idx }; // Adiciona índice único
      });
      setPauta(limitedData);

      if (limitedData.length > 0) {
        const cols = Object.keys(limitedData[0])
          .filter((key) => !key.toUpperCase().includes("LINK"))
          .map((key) => {
            if (key.toUpperCase() === "DATA") {
              return {
                accessorKey: key,
                header: key,
                enableResizing: true,
                size: 120,
                cell: (info) => {
                  const d = info.row.original.datetime;
                  if (!d) return "";
                  return `${String(d.getDate()).padStart(2, "0")}/${String(
                    d.getMonth() + 1
                  ).padStart(2, "0")}/${d.getFullYear()}`;
                },
              };
            } else if (key.toUpperCase() === "HORA") {
              return {
                accessorKey: key,
                header: key,
                enableResizing: true,
                size: 80,
                cell: (info) => {
                  const d = info.row.original.datetime;
                  if (!d) return "";
                  return `${String(d.getHours()).padStart(2, "0")}:${String(
                    d.getMinutes()
                  ).padStart(2, "0")}`;
                },
              };
            }
            return {
              accessorKey: key,
              header: key,
              enableResizing: true,
              size: 150,
              minSize: 50,
              maxSize: 500,
            };
          });
        setColumns(cols);
      }
    };
    reader.readAsBinaryString(file);
  };

  const table = useReactTable({
    data: pauta,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: { columnSizing },
    onColumnSizingChange: setColumnSizing,
  });

  useEffect(() => {
    const topScroll = topScrollRef.current;
    const tableWrapper = tableWrapperRef.current;
    if (!topScroll || !tableWrapper) return;
    const onTableScroll = () => (topScroll.scrollLeft = tableWrapper.scrollLeft);
    const onTopScroll = () => (tableWrapper.scrollLeft = topScroll.scrollLeft);
    tableWrapper.addEventListener("scroll", onTableScroll);
    topScroll.addEventListener("scroll", onTopScroll);
    return () => {
      tableWrapper.removeEventListener("scroll", onTableScroll);
      topScroll.removeEventListener("scroll", onTopScroll);
    };
  }, []);

  return (
    <div className="bg-white shadow-lg rounded-2xl w-full max-w-6xl p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-700 text-center">
        Distribuição de Audiências
      </h1>

      <div className="flex justify-center mb-4 gap-4">
        <label className="flex flex-col items-center">
          Última linha a considerar:
          <input
            type="number"
            value={maxRows}
            onChange={(e) => setMaxRows(e.target.value)}
            placeholder="Ex: 82"
            className="border rounded px-2 py-1 w-24 mt-1 text-center"
          />
        </label>
      </div>

      <div className="flex justify-center mb-6">
        <label className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow cursor-pointer hover:bg-blue-700 transition">
          Importar Excel
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      <div ref={topScrollRef} className="overflow-x-auto w-full mb-2 h-4 bg-gray-200">
        <div style={{ width: table.getTotalSize(), height: 1 }} />
      </div>

      <div ref={tableWrapperRef} className="overflow-x-auto w-full">
        <table className="min-w-max border border-gray-300 text-xs">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border px-2 py-1 bg-gray-100 font-medium text-gray-700 text-center whitespace-nowrap relative"
                    style={{ width: header.getSize() }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanResize() && (
                      <div
                        {...{
                          onMouseDown: header.getResizeHandler(),
                          onTouchStart: header.getResizeHandler(),
                          className: "absolute right-0 top-0 h-full w-2 cursor-col-resize bg-gray-300",
                        }}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.original._rowIndex} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={row.original._rowIndex + "_" + cell.column.id}
                    className="border px-2 py-1 text-gray-800 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
