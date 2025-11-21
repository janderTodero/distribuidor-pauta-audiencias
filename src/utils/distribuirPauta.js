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
  const contagemAdvPorTipo = {};
  const contagemPrepPorTipo = {};

  // Inicializa todos os advogados
  advogados.forEach((a) => {
    contagemAdv[a.nome] = 0;
    contagemAdvDia[a.nome] = {};
    horariosAdv[a.nome] = {};
    contagemSemanalAdv[a.nome] = 0;
    contagemAdvPorTipo[a.nome] = { AIJ: 0, CONC: 0, OUTROS: 0 };
  });

  // Inicializa todos os prepostos
  prepostos.forEach((p) => {
    contagemPrep[p.nome] = 0;
    contagemPrepDia[p.nome] = {};
    horariosPrep[p.nome] = {};
    contagemSemanalPrep[p.nome] = 0;
    contagemPrepPorTipo[p.nome] = { AIJ: 0, CONC: 0, OUTROS: 0 };
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

  const obterSemana = (data) => {
    const d = new Date(data);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  let semanaAtual = null;

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

  const calcularDisponibilidadeTotal = (pessoa) => {
    if (!pessoa.disponibilidade) return 1;
    const total = Object.values(pessoa.disponibilidade).reduce((acc, faixas) => {
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
    return total > 0 ? total : 1;
  };

  const calcularDiasDisponiveis = (pessoa) => {
    if (!pessoa.disponibilidade) return 0;
    return Object.values(pessoa.disponibilidade).filter(
      (faixas) => Array.isArray(faixas) && faixas.some((f) => f.ativo)
    ).length;
  };

  const getTiposPermitidos = (pessoa) => {
    if (!pessoa.permissoes) return ["AIJ", "CONC", "OUTROS"];
    
    const tipos = new Set();
    Object.values(pessoa.permissoes).forEach((perm) => {
      if (perm?.AIJ) tipos.add("AIJ");
      if (perm?.CONC) tipos.add("CONC");
    });
    
    if (tipos.size === 0) return ["AIJ", "CONC", "OUTROS"];
    return Array.from(tipos);
  };

  const calcularEscassez = (pessoa) => {
    const diasDisponiveis = calcularDiasDisponiveis(pessoa);
    const minutosDisponiveis = calcularDisponibilidadeTotal(pessoa);
    const tiposPermitidos = getTiposPermitidos(pessoa);
    
    let escassez = diasDisponiveis * minutosDisponiveis * tiposPermitidos.length;
    
    if (tiposPermitidos.length === 1) escassez = escassez * 0.3;
    if (diasDisponiveis === 1) escassez = escassez * 0.2;
    
    return escassez || 1;
  };

  // 🔧 CORRIGIDO: Adiciona verificações de segurança
  const contabilizarExistente = (
    nome,
    contagemGeral,
    contagemDia,
    horarios,
    dia,
    horaAtual,
    contagemSemanal,
    contagemPorTipo,
    tipoAudiencia
  ) => {
    if (!nome) return;

    // 🔧 Inicializa estruturas se a pessoa não estiver cadastrada
    if (contagemGeral[nome] === undefined) contagemGeral[nome] = 0;
    if (!contagemDia[nome]) contagemDia[nome] = {};
    if (!horarios[nome]) horarios[nome] = {};
    if (!horarios[nome][dia]) horarios[nome][dia] = [];
    if (contagemSemanal[nome] === undefined) contagemSemanal[nome] = 0;
    if (!contagemPorTipo[nome]) contagemPorTipo[nome] = { AIJ: 0, CONC: 0, OUTROS: 0 };

    contagemGeral[nome]++;
    contagemDia[nome][dia] = (contagemDia[nome][dia] || 0) + 1;
    contagemSemanal[nome]++;

    const tipoNorm = tipoAudiencia?.toUpperCase().startsWith("A")
      ? "AIJ"
      : tipoAudiencia?.toUpperCase().startsWith("C")
      ? "CONC"
      : "OUTROS";

    contagemPorTipo[nome][tipoNorm]++;
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
    contagemSemanal,
    contagemPorTipo
  ) => {
    const disponiveis = lista.filter(
      (p) => p.disponibilidade?.[dia]?.length > 0
    );

    const tipoNormalizado = tipoAudiencia?.toUpperCase().startsWith("A")
      ? "AIJ"
      : tipoAudiencia?.toUpperCase().startsWith("C")
      ? "CONC"
      : "OUTROS";

    let aptos = disponiveis.filter((p) => {
      const qtdHoje = contagemDia[p.nome]?.[dia] || 0;
      const limitePessoa = p.limiteDiario || 3;
      if (qtdHoje >= limitePessoa) return false;

      if (!dentroDaFaixa(horaAtual, p.disponibilidade[dia])) return false;

      const horariosDia = horarios[p.nome]?.[dia] || [];
      const conflito = horariosDia.some((h) => Math.abs(h - horaAtual) < 60);
      if (conflito) return false;

      const permissoesDia = p.permissoes?.[dia] ?? { AIJ: true, CONC: true };
      if (tipoNormalizado === "AIJ" && !permissoesDia.AIJ) return false;
      if (tipoNormalizado === "CONC" && !permissoesDia.CONC) return false;

      return true;
    });

    if (aptos.length === 0) return null;

    aptos.sort((a, b) => {
      const escassezA = calcularEscassez(a);
      const escassezB = calcularEscassez(b);

      const dispA = calcularDisponibilidadeTotal(a);
      const dispB = calcularDisponibilidadeTotal(b);

      const prioridadeEscassezA = escassezA * 5;
      const prioridadeEscassezB = escassezB * 5;

      const taxaSemanalA = (contagemSemanal[a.nome] || 0) / (dispA / 60);
      const taxaSemanalB = (contagemSemanal[b.nome] || 0) / (dispB / 60);

      const qtdHojeA = contagemDia[a.nome]?.[dia] || 0;
      const qtdHojeB = contagemDia[b.nome]?.[dia] || 0;

      const porTipoA = contagemPorTipo[a.nome] || { AIJ: 0, CONC: 0, OUTROS: 0 };
      const porTipoB = contagemPorTipo[b.nome] || { AIJ: 0, CONC: 0, OUTROS: 0 };

      const desequilibrioTipoA = Math.abs(porTipoA.AIJ - porTipoA.CONC);
      const desequilibrioTipoB = Math.abs(porTipoB.AIJ - porTipoB.CONC);

      const scoreA =
        prioridadeEscassezA +
        taxaSemanalA * 2 +
        qtdHojeA * 1.5 +
        ((contagemGeral[a.nome] || 0) / dispA) * 0.5 +
        desequilibrioTipoA * 0.3;

      const scoreB =
        prioridadeEscassezB +
        taxaSemanalB * 2 +
        qtdHojeB * 1.5 +
        ((contagemGeral[b.nome] || 0) / dispB) * 0.5 +
        desequilibrioTipoB * 0.3;

      if (Math.abs(scoreA - scoreB) < 0.1) {
        return porTipoA[tipoNormalizado] - porTipoB[tipoNormalizado];
      }

      return scoreA - scoreB;
    });

    const escolhido = aptos[0];

    contagemGeral[escolhido.nome] = (contagemGeral[escolhido.nome] || 0) + 1;
    contagemDia[escolhido.nome][dia] =
      (contagemDia[escolhido.nome]?.[dia] || 0) + 1;
    contagemSemanal[escolhido.nome] = (contagemSemanal[escolhido.nome] || 0) + 1;
    
    if (!contagemPorTipo[escolhido.nome]) {
      contagemPorTipo[escolhido.nome] = { AIJ: 0, CONC: 0, OUTROS: 0 };
    }
    contagemPorTipo[escolhido.nome][tipoNormalizado]++;

    if (!horarios[escolhido.nome][dia]) horarios[escolhido.nome][dia] = [];
    horarios[escolhido.nome][dia].push(horaAtual);

    return escolhido.nome;
  };

  const novaPauta = pauta.map((row) => {
    const dt =
      row.datetime instanceof Date ? row.datetime : new Date(row.datetime);

    const semana = obterSemana(dt);

    if (semanaAtual !== semana) {
      semanaAtual = semana;
      Object.keys(contagemSemanalAdv).forEach((k) => (contagemSemanalAdv[k] = 0));
      Object.keys(contagemSemanalPrep).forEach((k) => (contagemSemanalPrep[k] = 0));
    }

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
          contagemSemanalAdv,
          contagemAdvPorTipo
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
          contagemSemanalPrep,
          contagemPrepPorTipo
        );

    if (!advExistente && !prepExistente && (!adv || !prep)) {
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
        contagemSemanalAdv,
        contagemAdvPorTipo,
        tipoAudiencia
      );
    if (prepExistente)
      contabilizarExistente(
        prep,
        contagemPrep,
        contagemPrepDia,
        horariosPrep,
        dia,
        horaAtual,
        contagemSemanalPrep,
        contagemPrepPorTipo,
        tipoAudiencia
      );

    row["ADVOGADO(A)"] = adv;
    row["PREPOSTO(A)"] = prep;
    row["CORRESPONDENTE"] = correspondente || row["CORRESPONDENTE"];
    row["dia"] = dia;
    row["hora"] = dt.getHours();

    return row;
  });

  // 📊 RELATÓRIO FINAL DE DISTRIBUIÇÃO
  console.log("\n========== RELATÓRIO DE DISTRIBUIÇÃO ==========\n");

  console.log("📋 ADVOGADOS:");
  advogados.forEach((adv) => {
    const total = contagemAdv[adv.nome] || 0;
    const porTipo = contagemAdvPorTipo[adv.nome] || { AIJ: 0, CONC: 0, OUTROS: 0 };
    const diasDisp = calcularDiasDisponiveis(adv);
    const minDisp = calcularDisponibilidadeTotal(adv);

    console.log(`\n👤 ${adv.nome}:`);
    console.log(`   Total: ${total} audiências`);
    console.log(`   AIJ: ${porTipo.AIJ} | CONC: ${porTipo.CONC} | Outros: ${porTipo.OUTROS}`);
    console.log(`   Disponibilidade: ${diasDisp} dias, ${Math.round(minDisp / 60)}h`);
    console.log(`   Por dia:`, contagemAdvDia[adv.nome] || {});
  });

  console.log("\n\n📋 PREPOSTOS:");
  prepostos.forEach((prep) => {
    const total = contagemPrep[prep.nome] || 0;
    const porTipo = contagemPrepPorTipo[prep.nome] || { AIJ: 0, CONC: 0, OUTROS: 0 };
    const diasDisp = calcularDiasDisponiveis(prep);
    const minDisp = calcularDisponibilidadeTotal(prep);

    console.log(`\n👤 ${prep.nome}:`);
    console.log(`   Total: ${total} audiências`);
    console.log(`   AIJ: ${porTipo.AIJ} | CONC: ${porTipo.CONC} | Outros: ${porTipo.OUTROS}`);
    console.log(`   Disponibilidade: ${diasDisp} dias, ${Math.round(minDisp / 60)}h`);
    console.log(`   Por dia:`, contagemPrepDia[prep.nome] || {});
  });

  console.log("\n==============================================\n");

  return novaPauta;
}