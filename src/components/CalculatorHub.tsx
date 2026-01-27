import { Calculator, FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";

interface CalculatorHubProps {
  className?: string;
}

const CalculatorHub = ({ className = "" }: CalculatorHubProps) => {
  // Links configuráveis para cada calculadora
  const calculatorLinks = {
    aposentadoria: "/calculadora-aposentadoria",
    rescisao: "/calculadora-rescisao-trabalhista",
  };

  return (
    <section className={`py-20 bg-muted/30 ${className}`}>
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-accent uppercase tracking-wider">
            Ferramentas Gratuitas
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mt-2 mb-4">
            Calculadoras Jurídicas
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ferramentas práticas para ajudá-lo a entender seus direitos. Simule
            cenários e obtenha estimativas rápidas para planejar seu futuro.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card 1: Calculadora de Aposentadoria */}
          <Card className="border-border/50 shadow-card bg-card hover:shadow-elegant transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Calculator className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-serif text-foreground mb-2">
                Calculadora de Aposentadoria
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground leading-relaxed">
                Simulação completa de aposentadoria com análise detalhada de todas as regras do INSS, importação de CNIS e cálculos precisos.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                asChild
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold shadow-elegant group-hover:shadow-glow transition-all"
              >
                <a href={calculatorLinks.aposentadoria}>
                  Simulação Completa
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: Calculadora de Rescisão Trabalhista */}
          <Card className="border-border/50 shadow-card bg-card hover:shadow-elegant transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <FileText className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl font-serif text-foreground mb-2">
                Calculadora de Rescisão Trabalhista
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground leading-relaxed">
                Descubra uma estimativa do valor da sua rescisão (saldo salarial, férias, 13º, FGTS e multa) de forma rápida e prática.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                asChild
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-base font-semibold shadow-elegant group-hover:shadow-glow transition-all"
              >
                <a href={calculatorLinks.rescisao}>
                  Simular rescisão
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            <strong>Importante:</strong> Estas calculadoras fornecem estimativas baseadas nas informações fornecidas. 
            Para uma análise completa e personalizada do seu caso, recomendamos consultar um de nossos advogados especializados.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CalculatorHub;
