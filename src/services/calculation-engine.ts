import { differenceInMonths, differenceInYears } from "date-fns";
import type {
  CenarioResultado,
  PeriodoPrevidenciario,
  RegraResultado,
  Remuneracao,
  SimulationDraft,
  SimulationResult,
} from "@/types/simulation";
import { createId } from "@/lib/id";

interface RuleConfig {
  id: string;
  nome: string;
  tempoMinMeses: number;
  carenciaMin: number;
  idadeMin?: (sexo: SimulationDraft["basicData"]["sexo"]) => number;
  allowDiscard: boolean;
  descricao: string;
}

const RULES: RuleConfig[] = [
  {
    id: "idade",
    nome: "Aposentadoria por Idade",
    tempoMinMeses: 180,
    carenciaMin: 180,
    idadeMin: (sexo) => (sexo === "feminino" ? 62 : 65),
    allowDiscard: true,
    descricao: "Regra permanente pós-EC 103 baseada em idade mínima e carência.",
  },
  {
    id: "programada",
    nome: "Aposentadoria Programada Pós-EC 103",
    tempoMinMeses: 240,
    carenciaMin: 240,
    idadeMin: (sexo) => (sexo === "feminino" ? 62 : 65),
    allowDiscard: true,
    descricao: "Programa 60% + 2% por ano adicional após 20 anos (homem) ou 15 anos (mulher).",
  },
  {
    id: "transicao_pontos",
    nome: "Regra de Transição por Pontos",
    tempoMinMeses: 360,
    carenciaMin: 180,
    allowDiscard: true,
    descricao: "Soma de idade + tempo de contribuição precisa atingir os pontos vigentes (ex.: 91/101).",
  },
  {
    id: "transicao_pedagio50",
    nome: "Transição Pedágio 50%",
    tempoMinMeses: 420,
    carenciaMin: 180,
    allowDiscard: false,
    descricao: "Para quem faltava até 2 anos em 13/11/2019 e aceita pedágio de 50%.",
  },
  {
    id: "especial",
    nome: "Aposentadoria Especial",
    tempoMinMeses: 300,
    carenciaMin: 180,
    allowDiscard: false,
    descricao: "Exige tempo em atividade especial (25 anos) com carência mínima.",
  },
  {
    id: "pcd",
    nome: "Aposentadoria da Pessoa com Deficiência",
    tempoMinMeses: 300,
    carenciaMin: 180,
    allowDiscard: true,
    descricao: "Coeficiente varia conforme gravidade da deficiência.",
  },
];

const CATEGORY_PRIORITY: Record<PeriodoPrevidenciario["categoria"], number> = {
  comum: 1,
  especial_15: 4,
  especial_20: 3,
  especial_25: 2,
  pcd_leve: 2,
  pcd_moderado: 3,
  pcd_grave: 4,
};

const rankCategory = (cat: PeriodoPrevidenciario["categoria"]) => CATEGORY_PRIORITY[cat] ?? 0;

export const normalizePeriods = (periodos: PeriodoPrevidenciario[]): PeriodoPrevidenciario[] => {
  const ordered = [...periodos].sort((a, b) => a.inicio.localeCompare(b.inicio));
  const result: PeriodoPrevidenciario[] = [];

  ordered.forEach((current) => {
    const last = result[result.length - 1];
    if (!last) {
      result.push({ ...current });
      return;
    }
    if (current.inicio <= last.fim) {
      // overlap -> keep category with higher priority and extend end date
      const better = rankCategory(current.categoria) > rankCategory(last.categoria) ? current : last;
      last.fim = current.fim > last.fim ? current.fim : last.fim;
      last.categoria = better.categoria;
      last.statusConcomitancia = "ajustado";
      last.observacoes = better.observacoes ?? last.observacoes;
      return;
    }
    result.push({ ...current });
  });
  return result;
};

const monthsBetween = (start: string, end: string) => Math.max(0, differenceInMonths(new Date(end), new Date(start)) + 1);

const totalMonths = (periodos: PeriodoPrevidenciario[]) =>
  periodos.reduce((total, periodo) => total + monthsBetween(periodo.inicio, periodo.fim), 0);

const carenciaMonths = (periodos: PeriodoPrevidenciario[]) =>
  periodos
    .filter((p) => p.indicadorCarencia)
    .reduce((total, periodo) => total + monthsBetween(periodo.inicio, periodo.fim), 0);

const idadeNaDer = (dataNascimento: string, der: string) =>
  differenceInYears(new Date(der), new Date(dataNascimento || der));

const somaPontos = (tempoMeses: number, idade: number) => idade + Math.floor(tempoMeses / 12);

const calcularMedia = (remuneracoes: Remuneracao[]) => {
  if (remuneracoes.length === 0) return 0;
  const valores = remuneracoes.map((rem) => rem.valor).sort((a, b) => a - b);
  const indice80 = Math.floor(valores.length * 0.2);
  const considerados = valores.slice(indice80);
  if (considerados.length === 0) return 0;
  const soma = considerados.reduce((acc, valor) => acc + valor, 0);
  return soma / considerados.length;
};

interface DescarteResult {
  remuneracoesConsideradas: Remuneracao[];
  descartadas: Remuneracao[];
  ganhoPercentual: number;
}

const aplicarRegraDescarte = (
  remuneracoes: Remuneracao[],
  tempoAtualMeses: number,
  regra: RuleConfig,
): DescarteResult => {
  if (!regra.allowDiscard || remuneracoes.length <= 12) {
    return { remuneracoesConsideradas: remuneracoes, descartadas: [], ganhoPercentual: 0 };
  }
  const ordenadas = [...remuneracoes].sort((a, b) => a.valor - b.valor);
  const descartadas: Remuneracao[] = [];
  let consideradas = [...remuneracoes];
  const mediaOriginal = calcularMedia(remuneracoes);
  let melhorMedia = mediaOriginal;

  for (let i = 0; i < ordenadas.length; i++) {
    const candidata = ordenadas[i];
    const restantes = consideradas.filter((rem) => rem.id !== candidata.id);
    const tempoRestante = tempoAtualMeses - 1; // removing uma competência
    if (tempoRestante < regra.tempoMinMeses) break;
    const novaMedia = calcularMedia(restantes);
    if (novaMedia > melhorMedia) {
      melhorMedia = novaMedia;
      descartadas.push(candidata);
      consideradas = restantes;
    }
  }

  const ganhoPercentual = melhorMedia === 0 ? 0 : ((melhorMedia - mediaOriginal) / mediaOriginal) * 100;

  return { remuneracoesConsideradas: consideradas, descartadas, ganhoPercentual };
};

const calcularRmi = (
  remuneracoes: Remuneracao[],
  tempoMeses: number,
  regra: RuleConfig,
  descarte: DescarteResult,
  draft: SimulationDraft,
) => {
  const mediaBase = calcularMedia(remuneracoes);
  const mediaDescartada = calcularMedia(descarte.remuneracoesConsideradas);

  const tempoAnos = tempoMeses / 12;
  const baseYears = regra.id === "programada" && draft.basicData.sexo === "feminino" ? 15 : 20;
  const adicional = Math.max(0, tempoAnos - baseYears) * 0.02; // 2% a.a. acima do tempo base
  const percentual = regra.id === "programada" ? Math.min(1, 0.6 + adicional) : 1;

  const semDescarte = Math.max(0, mediaBase * percentual);
  const comDescarte = Math.max(0, mediaDescartada * percentual);

  return { semDescarte, comDescarte };
};

const avaliarRegra = (
  regra: RuleConfig,
  data: SimulationDraft,
  periodos: PeriodoPrevidenciario[],
  remuneracoes: Remuneracao[],
  der: string,
): RegraResultado => {
  const tempoMeses = totalMonths(periodos);
  const carencia = carenciaMonths(periodos);
  const idade = idadeNaDer(data.basicData.dataNascimento, der);

  const requisitos: string[] = [];

  if (tempoMeses < regra.tempoMinMeses) {
    requisitos.push(`Faltam ${Math.ceil((regra.tempoMinMeses - tempoMeses) / 12)} ano(s) de contribuição.`);
  }
  if (carencia < regra.carenciaMin) {
    requisitos.push(`Carência insuficiente (${carencia} / ${regra.carenciaMin} meses).`);
  }
  if (regra.idadeMin) {
    const idadeMin = regra.idadeMin(data.basicData.sexo);
    if (idade < idadeMin) {
      requisitos.push(`Idade mínima não atingida (${idade} / ${idadeMin}).`);
    }
  }
  if (regra.id === "transicao_pontos") {
    const pontosNecessarios = data.basicData.sexo === "feminino" ? 91 : 101;
    const pontos = somaPontos(tempoMeses, idade);
    if (pontos < pontosNecessarios) {
      requisitos.push(`Pontuação ${pontos}/${pontosNecessarios}.`);
    }
  }
  if (regra.id === "transicao_pedagio50" && tempoMeses < 360) {
    requisitos.push("Não estava a 2 anos da aposentadoria em 2019 (simulação simplificada).");
  }
  if (regra.id === "especial") {
    const tempoEspecial = periodos
      .filter((p) => p.categoria.startsWith("especial"))
      .reduce((acc, periodo) => acc + monthsBetween(periodo.inicio, periodo.fim), 0);
    if (tempoEspecial < regra.tempoMinMeses) {
      requisitos.push("Tempo especial insuficiente.");
    }
  }

  const remuneracoesComId = remuneracoes.map((rem, index) => ({ ...rem, id: rem.id ?? `rem-${index}` }));
  const descarte = aplicarRegraDescarte(remuneracoesComId, tempoMeses, regra);
  const rmi = calcularRmi(remuneracoesComId, tempoMeses, regra, descarte, data);

  return {
    regraId: regra.id,
    nome: regra.nome,
    elegivel: requisitos.length === 0,
    motivoNaoElegivel: requisitos.join(" "),
    tempoTotalMeses: tempoMeses,
    carenciaMeses: carencia,
    carenciaExigida: regra.carenciaMin,
    rmiSemDescarte: rmi.semDescarte,
    rmiComDescarte: rmi.comDescarte,
    competenciasDescartadas: descarte.descartadas.map((rem) => ({
      competencia: rem.competencia,
      valor: rem.valor,
    })),
    ganhoEstimado: rmi.semDescarte === 0 ? 0 : ((rmi.comDescarte - rmi.semDescarte) / rmi.semDescarte) * 100,
  };
};

const detectDuplicateCompetencias = (remuneracoes: Remuneracao[]) => {
  if (remuneracoes.length === 0) return null;
  const map = new Map<string, number>();
  remuneracoes.forEach((rem) => {
    const key = rem.competencia;
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  const duplicates = [...map.entries()].filter(([, count]) => count > 1).map(([competencia]) => competencia);
  if (duplicates.length === 0) return null;
  const label =
    duplicates.length > 5
      ? `${duplicates.slice(0, 5).join(", ")} e outras ${duplicates.length - 5}`
      : duplicates.join(", ");
  return `Competências duplicadas detectadas: ${label}.`;
};

const detectLacunas = (periodos: PeriodoPrevidenciario[]) => {
  if (periodos.length <= 1) return null;
  const sorted = [...periodos].sort((a, b) => a.inicio.localeCompare(b.inicio));
  const gaps: string[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    const gap = differenceInMonths(new Date(next.inicio), new Date(current.fim)) - 1;
    if (gap > 2) {
      gaps.push(`${new Date(current.fim).toLocaleDateString("pt-BR")} → ${new Date(next.inicio).toLocaleDateString("pt-BR")}`);
    }
  }
  if (gaps.length === 0) return null;
  return `Lacunas de contribuição superiores a 2 meses: ${gaps.join("; ")}.`;
};

const buildMetodologiaResumo = (resultados: RegraResultado[], draft: SimulationDraft) => {
  const regraTop = resultados.find((regra) => regra.elegivel);
  const base = `Simulação processada em ${new Date().toLocaleDateString("pt-BR")} com dados do próprio usuário.`;
  if (!regraTop) {
    return `${base} Nenhuma regra elegível sem ajustes adicionais; recomendamos revisar carência e períodos especiais.`;
  }
  return `${base} Regra mais vantajosa: ${regraTop.nome}. Consideramos ${draft.periodos.length} período(s), ${draft.remuneracoes.length} remuneração(ões) e aplicamos descarte do art. 26 §6 quando gerou aumento positivo.`;
};

export const calculateSimulation = (draft: SimulationDraft): SimulationResult => {
  const normalizedPeriods = normalizePeriods(draft.periodos);
  const remuneracoesValidas = draft.remuneracoes.filter((rem) => rem.valor > 0);

  const cenarios: CenarioResultado[] = [];
  const derCenarios: { tipo: "atual" | "reafirmada"; der: string }[] = [
    { tipo: "atual", der: draft.basicData.der },
  ];
  if (draft.basicData.derReafirmada) {
    derCenarios.push({ tipo: "reafirmada", der: draft.basicData.derReafirmada });
  }

  derCenarios.forEach((cenarioInfo) => {
    const resultados = RULES.map((regra) => avaliarRegra(regra, draft, normalizedPeriods, remuneracoesValidas, cenarioInfo.der));
    const melhorOpcao = resultados
      .filter((resultado) => resultado.elegivel)
      .sort((a, b) => (b.rmiComDescarte ?? 0) - (a.rmiComDescarte ?? 0))[0];
    cenarios.push({
      derTipo: cenarioInfo.tipo,
      der: cenarioInfo.der,
      resultados,
      melhorOpcao,
    });
  });

  const metodologiaResumo = buildMetodologiaResumo(cenarios[0]?.resultados ?? [], draft);

  const alertas: string[] = [];
  if (draft.remuneracoes.length === 0) {
    alertas.push("Sem remunerações importadas. A média salarial está zerada.");
  }
  if (draft.periodos.length === 0) {
    alertas.push("Sem períodos cadastrados. Não é possível validar elegibilidade.");
  }
  if (draft.basicData.modoSimplificado) {
    alertas.push("Modo simplificado ativo: recomendação de importar CNIS para maior precisão.");
  }

  const duplicateAlert = detectDuplicateCompetencias(remuneracoesValidas);
  if (duplicateAlert) {
    alertas.push(duplicateAlert);
  }
  const lacunaAlert = detectLacunas(normalizedPeriods);
  if (lacunaAlert) {
    alertas.push(lacunaAlert);
  }

  return {
    simulacaoId: createId(),
    metodologiaResumo,
    alertas,
    cenarios,
    generatedAt: new Date().toISOString(),
  };
};
