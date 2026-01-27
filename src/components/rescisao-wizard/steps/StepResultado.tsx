import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRescisaoWizard } from "../RescisaoContext";
import { Calculator, Download, MessageCircle, ShieldCheck, ArrowLeft, ArrowRight } from "lucide-react";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const whatsappNumber = "5588996017070";

export const StepResultado = () => {
  const { resultado, dadosBasicos, reset } = useRescisaoWizard();

  if (!resultado) {
    return (
      <Card className="border-border/50 shadow-card bg-card">
        <CardContent className="text-center py-12">
          <Calculator className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum resultado disponível</p>
        </CardContent>
      </Card>
    );
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Olá! Gostaria de solicitar uma auditoria completa da minha rescisão trabalhista.\n\n` +
      `*Dados do Cálculo:*\n` +
      `*Salário Bruto:* ${dadosBasicos.salarioBruto}\n` +
      `*Data Admissão:* ${dadosBasicos.dataAdmissao}\n` +
      `*Data Desligamento:* ${dadosBasicos.dataDesligamento}\n` +
      `*Tipo Rescisão:* ${dadosBasicos.tipoRescisao}\n` +
      `*Aviso Prévio:* ${dadosBasicos.avisoPrevio}\n\n` +
      `*Resumo do Cálculo:*\n` +
      `*Total Bruto:* ${formatCurrency(resultado.totalBruto)}\n` +
      `*Total Descontos:* ${formatCurrency(resultado.totalDescontos)}\n` +
      `*Valor Líquido Estimado:* ${formatCurrency(resultado.valorLiquido)}\n\n` +
      `Gostaria de solicitar uma auditoria completa para análise detalhada do meu caso.`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-card bg-card">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-accent" />
            </div>
            <div>
              <CardTitle className="text-xl font-serif">Resultado da Rescisão</CardTitle>
              <CardDescription>
                Cálculo detalhado das verbas rescisórias
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">Total Bruto</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(resultado.totalBruto)}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">Total Descontos</p>
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(resultado.totalDescontos)}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-accent/10 border border-accent/30">
              <p className="text-sm text-muted-foreground mb-1">Valor Líquido</p>
              <p className="text-2xl font-bold text-accent">
                {formatCurrency(resultado.valorLiquido)}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Proventos
              </Badge>
              Verbas a Receber
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Saldo de Salário</span>
                <span className="font-medium">{formatCurrency(resultado.proventos.saldoSalario)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Aviso Prévio</span>
                <span className="font-medium">{formatCurrency(resultado.proventos.avisoPrevio)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Férias Vencidas</span>
                <span className="font-medium">{formatCurrency(resultado.proventos.feriasVencidas)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Férias Proporcionais</span>
                <span className="font-medium">{formatCurrency(resultado.proventos.feriasProporcionais)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">1/3 Constitucional sobre Férias</span>
                <span className="font-medium">{formatCurrency(resultado.proventos.tercoFerias)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">13º Salário Proporcional</span>
                <span className="font-medium">{formatCurrency(resultado.proventos.decimoTerceiro)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">FGTS do Mês</span>
                <span className="font-medium">{formatCurrency(resultado.proventos.fgtsMes)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Multa do FGTS</span>
                <span className="font-medium text-accent">{formatCurrency(resultado.proventos.multaFGTS)}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Descontos
              </Badge>
              Valores Retidos
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">INSS</span>
                <span className="font-medium">{formatCurrency(resultado.descontos.inss)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Imposto de Renda (IRRF)</span>
                <span className="font-medium">{formatCurrency(resultado.descontos.irrf)}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Button
              onClick={handleWhatsAppClick}
              className="w-full bg-whatsapp hover:bg-whatsapp/90 text-white py-5"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Solicitar Auditoria Completa
            </Button>
            <Button
              onClick={handleWhatsAppClick}
              variant="outline"
              className="w-full border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Tirar Dúvidas
            </Button>
            <Button
              onClick={reset}
              variant="outline"
              className="w-full border-border/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Novo Cálculo
            </Button>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-accent mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Este cálculo é uma estimativa baseada nas informações fornecidas. 
                Para uma análise completa e personalizada, consulte um advogado trabalhista.
                As tabelas de INSS e IRRF devem ser atualizadas anualmente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
