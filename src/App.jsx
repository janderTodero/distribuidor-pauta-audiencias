import { useState } from "react";
import Tabela from "./components/tabela";
import CadastroPessoas from "./components/cadastro";
import distribuirPauta from "./utils/distribuirPauta";

export default function App() {
  const [pessoas, setPessoas] = useState([]);
  const [pauta, setPauta] = useState([]);

  console.log("Pauta atual:", pauta);
  console.log("Pessoas cadastradas:", pessoas);

  const handleDistribuir = () => {
    console.log("botao clicado")
    const novaPauta = distribuirPauta(pauta, pessoas); // chama sua função
    console.log("Nova pauta gerada:", novaPauta, pessoas)
    setPauta(novaPauta); // atualiza o estado -> tabela atualiza
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
    </div>
  );
}
