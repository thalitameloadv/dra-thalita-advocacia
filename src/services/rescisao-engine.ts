import { differenceInMonths, differenceInYears, parseISO } from "date-fns";

interface RescisaoData {
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

// Tabelas 2024
const TABELA_INSS_2024 = [
  { limite: 1412.00, aliquota: 7.5, deducao: 0 },
  { limite: 2666.68, aliquota: 9, deducao: 21.18 },
  { limite: 4000.03, aliquota: 12, deducao: 101.18 },
  { limite: 7786.02, aliquota: 14, deducao: 181.18 },
  { limite: Infinity, aliquota: 14, deducao: 181.18 }
];

const TABELA_IRRF_2024 = [
  { limite: 2259.20, aliquota: 0, deducao: 0 },
  { limite: 2826.65, aliquota: 7.5, deducao: 169.44 },
  { limite: 3751.05, aliquota: 15, deducao: 381.44 },
  { limite: 4664.68, aliquota: 22.5, deducao: 662.77 },
  { limite: Infinity, aliquota: 27.5, deducao: 896.00 }
];

const parseCurrency = (value: string): number => {
  const cleanValue = value.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

const calcularINSS = (baseCalculo: number): number => {
  for (const faixa of TABELA_INSS_2024) {
    if (baseCalculo <= faixa.limite) {
      return (baseCalculo * faixa.aliquota) / 100 - faixa.deducao;
    }
  }
  return 0;
};

const calcularIRRF = (baseCalculo: number): number => {
  for (const faixa of TABELA_IRRF_2024) {
    if (baseCalculo <= faixa.limite) {
      return Math.max(0, (baseCalculo * faixa.aliquota) / 100 - faixa.deducao);
    }
  }
  return 0;
};

const calcularAvisoPrevio = (dataAdmissao: string, dataDesligamento: string, tipo: string): number => {
  try {
    const admissao = parseISO(dataAdmissao);
    const desligamento = parseISO(dataDesligamento);
    const anosTrabalhados = differenceInYears(desligamento, admissao);
    
    // Aviso prévio padrão: 30 dias
    let diasAviso = 30;
    
    // Aviso prévio proporcional (Lei 12.506/2011)
    if (anosTrabalhados > 0) {
      diasAviso += Math.min(anosTrabalhados * 3, 60); // Máximo de 90 dias
    }
    
    // Se for indenizado, paga-se o valor integral
    if (tipo === "indenizado") {
      return diasAviso;
    }
    
    // Se for trabalhado, não há pagamento adicional
    if (tipo === "trabalhado") {
      return 0;
    }
    
    // Se não tiver aviso, paga-se o valor integral como indenização
    if (tipo === "sem_aviso") {
      return diasAviso;
    }
    
    return 0;
  } catch (error) {
    console.error("Erro ao calcular aviso prévio:", error);
    return 0;
  }
};

const calcularMultaFGTS = (tipoRescisao: string): number => {
  switch (tipoRescisao) {
    case "sem_justa_causa":
      return 40; // 40% de multa
    case "término_contrato":
      return 40; // 40% de multa
    case "pedido_demissao":
      return 20; // 20% de multa (se tiver mais de 1 ano)
    case "justa_causa":
      return 0; // Sem multa
    default:
      return 0;
  }
};

export const calcularRescisao = (dados: RescisaoData): RescisaoResult => {
  const salario = parseCurrency(dados.salarioBruto);
  const saldoFGTS = parseCurrency(dados.saldoFGTS);
  
  try {
    const dataAdmissao = parseISO(dados.dataAdmissao);
    const dataDesligamento = parseISO(dados.dataDesligamento);
    
    // Calcular tempo de serviço
    const mesesTrabalhados = differenceInMonths(dataDesligamento, dataAdmissao);
    const anosTrabalhados = Math.floor(mesesTrabalhados / 12);
    const mesesRestantes = mesesTrabalhados % 12;
    
    // 1. Saldo de Salário (proporcional aos dias trabalhados no mês)
    const saldoSalario = salario;
    
    // 2. Aviso Prévio
    const diasAviso = calcularAvisoPrevio(dados.dataAdmissao, dados.dataDesligamento, dados.avisoPrevio);
    const avisoPrevio = (salario / 30) * diasAviso;
    
    // 3. Férias Vencidas
    const feriasVencidas = dados.feriasVencidas === "30" ? salario : 0;
    
    // 4. Férias Proporcionais
    const feriasProporcionais = (salario / 12) * mesesRestantes;
    
    // 5. 1/3 Constitucional sobre Férias
    const tercoFerias = (feriasVencidas + feriasProporcionais) / 3;
    
    // 6. 13º Salário Proporcional
    const decimoTerceiro = (salario / 12) * mesesRestantes;
    
    // 7. FGTS do mês da rescisão
    const fgtsMes = salario * 0.08; // 8% FGTS
    
    // 8. Multa do FGTS
    const percentualMulta = calcularMultaFGTS(dados.tipoRescisao);
    const baseMultaFGTS = saldoFGTS + fgtsMes;
    const multaFGTS = (baseMultaFGTS * percentualMulta) / 100;
    
    // Total de Proventos
    const totalProventos = saldoSalario + avisoPrevio + feriasVencidas + 
                         feriasProporcionais + tercoFerias + decimoTerceiro + 
                         fgtsMes + multaFGTS;
    
    // Cálculo de INSS (sobre aviso prévio, férias e 13º)
    const baseINSS = avisoPrevio + feriasVencidas + feriasProporcionais + tercoFerias + decimoTerceiro;
    const inss = calcularINSS(baseINSS);
    
    // Base para IRRF (total proventos - INSS - dependentes)
    const baseIRRF = Math.max(0, totalProventos - inss);
    const irrf = calcularIRRF(baseIRRF);
    
    // Totais
    const totalDescontos = inss + irrf;
    const valorLiquido = totalProventos - totalDescontos;
    
    return {
      proventos: {
        saldoSalario,
        avisoPrevio,
        feriasVencidas,
        feriasProporcionais,
        tercoFerias,
        decimoTerceiro,
        fgtsMes,
        multaFGTS,
      },
      descontos: {
        inss,
        irrf,
      },
      totalBruto: totalProventos,
      totalDescontos,
      valorLiquido,
    };
  } catch (error) {
    console.error("Erro ao calcular rescisão:", error);
    return {
      proventos: {
        saldoSalario: 0,
        avisoPrevio: 0,
        feriasVencidas: 0,
        feriasProporcionais: 0,
        tercoFerias: 0,
        decimoTerceiro: 0,
        fgtsMes: 0,
        multaFGTS: 0,
      },
      descontos: {
        inss: 0,
        irrf: 0,
      },
      totalBruto: 0,
      totalDescontos: 0,
      valorLiquido: 0,
    };
  }
};
