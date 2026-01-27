import { useState } from "react";
import { Calculator, FileText, AlertCircle, Info, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Separator } from "./ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useNavigate } from "react-router-dom";

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

const CalculadoraRescisao = () => {
  const navigate = useNavigate();
  const [salarioBruto, setSalarioBruto] = useState("");
  const [dataAdmissao, setDataAdmissao] = useState("");
  const [dataDesligamento, setDataDesligamento] = useState("");
  const [tipoRescisao, setTipoRescisao] = useState("");
  const [avisoPrevio, setAvisoPrevio] = useState("");
  const [saldoFGTS, setSaldoFGTS] = useState("");
  const [feriasVencidas, setFeriasVencidas] = useState("0");
  const [result, setResult] = useState<RescisaoResult | null>(null);

  const whatsappNumber = "5588996017070";

  // Tabelas para cálculos (atualizáveis anualmente)
  const TABELA_INSS_2024 = [
    { limite: 1412.00, aliquota: 7.5, deducao: 0 },
    { limite: 2666.68, aliquota: 9, deducao: 21.18 },
    { limite: 4000.03, aliquota: 12, deducao: 101.18 },
    { limite: Infinity, aliquota: 14, deducao: 181.18 },
  ];

  const TABELA_IRRF_2024 = [
    { limite: 2259.20, aliquota: 0, deducao: 0 },
    { limite: 2826.65, aliquota: 7.5, deducao: 169.44 },
    { limite: 3751.05, aliquota: 15, deducao: 381.44 },
    { limite: 4664.68, aliquota: 22.5, deducao: 662.77 },
    { limite: Infinity, aliquota: 27.5, deducao: 896.00 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleSalarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const numValue = parseInt(value) / 100;
    if (!isNaN(numValue)) {
      setSalarioBruto(formatCurrency(numValue).replace("R$", "").trim());
    } else {
      setSalarioBruto("");
    }
  };

  const parseCurrency = (value: string) => {
    return parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0;
  };

  const calcularDiferencaMeses = (dataInicio: string, dataFim: string) => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    let anos = fim.getFullYear() - inicio.getFullYear();
    let meses = fim.getMonth() - inicio.getMonth();
    let dias = fim.getDate() - inicio.getDate();
    
    if (dias < 0) {
      meses--;
      const ultimoMes = new Date(fim.getFullYear(), fim.getMonth(), 0);
      dias += ultimoMes.getDate();
    }
    
    if (meses < 0) {
      anos--;
      meses += 12;
    }
    
    return anos * 12 + meses + (dias > 0 ? 1 : 0);
  };

  const calcularAvisoPrevio = (anosTrabalho: number, indenizado: boolean) => {
    if (!indenizado) return 0;
    
    const base = 30;
    const adicional = Math.min(anosTrabalho * 3, 60);
    return base + adicional;
  };

  const calcularINSS = (valor: number) => {
    for (const faixa of TABELA_INSS_2024) {
      if (valor <= faixa.limite) {
        return (valor * faixa.aliquota) / 100 - faixa.deducao;
      }
    }
    return 0;
  };

  const calcularIRRF = (valor: number) => {
    const baseIRRF = Math.max(0, valor - calcularINSS(valor));
    
    for (const faixa of TABELA_IRRF_2024) {
      if (baseIRRF <= faixa.limite) {
        return (baseIRRF * faixa.aliquota) / 100 - faixa.deducao;
      }
    }
    return 0;
  };

  const calcularRescisao = () => {
    const salario = parseCurrency(salarioBruto);
    
    if (salario <= 0 || !dataAdmissao || !dataDesligamento || !tipoRescisao || !avisoPrevio) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const mesesTrabalho = calcularDiferencaMeses(dataAdmissao, dataDesligamento);
    const anosTrabalho = Math.floor(mesesTrabalho / 12);
    const diasTrabalhadosNoMes = new Date(dataDesligamento).getDate();
    
    const avisoIndenizado = avisoPrevio === "indenizado";
    const diasAviso = calcularAvisoPrevio(anosTrabalho, avisoIndenizado);
    
    // Cálculo das verbas
    const saldoSalario = (salario * diasTrabalhadosNoMes) / 30;
    const valorAviso = avisoIndenizado ? (salario * diasAviso) / 30 : 0;
    
    const feriasVencValor = (parseFloat(feriasVencidas) * salario) + (parseFloat(feriasVencidas) * salario / 3);
    const feriasProporcionais = ((mesesTrabalho % 12) * salario) / 12;
    const tercoFeriasProp = feriasProporcionais / 3;
    
    const decimoTerceiro = (salario * new Date(dataDesligamento).getMonth() + 1) / 12;
    
    const fgtsMes = (saldoSalario * 8) / 100;
    
    let multaFGTS = 0;
    const fgtsTotal = parseCurrency(saldoFGTS) + (mesesTrabalho * salario * 8) / 100;
    
    if (tipoRescisao === "semJustaCausa") {
      multaFGTS = (fgtsTotal * 40) / 100;
    } else if (tipoRescisao === "acordo") {
      multaFGTS = (fgtsTotal * 20) / 100;
    }

    // Tratamento por tipo de rescisão
    let feriasVencidasFinal = feriasVencValor;
    let feriasProporcionaisFinal = feriasProporcionais;
    let tercoFeriasFinal = tercoFeriasProp;
    
    if (tipoRescisao === "justaCausa") {
      feriasVencidasFinal = parseFloat(feriasVencidas) * salario; // Sem 1/3
      feriasProporcionaisFinal = 0;
      tercoFeriasFinal = 0;
    }

    if (tipoRescisao === "acordo" && avisoIndenizado) {
      // Aviso prévio pela metade em acordo
      const valorAvisoMetade = valorAviso / 2;
    }

    const totalProventos = saldoSalario + valorAviso + feriasVencidasFinal + 
                          feriasProporcionaisFinal + tercoFeriasFinal + decimoTerceiro + fgtsMes + multaFGTS;

    const inss = calcularINSS(totalProventos);
    const irrf = calcularIRRF(totalProventos);
    
    const totalDescontos = inss + irrf;
    const valorLiquido = totalProventos - totalDescontos;

    setResult({
      proventos: {
        saldoSalario,
        avisoPrevio: valorAviso,
        feriasVencidas: feriasVencidasFinal,
        feriasProporcionais: feriasProporcionaisFinal,
        tercoFerias: tercoFeriasFinal,
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
    });
  };

  const handleWhatsAppClick = () => {
    if (!result) return;
    
    const message = encodeURIComponent(
      `*Solicitação de Auditoria - Rescisão Trabalhista*\n\n` +
        `*Dados do Funcionário:*\n` +
        `*Salário Bruto:* R$ ${salarioBruto}\n` +
        `*Data de Admissão:* ${dataAdmissao}\n` +
        `*Data de Desligamento:* ${dataDesligamento}\n` +
        `*Tipo de Rescisão:* ${tipoRescisao}\n` +
        `*Aviso Prévio:* ${avisoPrevio}\n` +
        `*Férias Vencidas:* ${feriasVencidas} períodos\n` +
        `*Saldo FGTS:* R$ ${saldoFGTS || 'Não informado'}\n\n` +
        `*Resumo do Cálculo:*\n` +
        `*Total Bruto:* ${formatCurrency(result.totalBruto)}\n` +
        `*Total Descontos:* ${formatCurrency(result.totalDescontos)}\n` +
        `*Valor Líquido Estimado:* ${formatCurrency(result.valorLiquido)}\n\n` +
        `Gostaria de solicitar uma auditoria completa para análise detalhada do meu caso.`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <>
      <div className="container">
        <div className="pt-6 pb-4">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-border/50 text-muted-foreground hover:text-foreground hover:bg-background"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Página Inicial
          </Button>
        </div>
      </div>
      
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              Simulador Gratuito
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mt-2 mb-4">
              Calculadora de Rescisão Trabalhista
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Calcule uma estimativa do valor da sua rescisão considerando todas as verbas trabalhistas.
            </p>
          </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-border/50 shadow-card bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-xl font-serif">
                    Simule sua Rescisão
                  </CardTitle>
                  <CardDescription>
                    Preencha os campos abaixo para calcular
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="salario" className="text-foreground">
                    Salário Bruto Mensal
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      id="salario"
                      type="text"
                      placeholder="3.000,00"
                      value={salarioBruto}
                      onChange={handleSalarioChange}
                      className="bg-background border-border focus:border-accent pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fgts" className="text-foreground">
                    Saldo de FGTS (opcional)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      id="fgts"
                      type="text"
                      placeholder="10.000,00"
                      value={saldoFGTS}
                      onChange={(e) => setSaldoFGTS(e.target.value)}
                      className="bg-background border-border focus:border-accent pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admissao" className="text-foreground">
                    Data de Admissão
                  </Label>
                  <Input
                    id="admissao"
                    type="date"
                    value={dataAdmissao}
                    onChange={(e) => setDataAdmissao(e.target.value)}
                    className="bg-background border-border focus:border-accent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desligamento" className="text-foreground">
                    Data de Desligamento
                  </Label>
                  <Input
                    id="desligamento"
                    type="date"
                    value={dataDesligamento}
                    onChange={(e) => setDataDesligamento(e.target.value)}
                    className="bg-background border-border focus:border-accent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-foreground mb-3 block">
                    Tipo de Rescisão
                  </Label>
                  <RadioGroup value={tipoRescisao} onValueChange={setTipoRescisao}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="semJustaCausa" id="semJustaCausa" />
                        <Label htmlFor="semJustaCausa" className="text-sm">
                          Demissão sem justa causa
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pedidoDemissao" id="pedidoDemissao" />
                        <Label htmlFor="pedidoDemissao" className="text-sm">
                          Pedido de demissão
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="acordo" id="acordo" />
                        <Label htmlFor="acordo" className="text-sm">
                          Acordo (art. 484-A da CLT)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="justaCausa" id="justaCausa" />
                        <Label htmlFor="justaCausa" className="text-sm">
                          Demissão por justa causa
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-foreground mb-3 block">
                    Situação do Aviso Prévio
                  </Label>
                  <RadioGroup value={avisoPrevio} onValueChange={setAvisoPrevio}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="indenizado" id="indenizado" />
                        <Label htmlFor="indenizado" className="text-sm">
                          Indenizado
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="trabalhado" id="trabalhado" />
                        <Label htmlFor="trabalhado" className="text-sm">
                          Trabalhado
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="naoAplica" id="naoAplica" />
                        <Label htmlFor="naoAplica" className="text-sm">
                          Não se aplica
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-foreground mb-3 block">
                    Quantidade de Férias Vencidas
                  </Label>
                  <Select value={feriasVencidas} onValueChange={setFeriasVencidas}>
                    <SelectTrigger className="bg-background border-border focus:border-accent">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Nenhuma</SelectItem>
                      <SelectItem value="1">1 período</SelectItem>
                      <SelectItem value="2">2 períodos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={calcularRescisao}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-base font-semibold shadow-elegant"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Calcular Rescisão
              </Button>

              {/* Resultados */}
              {result && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Proventos */}
                    <Card className="bg-accent/5 border-accent/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-serif text-accent">
                          Proventos
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="flex-1 mr-2">Saldo de salário</span>
                          <span className="font-medium text-right">{formatCurrency(result.proventos.saldoSalario)}</span>
                        </div>
                        {result.proventos.avisoPrevio > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="flex-1 mr-2">Aviso prévio indenizado</span>
                            <span className="font-medium text-right">{formatCurrency(result.proventos.avisoPrevio)}</span>
                          </div>
                        )}
                        {result.proventos.feriasVencidas > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="flex-1 mr-2">Férias vencidas</span>
                            <span className="font-medium text-right">{formatCurrency(result.proventos.feriasVencidas)}</span>
                          </div>
                        )}
                        {result.proventos.feriasProporcionais > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="flex-1 mr-2">Férias proporcionais</span>
                            <span className="font-medium text-right">{formatCurrency(result.proventos.feriasProporcionais)}</span>
                          </div>
                        )}
                        {result.proventos.tercoFerias > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="flex-1 mr-2">1/3 constitucional de férias</span>
                            <span className="font-medium text-right">{formatCurrency(result.proventos.tercoFerias)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="flex-1 mr-2">13º salário proporcional</span>
                          <span className="font-medium text-right">{formatCurrency(result.proventos.decimoTerceiro)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex-1 mr-2">FGTS do mês</span>
                          <span className="font-medium text-right">{formatCurrency(result.proventos.fgtsMes)}</span>
                        </div>
                        {result.proventos.multaFGTS > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="flex-1 mr-2">Multa do FGTS</span>
                            <span className="font-medium text-right">{formatCurrency(result.proventos.multaFGTS)}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total Bruto</span>
                          <span className="text-accent">{formatCurrency(result.totalBruto)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Descontos */}
                    <Card className="bg-destructive/5 border-destructive/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-serif text-destructive">
                          Descontos
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="flex-1 mr-2">INSS</span>
                          <span className="font-medium text-right">{formatCurrency(result.descontos.inss)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex-1 mr-2">IRRF</span>
                          <span className="font-medium text-right">{formatCurrency(result.descontos.irrf)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total de Descontos</span>
                          <span className="text-destructive">{formatCurrency(result.totalDescontos)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Valor Líquido */}
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          Valor Líquido a Receber
                        </p>
                        <p className="text-3xl md:text-5xl font-serif font-bold text-primary break-words">
                          {formatCurrency(result.valorLiquido)}
                        </p>
                      </div>
                      <div className="mt-6 space-y-3">
                        <Button
                          onClick={handleWhatsAppClick}
                          className="w-full bg-whatsapp hover:bg-whatsapp/90 text-white py-5"
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Solicitar Auditoria Completa
                        </Button>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={() => setResult(null)}
                            variant="outline"
                            className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                          >
                            Nova Simulação
                          </Button>
                          <Button
                            onClick={handleWhatsAppClick}
                            variant="outline"
                            className="border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Tirar Dúvidas
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="bg-muted/50 border border-border rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Aviso Importante</p>
                    <p>
                      Este cálculo é uma estimativa e não substitui uma análise jurídica individualizada. 
                      Para um cálculo exato, consulte um advogado trabalhista. As tabelas de INSS e IRRF 
                      devem ser atualizadas anualmente conforme legislação vigente.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </section>
    </>
  );
};

export default CalculadoraRescisao;
