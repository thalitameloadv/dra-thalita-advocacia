import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type {
  BasicData,
  ImportSummary,
  PeriodoPrevidenciario,
  Remuneracao,
  SimulationDraft,
} from "@/types/simulation";
import { createId } from "@/lib/id";

interface SimulationContextValue {
  draft: SimulationDraft;
  updateBasicData: (data: Partial<BasicData>) => void;
  addImportSummary: (summary: Omit<ImportSummary, "mensagens"> & { mensagens?: string[] }) => void;
  ingestImport: (payload: {
    periodos: Omit<PeriodoPrevidenciario, "id">[];
    remuneracoes: Omit<Remuneracao, "id">[];
    summary: Omit<ImportSummary, "mensagens"> & { mensagens?: string[] };
  }) => void;
  addPeriodo: (periodo: Omit<PeriodoPrevidenciario, "id">) => void;
  removePeriodo: (id: string) => void;
  addRemuneracao: (remuneracao: Omit<Remuneracao, "id">) => void;
  removeRemuneracao: (id: string) => void;
  reset: () => void;
}

const STORAGE_KEY = "simulacao-wizard-draft-v1";

const DEFAULT_DRAFT: SimulationDraft = {
  basicData: {
    sexo: "nao_informado",
    dataNascimento: "",
    der: new Date().toISOString().slice(0, 10),
    derReafirmada: "",
    tipoBeneficio: [],
    naoSeiBeneficio: false,
    modoSimplificado: false,
  },
  periodos: [],
  remuneracoes: [],
  importSummaries: [],
  updatedAt: new Date().toISOString(),
};

const SimulationWizardContext = createContext<SimulationContextValue | undefined>(undefined);

const loadDraft = (): SimulationDraft => {
  if (typeof window === "undefined") return DEFAULT_DRAFT;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_DRAFT;
    const parsed = JSON.parse(stored) as SimulationDraft;
    return { ...DEFAULT_DRAFT, ...parsed };
  } catch {
    return DEFAULT_DRAFT;
  }
};

export const SimulationWizardProvider = ({ children }: { children: React.ReactNode }) => {
  const [draft, setDraft] = useState<SimulationDraft>(() => loadDraft());

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const value = useMemo<SimulationContextValue>(
    () => ({
      draft,
      updateBasicData: (data) =>
        setDraft((prev) => ({
          ...prev,
          basicData: { ...prev.basicData, ...data },
          updatedAt: new Date().toISOString(),
        })),
      addImportSummary: (summary) =>
        setDraft((prev) => ({
          ...prev,
          importSummaries: [
            ...prev.importSummaries,
            {
              ...summary,
              mensagens: summary.mensagens ?? [],
            },
          ],
          updatedAt: new Date().toISOString(),
        })),
      ingestImport: ({ periodos, remuneracoes, summary }) =>
        setDraft((prev) => ({
          ...prev,
          periodos: [...prev.periodos, ...periodos.map((p) => ({ ...p, id: createId() }))],
          remuneracoes: [...prev.remuneracoes, ...remuneracoes.map((r) => ({ ...r, id: createId() }))],
          importSummaries: [
            ...prev.importSummaries,
            {
              ...summary,
              mensagens: summary.mensagens ?? [],
            },
          ],
          updatedAt: new Date().toISOString(),
        })),
      addPeriodo: (periodo) =>
        setDraft((prev) => ({
          ...prev,
          periodos: [...prev.periodos, { ...periodo, id: createId() }],
          updatedAt: new Date().toISOString(),
        })),
      removePeriodo: (id) =>
        setDraft((prev) => ({
          ...prev,
          periodos: prev.periodos.filter((p) => p.id !== id),
          updatedAt: new Date().toISOString(),
        })),
      addRemuneracao: (remuneracao) =>
        setDraft((prev) => ({
          ...prev,
          remuneracoes: [...prev.remuneracoes, { ...remuneracao, id: createId() }],
          updatedAt: new Date().toISOString(),
        })),
      removeRemuneracao: (id) =>
        setDraft((prev) => ({
          ...prev,
          remuneracoes: prev.remuneracoes.filter((r) => r.id !== id),
          updatedAt: new Date().toISOString(),
        })),
      reset: () => setDraft(DEFAULT_DRAFT),
    }),
    [draft],
  );

  return <SimulationWizardContext.Provider value={value}>{children}</SimulationWizardContext.Provider>;
};

export const useSimulationWizard = () => {
  const ctx = useContext(SimulationWizardContext);
  if (!ctx) {
    throw new Error("useSimulationWizard must be used inside SimulationWizardProvider");
  }
  return ctx;
};
