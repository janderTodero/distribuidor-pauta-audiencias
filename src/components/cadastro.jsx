import { useState } from "react";

export default function CadastroPessoas({ pessoas, setPessoas }) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("advogado");
  const [limite, setLimite] = useState(3);

  const [disponibilidade, setDisponibilidade] = useState({
    segunda: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
    terca: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
    quarta: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
    quinta: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
    sexta: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
  });

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
    setDisponibilidade({
      segunda: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
      terca: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
      quarta: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
      quinta: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
      sexta: [{ ativo: true, inicio: "08:00", fim: "17:00" }],
    });
    setPermissoes({ AIJ: true, CONC: true });
  };

  const removerPessoa = (index) => {
    const novasPessoas = pessoas.filter((_, i) => i !== index);
    setPessoas(novasPessoas);
  };

  return (
    <div className="p-8 bg-white rounded-2xl shadow-lg w-full max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Cadastro de Pessoas</h2>

      <div className="flex flex-col gap-4 mb-6">
        {/* Formulário */}
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
          className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        {/* Permissões */}
        <div className="flex gap-6 my-2">
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={permissoes.AIJ}
              onChange={() => setPermissoes({ ...permissoes, AIJ: !permissoes.AIJ })}
              className="w-4 h-4"
            />
            ACIJ / AIJ
          </label>
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={permissoes.CONC}
              onChange={() => setPermissoes({ ...permissoes, CONC: !permissoes.CONC })}
              className="w-4 h-4"
            />
            CONC
          </label>
        </div>

        {/* Disponibilidade */}
        <div className="flex flex-col gap-6 mt-4">
          {Object.keys(disponibilidade).map((dia) => (
            <div key={dia} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <strong className="block mb-2 capitalize text-gray-800">{dia}</strong>
              {disponibilidade[dia].map((faixa, index) => (
                <div key={index} className="flex items-center gap-3 mb-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={faixa.ativo}
                      onChange={() => toggleDia(dia, index)}
                      className="w-4 h-4"
                    />
                    Ativo
                  </label>

                  <input
                    type="time"
                    value={faixa.inicio}
                    onChange={(e) => alterarHorario(dia, index, "inicio", e.target.value)}
                    className="border border-gray-300 px-2 py-1 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-gray-500">até</span>
                  <input
                    type="time"
                    value={faixa.fim}
                    onChange={(e) => alterarHorario(dia, index, "fim", e.target.value)}
                    className="border border-gray-300 px-2 py-1 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />

                  {disponibilidade[dia].length > 1 && (
                    <button
                      onClick={() => removerFaixa(dia, index)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => adicionarFaixa(dia)}
                className="mt-2 text-sm bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
              >
                + Adicionar faixa
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={adicionarPessoa}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 font-medium mt-6"
        >
          Adicionar Pessoa
        </button>
      </div>

      {/* Lista de pessoas */}
      <h3 className="text-2xl font-semibold mb-3 text-gray-800">Lista de Pessoas</h3>
      <ul className="space-y-2">
        {pessoas.map((p, idx) => (
          <li
            key={idx}
            className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 flex justify-between items-center"
          >
            <div>
              <span className="font-medium">{p.nome}</span> ({p.tipo}) —{" "}
              <span className="text-gray-600">
                Limite: {p.limiteDiario}/dia
              </span>{" "}
              <span className="ml-2 text-gray-500 text-sm">
                Permissões: {p.permissoes.AIJ ? "ACIJ / AIJ " : ""}
                {p.permissoes.CONC ? "CONC" : ""}
              </span>
            </div>
            <button
              onClick={() => removerPessoa(idx)}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
