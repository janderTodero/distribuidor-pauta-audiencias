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

  const calcularPontuacaoGap = (pessoa, dia, horaAtual, horarios) => {
    const horariosDia = horarios[pessoa.nome]?.[dia] || [];
    if (horariosDia.length === 0) return 0;

    const diffs = horariosDia.map(h => Math.abs(h - horaAtual));
    const minDiff = Math.min(...diffs);

    if (minDiff < 60) return 1000;

    if (minDiff <= 180) {
      return -50 + (minDiff / 10);
    }

    return minDiff / 60;
  };

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

    if (contagemGeral[nome] === undefined) contagemGeral[nome] = 0;
    if (!contagemDia[nome]) contagemDia[nome] = {};
    if (!horarios[nome]) horarios[nome] = {};
    if (!horarios[nome][dia]) horarios[nome][dia] = [];
    if (contagemSemanal[nome] === undefined) contagemSemanal[nome] = 0;
    if (!contagemPorTipo[nome]) contagemPorTipo[nome] = { AIJ: 0, CONC: 0, OUTROS: 0 };

    contagemGeral[nome]++;
    contagemDia[nome][dia] = (contagemDia[nome][dia] || 0) + 1;
    contagemSemanal[nome]++;

    const tipoStr = tipoAudiencia?.toUpperCase() || "";
    const tipoNorm = tipoStr.startsWith("A")
      ? "AIJ"
      : tipoStr.startsWith("C")
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

    const tipoStr = tipoAudiencia?.toUpperCase() || "";
    const tipoNormalizado = tipoStr.startsWith("A")
      ? "AIJ"
      : tipoStr.startsWith("C")
        ? "CONC"
        : "OUTROS";

    let aptos = disponiveis.filter((p) => {
      const qtdHoje = contagemDia[p.nome]?.[dia] || 0;
      const limitePessoa = p.limiteDiario || 1;
      if (qtdHoje >= limitePessoa) {
        return false;
      }

      if (!dentroDaFaixa(horaAtual, p.disponibilidade[dia])) {
        return false;
      }

      const horariosDia = horarios[p.nome]?.[dia] || [];
      const conflito = horariosDia.some((h) => Math.abs(h - horaAtual) < 60);
      if (conflito) {
        return false;
      }

      const permissoesDia = p.permissoes?.[dia] ?? { AIJ: true, CONC: true };
      if (tipoNormalizado === "AIJ" && !permissoesDia.AIJ) {
        return false;
      }
      if (tipoNormalizado === "CONC" && !permissoesDia.CONC) {
        return false;
      }

      return true;
    });

    if (aptos.length === 0) return null;

    const candidatosEscassos = aptos.filter(p => calcularDiasDisponiveis(p) <= 1);

    // 2. Identificar especialistas em AIJ (só fazem AIJ) para audiências de AIJ
    const especialistasAIJ = aptos.filter(p => {
      if (tipoNormalizado !== "AIJ") return false;
      const tipos = getTiposPermitidos(p);
      return tipos.includes("AIJ") && !tipos.includes("CONC");
    });

    // Lógica de Prioridade
    let poolFinal = aptos;

    if (candidatosEscassos.length > 0) {
      // Se tem gente que só pode hoje, ELES SÃO A PRIORIDADE MÁXIMA
      poolFinal = candidatosEscassos;
    } else if (especialistasAIJ.length > 0) {
      // Se é AIJ e tem gente que SÓ faz AIJ, prioriza eles
      poolFinal = especialistasAIJ;
    }

    // Ordenação (Score)
    poolFinal.sort((a, b) => {
      // 1. Fator de Escassez (CRÍTICO)
      // Só prioriza escassez se for um caso CRÍTICO (ex: score < 1500, equivalente a poucos dias/horas)
      const escassezA = calcularEscassez(a);
      const escassezB = calcularEscassez(b);

      const isCriticalA = escassezA < 1500;
      const isCriticalB = escassezB < 1500;

      // Se um é crítico e o outro não, o crítico ganha prioridade absoluta
      if (isCriticalA && !isCriticalB) return -1;
      if (!isCriticalA && isCriticalB) return 1;

      // Se ambos são críticos OU ambos são tranquilos, decide pelo balanceamento de carga

      // 2. Fatores de Balanceamento
      const dispA = calcularDisponibilidadeTotal(a);
      const dispB = calcularDisponibilidadeTotal(b);

      // Normaliza a contagem semanal pela disponibilidade (quem tem mais horas deve pegar mais)
      // Adiciona 1 para evitar divisão por zero
      const taxaSemanalA = (contagemSemanal[a.nome] || 0) / (dispA / 60 || 1);
      const taxaSemanalB = (contagemSemanal[b.nome] || 0) / (dispB / 60 || 1);

      // Diferença de taxa é o fator principal para balanceamento
      // Se A tem taxa menor que B, A deve vir primeiro (resultado negativo)
      const diffTaxa = taxaSemanalA - taxaSemanalB;

      // FIX: Relaxed threshold from 0.0001 to 0.1 to allow Type Balancing to kick in
      if (Math.abs(diffTaxa) > 0.1) {
        return diffTaxa; // Prioriza quem está mais "atrasado" na proporção
      }

      // 3. Balanceamento por TIPO (Novo)
      // Se a carga total está parecida, tenta equilibrar AIJ vs CONC
      const tipoAtual = tipoNormalizado; // AIJ ou CONC
      if (tipoAtual === "AIJ" || tipoAtual === "CONC") {
        const qtdA = contagemPorTipo[a.nome]?.[tipoAtual] || 0;
        const qtdB = contagemPorTipo[b.nome]?.[tipoAtual] || 0;
        if (qtdA !== qtdB) {
          return qtdA - qtdB; // Prioriza quem tem MENOS desse tipo específico
        }
      }

      // 4. Critérios de Desempate (Gap)
      const gapScoreA = calcularPontuacaoGap(a, dia, horaAtual, horarios);
      const gapScoreB = calcularPontuacaoGap(b, dia, horaAtual, horarios);

      // Preferência por quem tem gap melhor (evita buracos na agenda)
      // Quanto menor o gapScore, melhor (mais próximo de um gap ideal ou longe de conflito)
      return gapScoreA - gapScoreB;
    });

    const escolhido = poolFinal[0];
    return escolhido.nome;
  };

  // 1. PRÉ-CALCULO: Contabilizar todos os advogados e prepostos JÁ definidos na planilha
  pauta.forEach((row) => {
    const dt = row.datetime instanceof Date ? row.datetime : new Date(row.datetime);
    const dia = diaMap[dt.getDay()];
    const horaAtual = dt.getHours() * 60 + dt.getMinutes();
    const tipoAudiencia = row["AC / AIJ / ACIJ"] || row["TIPO"] || "";

    if (row["ADVOGADO(A)"] && row["ADVOGADO(A)"].trim() !== "") {
      contabilizarExistente(
        row["ADVOGADO(A)"],
        contagemAdv,
        contagemAdvDia,
        horariosAdv,
        dia,
        horaAtual,
        contagemSemanalAdv,
        contagemAdvPorTipo,
        tipoAudiencia
      );
    }

    if (row["PREPOSTO(A)"] && row["PREPOSTO(A)"].trim() !== "") {
      contabilizarExistente(
        row["PREPOSTO(A)"],
        contagemPrep,
        contagemPrepDia,
        horariosPrep,
        dia,
        horaAtual,
        contagemSemanalPrep,
        contagemPrepPorTipo,
        tipoAudiencia
      );
    }
  });

  const novaPauta = pauta.map((row) => {
    // CRIA UMA CÓPIA DA LINHA PARA NÃO MUTAR O ORIGINAL
    const newRow = { ...row };

    const dt =
      newRow.datetime instanceof Date ? newRow.datetime : new Date(newRow.datetime);

    const semana = obterSemana(dt);

    if (semanaAtual !== semana) {
      semanaAtual = semana;
      Object.keys(contagemSemanalAdv).forEach((k) => (contagemSemanalAdv[k] = 0));
      Object.keys(contagemSemanalPrep).forEach((k) => (contagemSemanalPrep[k] = 0));
    }

    const dia = diaMap[dt.getDay()];
    const horaAtual = dt.getHours() * 60 + dt.getMinutes();
    const tipoAudiencia = newRow["AC / AIJ / ACIJ"] || newRow["TIPO"] || "";

    const correspondente = newRow["CORRESPONDENTE"] || null;

    const advExistente =
      newRow["ADVOGADO(A)"] && newRow["ADVOGADO(A)"].trim() !== "";
    const prepExistente =
      newRow["PREPOSTO(A)"] && newRow["PREPOSTO(A)"].trim() !== "";

    // Verifica se é caso de correspondente
    const isCorrespondente =
      (correspondente && correspondente.toString().trim() !== "") ||
      (advExistente && newRow["ADVOGADO(A)"].toUpperCase().includes("CORRESPONDENTE")) ||
      (prepExistente && newRow["PREPOSTO(A)"].toUpperCase().includes("CORRESPONDENTE"));

    let adv = null;
    let prep = null;

    if (isCorrespondente) {
      adv = advExistente ? newRow["ADVOGADO(A)"] : "CORRESPONDENTE";
      prep = prepExistente ? newRow["PREPOSTO(A)"] : "CORRESPONDENTE";
    } else {
      // Tenta selecionar Advogado
      if (advExistente) {
        adv = newRow["ADVOGADO(A)"];
      } else {
        adv = escolherPessoa(
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
      }

      // Tenta selecionar Preposto
      if (prepExistente) {
        prep = newRow["PREPOSTO(A)"];
      } else {
        prep = escolherPessoa(
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
      }
    }

    // Regra: Se não é correspondente, e não tem advogado OU não tem preposto (e não eram existentes),
    // então descarta ambos (não atribui ninguém).
    if (!isCorrespondente && !advExistente && !prepExistente && (!adv || !prep)) {
      adv = null;
      prep = null;
    } else if (!isCorrespondente) {
      // Se chegou aqui, é porque temos um par válido (ou um existente + um novo válido)
      // AGORA sim confirmamos a atribuição e atualizamos os contadores

      if (!advExistente && adv) {
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
      }

      if (!prepExistente && prep) {
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
      }
    }

    newRow["ADVOGADO(A)"] = adv;
    newRow["PREPOSTO(A)"] = prep;
    newRow["CORRESPONDENTE"] = correspondente || newRow["CORRESPONDENTE"];
    newRow["dia"] = dia;
    newRow["hora"] = dt.getHours();

    return newRow;
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

  return novaPauta;
}