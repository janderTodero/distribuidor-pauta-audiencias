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

  // Separação das listas
  const advogados = pessoas.map((p, i) => ({ ...p, originalIndex: i })).filter(p => p.tipo === "ADVOGADO");
  const prepostos = pessoas.map((p, i) => ({ ...p, originalIndex: i })).filter(p => p.tipo === "PREPOSTO");

  const PersonCard = ({ p }) => (
    <div className="p-4 border border-slate-700 rounded-xl bg-slate-800 text-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-lg text-white">{p.nome}</h4>
          <span className="text-xs font-semibold bg-slate-700 px-2 py-1 rounded text-slate-300 uppercase tracking-wide">
            {p.tipo}
          </span>
          <span className="ml-2 text-sm text-slate-400">Max: {p.limiteDiario}/dia</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => editarPessoa(p.originalIndex)}
            className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => removerPessoa(p.originalIndex)}
            className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {diasSemana.map((dia) => {
          const faixas = p.disponibilidade[dia] || [];
          const ativas = faixas.filter(f => f.ativo);
          const perms = p.permissoes[dia];

          if (ativas.length === 0) return null;

          return (
            <div key={dia} className="flex flex-col sm:flex-row sm:items-center gap-2 border-t border-slate-700 pt-2 mt-2">
              <span className="capitalize font-medium text-slate-400 w-20 shrink-0">{dia}</span>

              <div className="flex-1 flex flex-wrap gap-2">
                {ativas.map((f, idx) => (
                  <span key={idx} className="bg-slate-700 px-2 py-0.5 rounded text-xs text-slate-200">
                    {f.inicio}-{f.fim}
                  </span>
                ))}
              </div>

              <div className="flex gap-1 shrink-0">
                {perms?.AIJ && <span className="text-[10px] font-bold bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded">AIJ</span>}
                {perms?.CONC && <span className="text-[10px] font-bold bg-green-900 text-green-200 px-1.5 py-0.5 rounded">CONC</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Gestão de Equipe</h2>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Formulário (Sticky na desktop) */}
        <div className="w-full lg:w-1/3 lg:sticky lg:top-6">
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
            <h3 className="text-xl font-semibold mb-4 text-white border-b border-slate-700 pb-2">
              {editIndex !== null ? "Editar Cadastro" : "Novo Cadastro"}
            </h3>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-500"
              />

              <div className="flex gap-4">
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="advogado">Advogado</option>
                  <option value="preposto">Preposto</option>
                </select>

                <input
                  type="number"
                  min="1"
                  placeholder="Limite"
                  value={limite}
                  onChange={(e) => setLimite(parseInt(e.target.value))}
                  className="w-24 bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <select
                onChange={(e) => {
                  const turno = e.target.value;
                  if (turno === "custom") return;

                  let inicio = "09:00";
                  let fim = "18:00";

                  if (turno === "manha") {
                    inicio = "08:10";
                    fim = "13:00";
                  } else if (turno === "tarde") {
                    inicio = "13:10";
                    fim = "17:00";
                  } else if (turno === "integral") {
                    inicio = "09:00";
                    fim = "18:00";
                  }

                  setDisponibilidade(
                    diasSemana.reduce((acc, dia) => {
                      acc[dia] = [{ ativo: true, inicio, fim }];
                      return acc;
                    }, {})
                  );
                }}
                defaultValue="custom"
                className="bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              >
                <option value="custom" disabled>Preenchimento rápido (Turnos)</option>
                <option value="manha">Manhã (08:10 - 13:00)</option>
                <option value="tarde">Tarde (13:10 - 17:00)</option>
                <option value="integral">Integral (09:00 - 18:00)</option>
              </select>

              {/* Disponibilidade + permissões */}
              <div className="flex flex-col gap-4 mt-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {diasSemana.map((dia) => (
                  <div key={dia} className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-center mb-3">
                      <strong className="capitalize text-blue-400">{dia}</strong>
                      <div className="flex gap-3">
                        <label className="flex items-center gap-1.5 text-slate-300 text-xs cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={permissoes[dia].AIJ}
                            onChange={() => togglePermissao(dia, "AIJ")}
                            className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-offset-slate-900"
                          />
                          AIJ
                        </label>
                        <label className="flex items-center gap-1.5 text-slate-300 text-xs cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={permissoes[dia].CONC}
                            onChange={() => togglePermissao(dia, "CONC")}
                            className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-green-500 focus:ring-offset-slate-900"
                          />
                          CONC
                        </label>
                      </div>
                    </div>

                    {/* Horários */}
                    {disponibilidade[dia].map((faixa, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={faixa.ativo}
                          onChange={() => toggleDia(dia, index)}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-offset-slate-900"
                        />

                        <input
                          type="time"
                          value={faixa.inicio}
                          onChange={(e) => alterarHorario(dia, index, "inicio", e.target.value)}
                          className="bg-slate-800 border border-slate-600 text-white px-2 py-1 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none w-20"
                        />
                        <span className="text-slate-500 text-xs">às</span>
                        <input
                          type="time"
                          value={faixa.fim}
                          onChange={(e) => alterarHorario(dia, index, "fim", e.target.value)}
                          className="bg-slate-800 border border-slate-600 text-white px-2 py-1 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none w-20"
                        />

                        {disponibilidade[dia].length > 1 && (
                          <button
                            onClick={() => removerFaixa(dia, index)}
                            className="text-red-400 hover:text-red-300 ml-auto"
                            title="Remover horário"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => adicionarFaixa(dia)}
                      className="mt-1 text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                    >
                      + Horário
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={adicionarPessoa}
                className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-500 font-semibold mt-4 shadow-lg transition-all active:scale-95"
              >
                {editIndex !== null ? "Salvar Alterações" : "Adicionar Pessoa"}
              </button>
              {editIndex !== null && (
                <button
                  onClick={resetForm}
                  className="text-slate-400 hover:text-slate-200 text-sm text-center"
                >
                  Cancelar Edição
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Listas (Direita) */}
        <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna Advogados */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                👨‍⚖️ Advogados
                <span className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded-full">
                  {advogados.length}
                </span>
              </h3>
            </div>
            <div className="flex flex-col gap-4">
              {advogados.length === 0 && (
                <p className="text-slate-500 italic text-sm">Nenhum advogado cadastrado.</p>
              )}
              {advogados.map((p) => (
                <PersonCard key={p.originalIndex} p={p} />
              ))}
            </div>
          </div>

          {/* Coluna Prepostos */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
                🤝 Prepostos
                <span className="bg-green-900 text-green-200 text-xs px-2 py-1 rounded-full">
                  {prepostos.length}
                </span>
              </h3>
            </div>
            <div className="flex flex-col gap-4">
              {prepostos.length === 0 && (
                <p className="text-slate-500 italic text-sm">Nenhum preposto cadastrado.</p>
              )}
              {prepostos.map((p) => (
                <PersonCard key={p.originalIndex} p={p} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
