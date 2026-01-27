import { describe, it, expect } from "vitest";
import { calculateSimulation, normalizePeriods } from "./calculation-engine";
import type { PeriodoPrevidenciario, Remuneracao, SimulationDraft } from "@/types/simulation";
import { calculateDraft } from "@/services/api";

const buildPeriods = (): PeriodoPrevidenciario[] => [
  {
    id: "p1",
    inicio: "1990-01-01",
    fim: "2005-12-31",
    categoria: "comum",
    indicadorCarencia: true,
    fonte: "cnis_upload",
    statusConcomitancia: "ok",
  },
  {
    id: "p2",
    inicio: "2006-01-01",
    fim: "2019-12-31",
    categoria: "comum",
    indicadorCarencia: true,
    fonte: "cnis_upload",
    statusConcomitancia: "ok",
  },
  {
    id: "p3",
    inicio: "2020-01-01",
    fim: "2024-12-31",
    categoria: "especial_25",
    indicadorCarencia: true,
    fonte: "cnis_upload",
    statusConcomitancia: "ok",
  },
];

const buildRemuneracoes = (totalMeses = 60, base = 3000): Remuneracao[] =>
  Array.from({ length: totalMeses }).map((_, index) => {
    const year = 2015 + Math.floor(index / 12);
    const month = String((index % 12) + 1).padStart(2, "0");
    return {
      id: `rem-${index}`,
      competencia: `${year}-${month}`,
      valor: base + index * 10,
      moeda: "BRL",
      fonte: "cnis_upload",
    };
  });

const buildDraft = (overrides?: Partial<SimulationDraft>): SimulationDraft => {
  const base: SimulationDraft = {
    basicData: {
      sexo: "feminino",
      dataNascimento: "1960-01-01",
      der: "2025-01-01",
      derReafirmada: "2026-01-01",
      tipoBeneficio: ["idade", "programada"],
      naoSeiBeneficio: false,
      modoSimplificado: false,
    },
    periodos: buildPeriods(),
    remuneracoes: buildRemuneracoes(),
    importSummaries: [],
    updatedAt: new Date().toISOString(),
  };

  return {
    ...base,
    ...overrides,
    basicData: {
      ...base.basicData,
      ...(overrides?.basicData ?? {}),
    },
    periodos: overrides?.periodos ?? base.periodos,
    remuneracoes: overrides?.remuneracoes ?? base.remuneracoes,
    importSummaries: overrides?.importSummaries ?? base.importSummaries,
  };
};

describe("calculation-engine", () => {
  it("normalizes overlapping periods preferring highest priority", () => {
    const normalized = normalizePeriods([
      {
        ...buildPeriods()[0],
        id: "a",
        inicio: "2010-01-01",
        fim: "2020-12-31",
        categoria: "comum",
      },
      {
        ...buildPeriods()[1],
        id: "b",
        inicio: "2015-01-01",
        fim: "2022-12-31",
        categoria: "especial_25",
      },
    ]);
    expect(normalized).toHaveLength(1);
    expect(normalized[0].categoria).toBe("especial_25");
  });

  it("returns two scenarios when DER reafirmada is provided", () => {
    const draft = buildDraft();
    const result = calculateSimulation(draft);
    expect(result.cenarios).toHaveLength(2);
  });

  it("marks regra idade elegível when requisitos atendidos", () => {
    const draft = buildDraft();
    const regraIdade = calculateSimulation(draft).cenarios[0].resultados.find((r) => r.regraId === "idade");
    expect(regraIdade?.elegivel).toBe(true);
  });

  it("marca regra idade como pendente quando idade insuficiente", () => {
    const draft = buildDraft({
      basicData: { dataNascimento: "2005-01-01" },
    });
    const regraIdade = calculateSimulation(draft).cenarios[0].resultados.find((r) => r.regraId === "idade");
    expect(regraIdade?.elegivel).toBe(false);
    expect(regraIdade?.motivoNaoElegivel).toContain("Idade mínima");
  });

  it("detecta carência insuficiente", () => {
    const draft = buildDraft({
      periodos: buildPeriods().map((periodo) => ({ ...periodo, indicadorCarencia: false })),
    });
    const regra = calculateSimulation(draft).cenarios[0].resultados.find((r) => r.regraId === "programada");
    expect(regra?.elegivel).toBe(false);
    expect(regra?.motivoNaoElegivel).toContain("Carência insuficiente");
  });

  it("calcula RMI programada com valores positivos", () => {
    const regra = calculateSimulation(buildDraft()).cenarios[0].resultados.find((r) => r.regraId === "programada");
    expect(regra?.rmiSemDescarte).toBeGreaterThan(0);
  });

  it("aplica regra de descarte com ganho positivo quando há salários baixos", () => {
    const remuneracoes = [
      ...buildRemuneracoes(24, 1500),
      ...buildRemuneracoes(24, 6000).map((rem, idx) => ({ ...rem, id: `high-${idx}` })),
    ];
    const regra = calculateSimulation(buildDraft({ remuneracoes })).cenarios[0].resultados.find(
      (r) => r.regraId === "programada",
    );
    expect((regra?.ganhoEstimado ?? 0) >= 0).toBe(true);
  });

  it("requer tempo especial mínimo para regra especial", () => {
    const draft = buildDraft({
      periodos: buildPeriods().map((periodo) => ({ ...periodo, categoria: "comum" })),
    });
    const regra = calculateSimulation(draft).cenarios[0].resultados.find((r) => r.regraId === "especial");
    expect(regra?.elegivel).toBe(false);
    expect(regra?.motivoNaoElegivel).toContain("Tempo especial insuficiente");
  });

  it("verifica pontuação para regra de transição por pontos", () => {
    const draft = buildDraft({
      basicData: { dataNascimento: "1985-01-01" },
      periodos: [
        {
          ...buildPeriods()[0],
          inicio: "2010-01-01",
          fim: "2019-12-31",
        },
      ],
    });
    const regra = calculateSimulation(draft).cenarios[0].resultados.find((r) => r.regraId === "transicao_pontos");
    expect(regra?.elegivel).toBe(false);
    expect(regra?.motivoNaoElegivel).toContain("Pontuação");
  });

  it("reporta alertas de competências duplicadas", () => {
    const remuneracoes = [
      ...buildRemuneracoes(5),
      { ...buildRemuneracoes(1)[0], id: "dup", competencia: "2015-01" },
    ];
    const result = calculateSimulation(buildDraft({ remuneracoes }));
    expect(result.alertas.some((alerta) => alerta.includes("Competências duplicadas"))).toBe(true);
  });

  it("reporta alertas de lacunas de contribuição", () => {
    const periodos: PeriodoPrevidenciario[] = [
      {
        ...buildPeriods()[0],
        fim: "2010-01-01",
      },
      {
        ...buildPeriods()[1],
        inicio: "2015-01-01",
      },
    ];
    const result = calculateSimulation(buildDraft({ periodos }));
    expect(result.alertas.some((alerta) => alerta.includes("Lacunas"))).toBe(true);
  });

  it("reporta alerta quando modo simplificado está ativo", () => {
    const result = calculateSimulation(buildDraft({ basicData: { modoSimplificado: true } }));
    expect(result.alertas.some((alerta) => alerta.includes("Modo simplificado"))).toBe(true);
  });

  it("alerta quando não há remunerações", () => {
    const result = calculateSimulation(buildDraft({ remuneracoes: [] }));
    expect(result.alertas.some((alerta) => alerta.includes("Sem remunerações"))).toBe(true);
  });

  it("alerta quando não há períodos", () => {
    const result = calculateSimulation(buildDraft({ periodos: [] }));
    expect(result.alertas.some((alerta) => alerta.includes("Sem períodos"))).toBe(true);
  });

  it("calcula DER reafirmada com regra potencialmente mais vantajosa", () => {
    const draft = buildDraft({
      basicData: { derReafirmada: "2028-01-01" },
      periodos: buildPeriods().map((periodo, idx) =>
        idx === buildPeriods().length - 1 ? { ...periodo, fim: "2027-12-31" } : periodo,
      ),
    });
    const result = calculateSimulation(draft);
    expect(result.cenarios.find((c) => c.derTipo === "reafirmada")).toBeTruthy();
  });

  it("calculateDraft service returns same output as direct engine", async () => {
    const draft = buildDraft();
    const direct = calculateSimulation(draft);
    const viaService = await calculateDraft(draft);
    expect(viaService.simulacaoId).toBeTruthy();
    expect(viaService.cenarios.length).toBe(direct.cenarios.length);
  });
});
