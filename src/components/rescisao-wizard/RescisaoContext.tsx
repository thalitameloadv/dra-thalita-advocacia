import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { calcularRescisao } from "@/services/rescisao-engine";

interface RescisaoContextValue {
  dadosBasicos: {
    salarioBruto: string;
    dataAdmissao: string;
    dataDesligamento: string;
    tipoRescisao: string;
    avisoPrevio: string;
    saldoFGTS: string;
    feriasVencidas: string;
  };
  updateDadosBasicos: (data: Partial<DadosBasicos>) => void;
  resultado: RescisaoResult | null;
  setResultado: (result: RescisaoResult | null) => void;
  reset: () => void;
}

interface DadosBasicos {
  salarioBruto: string;
  dataAdmissao: string;
  dataDesligamento: string;
  tipoRescisao: string;
  avisoPrevio: string;
  saldoFGTS: string;
  feriasVencidas: string;
}

interface RescisaoResult {
  proventos: {
    saldoSalario: number;
    avisoPrevio: number;
    feriasVencidas: number;
    feriasProporcionais: number;
    tercoFerias: number;
    decimoTerceiro: number;
    fgtsMes: number;
    multaFGTS: number;
  };
  descontos: {
    inss: number;
    irrf: number;
  };
  totalBruto: number;
  totalDescontos: number;
  valorLiquido: number;
}

const STORAGE_KEY = "rescisao-wizard-draft-v1";

const DEFAULT_DADOS_BASICOS: DadosBasicos = {
  salarioBruto: "",
  dataAdmissao: "",
  dataDesligamento: "",
  tipoRescisao: "",
  avisoPrevio: "",
  saldoFGTS: "",
  feriasVencidas: "0",
};

const RescisaoContext = createContext<RescisaoContextValue | undefined>(undefined);

export const useRescisaoWizard = () => {
  const context = useContext(RescisaoContext);
  if (!context) {
    throw new Error("useRescisaoWizard must be used within RescisaoWizardProvider");
  }
  return context;
};

export const RescisaoWizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dadosBasicos, setDadosBasicos] = useState<DadosBasicos>(DEFAULT_DADOS_BASICOS);
  const [resultado, setResultado] = useState<RescisaoResult | null>(null);

  // Carregar dados do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setDadosBasicos(parsed.dadosBasicos || DEFAULT_DADOS_BASICOS);
        setResultado(parsed.resultado || null);
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
    }
  }, []);

  // Calcular resultado automaticamente quando dados básicos são atualizados
  useEffect(() => {
    const hasAllRequiredFields = 
      dadosBasicos.salarioBruto &&
      dadosBasicos.dataAdmissao &&
      dadosBasicos.dataDesligamento &&
      dadosBasicos.tipoRescisao &&
      dadosBasicos.avisoPrevio &&
      dadosBasicos.saldoFGTS;

    if (hasAllRequiredFields) {
      try {
        const resultadoCalculado = calcularRescisao(dadosBasicos);
        setResultado(resultadoCalculado);
      } catch (error) {
        console.error("Erro ao calcular rescisão:", error);
        setResultado(null);
      }
    } else {
      setResultado(null);
    }
  }, [dadosBasicos]);

  // Salvar dados no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ dadosBasicos, resultado }));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }, [dadosBasicos, resultado]);

  const updateDadosBasicos = (data: Partial<DadosBasicos>) => {
    setDadosBasicos(prev => ({ ...prev, ...data }));
  };

  const reset = () => {
    setDadosBasicos(DEFAULT_DADOS_BASICOS);
    setResultado(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(() => ({
    dadosBasicos,
    updateDadosBasicos,
    resultado,
    setResultado,
    reset,
  }), [dadosBasicos, resultado]);

  return (
    <RescisaoContext.Provider value={value}>
      {children}
    </RescisaoContext.Provider>
  );
};
