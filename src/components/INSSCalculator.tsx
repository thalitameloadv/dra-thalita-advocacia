import { useState } from "react";
import { Calculator, MessageCircle, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const INSSCalculator = () => {
  const [age, setAge] = useState("");
  const [contributionYears, setContributionYears] = useState("");
  const [salary, setSalary] = useState("");
  const [result, setResult] = useState<{
    eligible: boolean;
    estimatedBenefit: number;
    message: string;
    rule: string;
  } | null>(null);

  const whatsappNumber = "5588996017070";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const numValue = parseInt(value) / 100;
    if (!isNaN(numValue)) {
      setSalary(formatCurrency(numValue).replace("R$", "").trim());
    } else {
      setSalary("");
    }
  };

  const parseSalary = (value: string) => {
    return parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0;
  };

  const calculateBenefit = () => {
    const ageNum = parseInt(age);
    const yearsNum = parseInt(contributionYears);
    const salaryNum = parseSalary(salary);

    if (isNaN(ageNum) || isNaN(yearsNum) || salaryNum <= 0) {
      setResult({
        eligible: false,
        estimatedBenefit: 0,
        message: "Por favor, preencha todos os campos corretamente.",
        rule: "",
      });
      return;
    }

    // Regras simplificadas do INSS (2024)
    const TETO_INSS = 7786.02;
    const SALARIO_MINIMO = 1412.0;

    // Base de cálculo limitada ao teto
    const salarioContribuicao = Math.min(salaryNum, TETO_INSS);

    // Regra de transição - Idade mínima progressiva (mulher: 62 anos, homem: 65 anos)
    // Para simplificar, usamos 62 anos como referência
    const idadeMinima = 62;
    const tempoMinimoContribuicao = 15;

    if (ageNum < idadeMinima) {
      const anosRestantes = idadeMinima - ageNum;
      setResult({
        eligible: false,
        estimatedBenefit: 0,
        message: `Faltam ${anosRestantes} ano(s) para atingir a idade mínima de ${idadeMinima} anos.`,
        rule: "Regra de Transição por Idade",
      });
      return;
    }

    if (yearsNum < tempoMinimoContribuicao) {
      const anosRestantes = tempoMinimoContribuicao - yearsNum;
      setResult({
        eligible: false,
        estimatedBenefit: 0,
        message: `Faltam ${anosRestantes} ano(s) de contribuição para atingir o mínimo de ${tempoMinimoContribuicao} anos.`,
        rule: "Tempo mínimo de contribuição",
      });
      return;
    }

    // Cálculo do benefício (simplificado)
    // 60% + 2% por ano acima de 15 anos de contribuição
    const percentualBase = 60;
    const anosAdicionais = Math.max(0, yearsNum - 15);
    const percentualAdicional = anosAdicionais * 2;
    const percentualTotal = Math.min(100, percentualBase + percentualAdicional);

    // Média salarial (simplificada - usando o salário informado)
    const beneficioEstimado = (salarioContribuicao * percentualTotal) / 100;

    // Garantia do salário mínimo
    const beneficioFinal = Math.max(beneficioEstimado, SALARIO_MINIMO);

    setResult({
      eligible: true,
      estimatedBenefit: beneficioFinal,
      message: `Com ${yearsNum} anos de contribuição, você tem direito a ${percentualTotal}% da média salarial.`,
      rule: "Regra de Transição por Idade",
    });
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `*Simulação de Aposentadoria INSS*\n\n` +
        `*Idade:* ${age} anos\n` +
        `*Tempo de Contribuição:* ${contributionYears} anos\n` +
        `*Salário:* R$ ${salary}\n\n` +
        `${result?.eligible ? `*Benefício Estimado:* ${formatCurrency(result.estimatedBenefit)}` : `*Situação:* ${result?.message}`}\n\n` +
        `Gostaria de uma análise completa do meu caso.`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <section id="calculadora" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-accent uppercase tracking-wider">
            Simulador Gratuito
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mt-2 mb-4">
            Calculadora de Aposentadoria INSS
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descubra uma estimativa do seu benefício de aposentadoria. Para uma análise
            completa e personalizada, entre em contato conosco.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="border-border/50 shadow-card bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-serif">
                    Simule sua Aposentadoria
                  </CardTitle>
                  <CardDescription>
                    Preencha os campos abaixo para calcular
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-foreground flex items-center gap-2">
                    Idade Atual
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Sua idade atual em anos completos</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Ex: 55"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="18"
                    max="100"
                    className="bg-background border-border focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contribution" className="text-foreground flex items-center gap-2">
                    Anos de Contribuição
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Tempo total de contribuição ao INSS</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="contribution"
                    type="number"
                    placeholder="Ex: 25"
                    value={contributionYears}
                    onChange={(e) => setContributionYears(e.target.value)}
                    min="0"
                    max="50"
                    className="bg-background border-border focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary" className="text-foreground flex items-center gap-2">
                    Salário Atual
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Sua última remuneração bruta</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      id="salary"
                      type="text"
                      placeholder="3.000,00"
                      value={salary}
                      onChange={handleSalaryChange}
                      className="bg-background border-border focus:border-primary pl-10"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={calculateBenefit}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold shadow-elegant"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Calcular Benefício
              </Button>

              {/* Result */}
              {result && (
                <div
                  className={`p-6 rounded-xl animate-fade-in ${
                    result.eligible
                      ? "bg-accent/10 border border-accent/30"
                      : "bg-muted border border-border"
                  }`}
                >
                  {result.eligible ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">
                          Benefício Estimado
                        </p>
                        <p className="text-3xl md:text-4xl font-serif font-bold text-accent break-words">
                          {formatCurrency(result.estimatedBenefit)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {result.rule}
                        </p>
                      </div>
                      <p className="text-sm text-center text-foreground">
                        {result.message}
                      </p>
                      <div className="space-y-3">
                        <Button
                          onClick={handleWhatsAppClick}
                          className="w-full bg-whatsapp hover:bg-whatsapp/90 text-white py-5"
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Solicitar Análise Completa
                        </Button>
                        <Button
                          onClick={handleWhatsAppClick}
                          variant="outline"
                          className="w-full border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Tirar Dúvidas
                        </Button>
                      </div>
                    </div>
                  ) : (
                      <div className="space-y-3">
                        <p className="text-foreground font-medium">{result.message}</p>
                        {result.rule && (
                          <p className="text-sm text-muted-foreground">{result.rule}</p>
                        )}
                        <Button
                          onClick={handleWhatsAppClick}
                          variant="outline"
                          className="w-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Falar com Advogado
                        </Button>
                      </div>
                  )}
                </div>
              )}

              <p className="text-xs text-center text-muted-foreground">
                * Este é um cálculo simplificado para fins de simulação. O valor real
                pode variar conforme sua situação específica. Consulte-nos para uma
                análise detalhada.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default INSSCalculator;
