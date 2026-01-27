export type DataSource = "cnis_upload" | "contagem_upload" | "planilha" | "manual";

export interface PeriodoPrevidenciario {
  id: string;
  inicio: string;
  fim: string;
  categoria:
    | "comum"
    | "especial_15"
    | "especial_20"
    | "especial_25"
    | "pcd_leve"
    | "pcd_moderado"
    | "pcd_grave";
  indicadorCarencia: boolean;
  fonte: DataSource;
  observacoes?: string;
  statusConcomitancia?: "ok" | "ajustado" | "pendente";
  ajustadoPor?: string;
  manualOverride?: boolean;
}

export interface Remuneracao {
  id: string;
  competencia: string;
  valor: number;
  moeda: "BRL";
  fonte: DataSource;
  inconsistente?: boolean;
  motivosInconsistencia?: ("valor_zero" | "duplicado" | "abaixo_minimo" | "acima_teto")[];
  descartavel?: boolean;
}

export interface BasicData {
  sexo: "feminino" | "masculino" | "outro" | "nao_informado";
  dataNascimento: string;
  der: string;
  derReafirmada?: string;
  tipoBeneficio: string[];
  naoSeiBeneficio: boolean;
  modoSimplificado: boolean;
}

export interface ImportSummary {
  fonte: DataSource;
  periodosImportados: number;
  remuneracoesImportadas: number;
  mensagens: string[];
}

export interface SimulationDraft {
  basicData: BasicData;
  periodos: PeriodoPrevidenciario[];
  remuneracoes: Remuneracao[];
  importSummaries: ImportSummary[];
  updatedAt: string;
}

export interface RegraResultado {
  regraId: string;
  nome: string;
  elegivel: boolean;
  motivoNaoElegivel?: string;
  tempoTotalMeses: number;
  carenciaMeses: number;
  carenciaExigida: number;
  rmiSemDescarte?: number;
  rmiComDescarte?: number;
  competenciasDescartadas?: { competencia: string; valor: number }[];
  ganhoEstimado?: number;
}

export interface CenarioResultado {
  derTipo: "atual" | "reafirmada";
  der: string;
  resultados: RegraResultado[];
  melhorOpcao?: RegraResultado;
}

export interface SimulationResult {
  simulacaoId: string;
  metodologiaResumo: string;
  alertas: string[];
  cenarios: CenarioResultado[];
  generatedAt: string;
}
