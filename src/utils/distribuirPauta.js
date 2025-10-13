export default function distribuirPauta(pauta, pessoas) {
  if (!pauta || pauta.length === 0) {
    alert("Importe a pauta primeiro!");
    return [];
  }
  if (!pessoas || pessoas.length === 0) {
    alert("Cadastre advogados e prepostos primeiro!");
    return [];
  }

  const advogados = pessoas.filter((p) => p.tipo === "ADVOGADO");
  const prepostos = pessoas.filter((p) => p.tipo === "PREPOSTO");

  const contagemAdv = {};
  const contagemPrep = {};
  const contagemAdvDia = {};
  const contagemPrepDia = {};
  const horariosAdv = {};
  const horariosPrep = {};
  const contagemSemanalAdv = {};
  const contagemSemanalPrep = {};

  advogados.forEach((a) => {
    contagemAdv[a.nome] = 0;
    contagemAdvDia[a.nome] = {};
    horariosAdv[a.nome] = {};
    contagemSemanalAdv[a.nome] = 0;
  });
  prepostos.forEach((p) => {
    contagemPrep[p.nome] = 0;
    contagemPrepDia[p.nome] = {};
    horariosPrep[p.nome] = {};
    contagemSemanalPrep[p.nome] = 0;
  });

  const diaMap = [
    "domingo",
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sabado",
  ];

  const dentroDaFaixa = (horaAtual, faixas) => {
    if (!faixas || faixas.length === 0) return false;
    return faixas.some((faixa) => {
      if (!faixa.ativo) return false;
      const inicio =
        parseInt(faixa.inicio.split(":")[0]) * 60 +
        parseInt(faixa.inicio.split(":")[1]);
      const fim =
        parseInt(faixa.fim.split(":")[0]) * 60 +
        parseInt(faixa.fim.split(":")[1]);
      return horaAtual >= inicio && horaAtual <= fim;
    });
  };

  // 🔹 Função auxiliar para calcular total de minutos disponíveis na semana
  const calcularDisponibilidadeTotal = (pessoa) => {
    if (!pessoa.disponibilidade) return 0;
    return Object.values(pessoa.disponibilidade).reduce((acc, faixas) => {
      if (!Array.isArray(faixas)) return acc;
      return (
        acc +
        faixas
          .filter((f) => f.ativo)
          .reduce((soma, f) => {
            const inicio =
              parseInt(f.inicio.split(":")[0]) * 60 +
              parseInt(f.inicio.split(":")[1]);
            const fim =
              parseInt(f.fim.split(":")[0]) * 60 +
              parseInt(f.fim.split(":")[1]);
            return soma + (fim - inicio);
          }, 0)
      );
    }, 0);
  };

  const contabilizarExistente = (
    nome,
    contagemGeral,
    contagemDia,
    horarios,
    dia,
    horaAtual,
    contagemSemanal
  ) => {
    if (!nome) return;

    if (!contagemDia[nome]) contagemDia[nome] = {};
    if (!horarios[nome]) horarios[nome] = {};
    if (!horarios[nome][dia]) horarios[nome][dia] = [];

    contagemGeral[nome] = (contagemGeral[nome] || 0) + 1;
    contagemDia[nome][dia] = (contagemDia[nome][dia] || 0) + 1;
    contagemSemanal[nome] = (contagemSemanal[nome] || 0) + 1;

    horarios[nome][dia].push(horaAtual);
  };

  const escolherPessoa = (
    lista,
    contagemGeral,
    contagemDia,
    horarios,
    dia,
    horaAtual,
    tipoAudiencia,
    contagemSemanal
  ) => {
    const disponiveis = lista.filter((p) => p.disponibilidade?.[dia]?.length > 0);

    let aptos = disponiveis.filter((p) => {
      const qtdHoje = contagemDia[p.nome][dia] || 0;
      const limitePessoa = p.limiteDiario || 3;
      if (qtdHoje >= limitePessoa) return false;

      if (!dentroDaFaixa(horaAtual, p.disponibilidade[dia])) return false;

      const horariosDia = horarios[p.nome][dia] || [];
      const conflito = horariosDia.some((h) => Math.abs(h - horaAtual) < 90);
      if (conflito) return false;

      return true;
    });

    aptos = aptos.filter((p) => {
      const permissoesDia = p.permissoes?.[dia] ?? { AIJ: false, CONC: false };
      if (tipoAudiencia.toUpperCase().startsWith("A")) return !!permissoesDia.AIJ;
      if (tipoAudiencia.toUpperCase().startsWith("C")) return !!permissoesDia.CONC;
      return true;
    });

    if (aptos.length === 0) return null;

    // 🔥 Novo balanceamento proporcional à disponibilidade
    aptos.sort((a, b) => {
      const dispA = calcularDisponibilidadeTotal(a) || 1;
      const dispB = calcularDisponibilidadeTotal(b) || 1;

      // peso combinado: semanal (2x), diário (1x), total (0.5x)
      const scoreA =
        (contagemSemanal[a.nome] / dispA) * 2 +
        (contagemDia[a.nome][dia] || 0) * 1 +
        contagemGeral[a.nome] * 0.5;

      const scoreB =
        (contagemSemanal[b.nome] / dispB) * 2 +
        (contagemDia[b.nome][dia] || 0) * 1 +
        contagemGeral[b.nome] * 0.5;

      if (scoreA === scoreB) return Math.random() - 0.5; // desempate aleatório leve
      return scoreA - scoreB;
    });

    const escolhido = aptos[0];

    contagemGeral[escolhido.nome]++;
    contagemDia[escolhido.nome][dia] =
      (contagemDia[escolhido.nome][dia] || 0) + 1;
    contagemSemanal[escolhido.nome]++;

    if (!horarios[escolhido.nome][dia]) horarios[escolhido.nome][dia] = [];
    horarios[escolhido.nome][dia].push(horaAtual);

    return escolhido.nome;
  };

  const novaPauta = pauta.map((row) => {
    const dt =
      row.datetime instanceof Date ? row.datetime : new Date(row.datetime);
    const dia = diaMap[dt.getDay()];
    const horaAtual = dt.getHours() * 60 + dt.getMinutes();
    const tipoAudiencia = row["AC / AIJ / ACIJ"] || row["TIPO"] || "";

    const correspondente = row["CORRESPONDENTE"] || null;

    const advExistente =
      row["ADVOGADO(A)"] && row["ADVOGADO(A)"].trim() !== "";
    const prepExistente =
      row["PREPOSTO(A)"] && row["PREPOSTO(A)"].trim() !== "";

    let adv = advExistente
      ? row["ADVOGADO(A)"]
      : escolherPessoa(
          advogados,
          contagemAdv,
          contagemAdvDia,
          horariosAdv,
          dia,
          horaAtual,
          tipoAudiencia,
          contagemSemanalAdv
        );

    let prep = prepExistente
      ? row["PREPOSTO(A)"]
      : escolherPessoa(
          prepostos,
          contagemPrep,
          contagemPrepDia,
          horariosPrep,
          dia,
          horaAtual,
          tipoAudiencia,
          contagemSemanalPrep
        );

    if ((!advExistente && !prepExistente) && (!adv || !prep)) {
      adv = null;
      prep = null;
    }

    if (advExistente)
      contabilizarExistente(
        adv,
        contagemAdv,
        contagemAdvDia,
        horariosAdv,
        dia,
        horaAtual,
        contagemSemanalAdv
      );
    if (prepExistente)
      contabilizarExistente(
        prep,
        contagemPrep,
        contagemPrepDia,
        horariosPrep,
        dia,
        horaAtual,
        contagemSemanalPrep
      );

    row["ADVOGADO(A)"] = adv;
    row["PREPOSTO(A)"] = prep;
    row["CORRESPONDENTE"] = correspondente || row["CORRESPONDENTE"];
    row["dia"] = dia;
    row["hora"] = dt.getHours();

    return row;
  });

  // 🧾 (opcional) visualizar distribuição
  console.log("Distribuição semanal - Advogados:", contagemSemanalAdv);
  console.log("Distribuição semanal - Prepostos:", contagemSemanalPrep);

  return novaPauta;
}
