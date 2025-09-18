import { useEffect, useState } from "react";
import Tabela from "./components/tabela";
import CadastroPessoas from "./components/cadastro";
import distribuirPauta from "./utils/distribuirPauta";
import ExportarExcel from "./components/exportarExcel";

export default function App() {
  const [pessoas, setPessoas] = useState(() => {
    const saved = localStorage.getItem("pessoas");
    return saved ? JSON.parse(saved) : [];
  });

  const [pauta, setPauta] = useState(() => {
    const saved = localStorage.getItem("pauta");
    return saved ? JSON.parse(saved) : [];
  });

  // salvar sempre que mudar
  useEffect(() => {
    localStorage.setItem("pessoas", JSON.stringify(pessoas));
  }, [pessoas]);

  useEffect(() => {
    localStorage.setItem("pauta", JSON.stringify(pauta));
  }, [pauta]);

  const handleDistribuir = () => {
    const novaPauta = distribuirPauta(pauta, pessoas);
    setPauta(novaPauta);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center gap-6">
      <CadastroPessoas pessoas={pessoas} setPessoas={setPessoas} />

      <button
        onClick={handleDistribuir}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
      >
        Distribuir Pauta Automaticamente
      </button>

      <Tabela pauta={pauta} setPauta={setPauta} pessoas={pessoas} />
      <ExportarExcel data={pauta} fileName="audiencias.xlsx" />
    </div>
  );
}
