import { useState } from "react";

export default function CadastroPessoas({ pessoas, setPessoas }) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("advogado");
  const [limite, setLimite] = useState(1);
  const [editIndex, setEditIndex] = useState(null); // índice da pessoa em edição

  const diasSemana = ["segunda", "terca", "quarta", "quinta", "sexta"];

  const [disponibilidade, setDisponibilidade] = useState(
    diasSemana.reduce((acc, dia) => {
      acc[dia] = [{ ativo: true, inicio: "08:00", fim: "17:00" }];
      return acc;
    }, {})
  );

  const [permissoes, setPermissoes] = useState(
    diasSemana.reduce((acc, dia) => {
      acc[dia] = { AIJ: true, CONC: true };
      return acc;
    }, {})
  );

  const togglePermissao = (dia, tipo) => {
    setPermissoes({
      ...permissoes,
      [dia]: { ...permissoes[dia], [tipo]: !permissoes[dia][tipo] },
    });
  };

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

  const resetForm = () => {
    setNome("");
    setLimite(3);
    setDisponibilidade(
      diasSemana.reduce((acc, dia) => {
        acc[dia] = [{ ativo: true, inicio: "08:00", fim: "17:00" }];
        return acc;
      }, {})
    );
    setPermissoes(
      diasSemana.reduce((acc, dia) => {
        acc[dia] = { AIJ: true, CONC: true };
        return acc;
      }, {})
    );
    setEditIndex(null);
  };

  const adicionarPessoa = () => {
    if (!nome) return alert("Preencha o nome");

    const pessoaObj = {
      nome,
      tipo: tipo.toUpperCase(),
      limiteDiario: limite,
      disponibilidade: { ...disponibilidade },
      permissoes: { ...permissoes },
    };

    if (editIndex !== null) {
      // edição
      const novasPessoas = [...pessoas];
      novasPessoas[editIndex] = pessoaObj;
      setPessoas(novasPessoas);
    } else {
      // cadastro novo
      setPessoas([...pessoas, pessoaObj]);
    }

    resetForm();
  };

  const removerPessoa = (index) => {
    const novasPessoas = pessoas.filter((_, i) => i !== index);
    setPessoas(novasPessoas);
    if (editIndex === index) resetForm();
  };

  const editarPessoa = (index) => {
    const p = pessoas[index];
    setNome(p.nome);
    setTipo(p.tipo.toLowerCase());
    setLimite(p.limiteDiario);
    setDisponibilidade({ ...p.disponibilidade });
    setPermissoes({ ...p.permissoes });
    setEditIndex(index);
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Cadastro de Pessoas</h2>

      <div className="flex gap-8">
        {/* Formulário à esquerda */}
        <div className="w-1/2 bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex flex-col gap-4 mb-6">
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

            {/* Disponibilidade + permissões */}
            <div className="flex flex-col gap-6 mt-4 max-h-[400px] overflow-y-auto">
              {diasSemana.map((dia) => (
                <div key={dia} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <strong className="block mb-2 capitalize text-gray-800">{dia}</strong>

                  {/* Permissões */}
                  <div className="flex gap-6 mb-3">
                    <label className="flex items-center gap-2 text-gray-700">
                      <input
                        type="checkbox"
                        checked={permissoes[dia].AIJ}
                        onChange={() => togglePermissao(dia, "AIJ")}
                        className="w-4 h-4"
                      />
                      ACIJ / AIJ
                    </label>
                    <label className="flex items-center gap-2 text-gray-700">
                      <input
                        type="checkbox"
                        checked={permissoes[dia].CONC}
                        onChange={() => togglePermissao(dia, "CONC")}
                        className="w-4 h-4"
                      />
                      CONC
                    </label>
                  </div>

                  {/* Horários */}
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
              {editIndex !== null ? "Salvar Alterações" : "Adicionar Pessoa"}
            </button>
          </div>
        </div>

        {/* Lista à direita */}
        <div className="w-1/2 bg-white p-6 rounded-2xl shadow-lg max-h-[700px] overflow-y-auto">
          <h3 className="text-2xl font-semibold mb-3 text-gray-800">Lista de Pessoas</h3>
          <ul className="space-y-2">
            {pessoas.map((p, idx) => (
              <li
                key={idx}
                className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 flex justify-between items-center"
              >
                <div>
                  <span className="font-medium">{p.nome}</span> ({p.tipo}) —{" "}
                  <span className="text-gray-600">Limite: {p.limiteDiario}/dia</span>
                  <div className="mt-1 text-gray-500 text-sm">
                    {diasSemana.map((dia) => (
                      <div key={dia}>
                        {dia}: {p.permissoes[dia].AIJ ? "AIJ " : ""}
                        {p.permissoes[dia].CONC ? "CONC" : ""}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editarPessoa(idx)}
                    className="text-yellow-500 hover:text-yellow-700 text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => removerPessoa(idx)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
