import { useState } from "react";

export default function CadastroPessoas({ pessoas, setPessoas }) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("advogado");
  const [limite, setLimite] = useState(3);

  // cada dia agora é uma lista de faixas
  const [disponibilidade, setDisponibilidade] = useState({
    segunda: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
    terca: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
    quarta: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
    quinta: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
    sexta: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
  });

  // permissões de audiência
  const [permissoes, setPermissoes] = useState({ AIJ: true, CONC: true });

  const toggleDia = (dia, index) => {
    const novasFaixas = [...disponibilidade[dia]];
    novasFaixas[index].ativo = !novasFaixas[index].ativo;
    setDisponibilidade({ ...disponibilidade, [dia]: novasFaixas });
  };

  const alterarHorario = (dia, index, campo, valor) => {
    const novasFaixas = [...disponibilidade[dia]];
    novasFaixas[index][campo] = valor;
    setDisponibilidade({ ...disponibilidade, [dia]: novasFaixas });
  };

  const adicionarFaixa = (dia) => {
    setDisponibilidade({
      ...disponibilidade,
      [dia]: [...disponibilidade[dia], { ativo: true, inicio: "08:00", fim: "17:00" }],
    });
  };

  const removerFaixa = (dia, index) => {
    const novasFaixas = [...disponibilidade[dia]];
    novasFaixas.splice(index, 1);
    setDisponibilidade({ ...disponibilidade, [dia]: novasFaixas });
  };

  const adicionarPessoa = () => {
    if (!nome) return alert("Preencha o nome");
    setPessoas([
      ...pessoas,
      {
        nome,
        tipo: tipo.toUpperCase(),
        limiteDiario: limite,
        disponibilidade: { ...disponibilidade },
        permissoes: { ...permissoes },
      },
    ]);
    setNome("");
    setLimite(3);
    // resetar faixas e permissões
    setDisponibilidade({
      segunda: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
      terca: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
      quarta: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
      quinta: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
      sexta: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
    });
    setPermissoes({ AIJ: true, CONC: true });
  };

  return (
    <div className="p-6 bg-white rounded shadow w-full max-w-xl">
      <h2 className="text-2xl font-bold mb-4">Cadastro de Pessoas</h2>

      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="border px-2 py-1 rounded"
        />

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="advogado">Advogado</option>
          <option value="preposto">Preposto</option>
        </select>

        <input
          type="number"
          min="1"
          placeholder="Limite diário de audiências"
          value={limite}
          onChange={(e) => setLimite(parseInt(e.target.value))}
          className="border px-2 py-1 rounded"
        />

        {/* Permissões */}
        <div className="flex gap-4 my-2">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={permissoes.AIJ}
              onChange={() => setPermissoes({ ...permissoes, AIJ: !permissoes.AIJ })}
            />
            ACIJ / AIJ
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={permissoes.CONC}
              onChange={() => setPermissoes({ ...permissoes, CONC: !permissoes.CONC })}
            />
            CONC
          </label>
        </div>

        <div className="flex flex-col gap-3">
          {Object.keys(disponibilidade).map((dia) => (
            <div key={dia} className="flex flex-col gap-2">
              <strong>{dia}</strong>
              {disponibilidade[dia].map((faixa, index) => (
                <div key={index} className="flex items-center gap-2">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={faixa.ativo}
                      onChange={() => toggleDia(dia, index)}
                    />
                    Ativo
                  </label>

                  <input
                    type="time"
                    value={faixa.inicio}
                    onChange={(e) => alterarHorario(dia, index, "inicio", e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                  até
                  <input
                    type="time"
                    value={faixa.fim}
                    onChange={(e) => alterarHorario(dia, index, "fim", e.target.value)}
                    className="border px-2 py-1 rounded"
                  />

                  {disponibilidade[dia].length > 1 && (
                    <button
                      onClick={() => removerFaixa(dia, index)}
                      className="text-red-600 px-2 py-1 border rounded"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => adicionarFaixa(dia)}
                className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 w-max"
              >
                Adicionar faixa
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={adicionarPessoa}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
        >
          Adicionar
        </button>
      </div>

      <h3 className="text-xl font-semibold mb-2">Lista de Pessoas</h3>
      <ul className="list-disc pl-5">
        {pessoas.map((p, idx) => (
          <li key={idx}>
            {p.nome} ({p.tipo}) - Limite: {p.limiteDiario}/dia - Permissões:{" "}
            {p.permissoes.AIJ ? "ACIJ / AIJ" : ""} {p.permissoes.CONC ? "CONC" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
