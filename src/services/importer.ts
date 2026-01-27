import type {
  ImportSummary,
  PeriodoPrevidenciario,
  Remuneracao,
  SimulationDraft,
  DataSource,
} from "@/types/simulation";

export type ImportMode = "cnis" | "contagem" | "planilha";

const SAMPLE_PERIODS: Record<ImportMode, Omit<PeriodoPrevidenciario, "id">[]> = {
  cnis: [
    {
      inicio: "2001-01-01",
      fim: "2005-12-31",
      categoria: "comum",
      indicadorCarencia: true,
      fonte: "cnis_upload",
      observacoes: "Emprego CLT",
      statusConcomitancia: "ok",
    },
    {
      inicio: "2006-01-01",
      fim: "2012-06-01",
      categoria: "comum",
      indicadorCarencia: true,
      fonte: "cnis_upload",
      observacoes: "Contribuinte individual",
      statusConcomitancia: "ok",
    },
  ],
  contagem: [
    {
      inicio: "1994-05-01",
      fim: "1999-11-30",
      categoria: "especial_25",
      indicadorCarencia: true,
      fonte: "contagem_upload",
      observacoes: "Atividade especial - ruído",
      statusConcomitancia: "ok",
    },
  ],
  planilha: [
    {
      inicio: "2018-01-01",
      fim: "2024-12-01",
      categoria: "comum",
      indicadorCarencia: true,
      fonte: "planilha",
      statusConcomitancia: "ok",
    },
  ],
};

const SAMPLE_WAGES: Record<ImportMode, Omit<Remuneracao, "id">[]> = {
  cnis: [
    { competencia: "2012-01", valor: 3150.5, moeda: "BRL", fonte: "cnis_upload" },
    { competencia: "2012-02", valor: 3180.11, moeda: "BRL", fonte: "cnis_upload" },
  ],
  contagem: [
    {
      competencia: "1998-08",
      valor: 1450.0,
      moeda: "BRL",
      fonte: "contagem_upload",
      motivosInconsistencia: ["abaixo_minimo"],
      inconsistente: true,
    },
  ],
  planilha: [
    { competencia: "2020-03", valor: 4200.0, moeda: "BRL", fonte: "planilha" },
    { competencia: "2022-07", valor: 5300.0, moeda: "BRL", fonte: "planilha" },
  ],
};

const SOURCE_MAP: Record<ImportMode, DataSource> = {
  cnis: "cnis_upload",
  contagem: "contagem_upload",
  planilha: "planilha",
};

export interface ImportResult {
  periodos: Omit<PeriodoPrevidenciario, "id">[];
  remuneracoes: Omit<Remuneracao, "id">[];
  summary: ImportSummary;
  draftOverride?: Partial<SimulationDraft>;
}

export const mockImport = async (mode: ImportMode, file?: File): Promise<ImportResult> => {
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (!file) {
    throw new Error("Arquivo não encontrado. Tente selecionar novamente.");
  }

  const fonte = SOURCE_MAP[mode];
  const periodos = SAMPLE_PERIODS[mode] ?? [];
  const remuneracoes = SAMPLE_WAGES[mode] ?? [];

  const summary: ImportSummary = {
    fonte,
    periodosImportados: periodos.length,
    remuneracoesImportadas: remuneracoes.length,
    mensagens: [
      `${file.name} processado com sucesso`,
      periodos.length === 0 ? "Nenhum período encontrado" : `${periodos.length} período(s) adicionados`,
      remuneracoes.length === 0 ? "Sem remunerações" : `${remuneracoes.length} remuneração(ões) capturadas`,
    ],
  };

  return {
    periodos,
    remuneracoes,
    summary,
  };
};
