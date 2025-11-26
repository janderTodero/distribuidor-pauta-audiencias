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
    <div className="min-h-screen bg-slate-900 p-6 flex flex-col items-center gap-6 text-gray-100">
      <CadastroPessoas pessoas={pessoas} setPessoas={setPessoas} />

      <button
        onClick={handleDistribuir}
        className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-500 font-semibold shadow-lg transition-all transform hover:scale-105"
      >
        Distribuir Pauta Automaticamente
      </button>

      <Tabela pauta={pauta} setPauta={setPauta} pessoas={pessoas} />
      <ExportarExcel data={pauta} fileName="audiencias.xlsx" />
    </div>
  );
}
