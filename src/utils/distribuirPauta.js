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

  advogados.forEach((a) => {
    contagemAdv[a.nome] = 0;
    contagemAdvDia[a.nome] = {};
    horariosAdv[a.nome] = {};
  });
  prepostos.forEach((p) => {
    contagemPrep[p.nome] = 0;
    contagemPrepDia[p.nome] = {};
    horariosPrep[p.nome] = {};
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

  // Função para registrar contagem de quem já está fixo na linha
  const contabilizarExistente = (
    nome,
    contagemGeral,
    contagemDia,
    horarios,
    dia,
    horaAtual
  ) => {
    if (!nome) return;

    if (!contagemDia[nome]) contagemDia[nome] = {};
    if (!horarios[nome]) horarios[nome] = {};
    if (!horarios[nome][dia]) horarios[nome][dia] = [];

    contagemGeral[nome] = (contagemGeral[nome] || 0) + 1;
    contagemDia[nome][dia] = (contagemDia[nome][dia] || 0) + 1;
    horarios[nome][dia].push(horaAtual);
  };

  const escolherPessoa = (
    lista,
    contagemGeral,
    contagemDia,
    horarios,
    dia,
    horaAtual,
    tipoAudiencia
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

    // 🔥 Permissões agora são por dia da semana
    aptos = aptos.filter((p) => {
  const permissoesDia = p.permissoes?.[dia] ?? { AIJ: false, CONC: false };
  if (tipoAudiencia.toUpperCase().startsWith("A")) return !!permissoesDia.AIJ;
  if (tipoAudiencia.toUpperCase().startsWith("C")) return !!permissoesDia.CONC;
  return true;
});

    if (aptos.length === 0) return null;

    aptos.sort((a, b) => contagemGeral[a.nome] - contagemGeral[b.nome]);
    const escolhido = aptos[0];

    contagemGeral[escolhido.nome]++;
    contagemDia[escolhido.nome][dia] =
      (contagemDia[escolhido.nome][dia] || 0) + 1;

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

    // Mantém CORRESPONDENTE se já existir
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
          tipoAudiencia
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
          tipoAudiencia
        );

    // 🚨 Só atribui se tiver par completo
    if ((!advExistente && !prepExistente) && (!adv || !prep)) {
      adv = null;
      prep = null;
    }

    // Se já tinha nome fixo, contabiliza
    if (advExistente)
      contabilizarExistente(
        adv,
        contagemAdv,
        contagemAdvDia,
        horariosAdv,
        dia,
        horaAtual
      );
    if (prepExistente)
      contabilizarExistente(
        prep,
        contagemPrep,
        contagemPrepDia,
        horariosPrep,
        dia,
        horaAtual
      );

    row["ADVOGADO(A)"] = adv;
    row["PREPOSTO(A)"] = prep;
    row["CORRESPONDENTE"] = correspondente || row["CORRESPONDENTE"];
    row["dia"] = dia;
    row["hora"] = dt.getHours();

    return row;
  });

  return novaPauta;
}
