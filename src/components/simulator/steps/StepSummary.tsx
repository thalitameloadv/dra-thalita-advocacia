import { useMemo } from "react";
import { useSimulationWizard } from "../WizardContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, UploadCloud, FileDown, FileText, MessageCircle } from "lucide-react";
import { calculateSimulation } from "@/services/calculation-engine";
import type { RegraResultado } from "@/types/simulation";
import { downloadDraftJson, downloadResultCsv, downloadResultPdf } from "@/services/exporters";

const formatCurrency = (value?: number) =>
  value === undefined
    ? "-"
    : value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

const whatsappNumber = "5588996017070";

const RuleCard = ({ rule }: { rule: RegraResultado }) => {
  const improvement =
    rule.rmiSemDescarte && rule.rmiComDescarte
      ? rule.rmiComDescarte - rule.rmiSemDescarte
      : 0;
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/10 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{rule.nome}</p>
          <p className="text-xs text-muted-foreground">
            Tempo: {(rule.tempoTotalMeses / 12).toFixed(1)} anos · Carência: {rule.carenciaMeses}/{rule.carenciaExigida} meses
          </p>
        </div>
        <Badge variant={rule.elegivel ? "default" : "outline"} className="text-xs">
          {rule.elegivel ? "Elegível" : "Pendente"}
        </Badge>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <div className="rounded-xl bg-background/70 p-3 text-sm">
          <p className="text-xs text-muted-foreground">RMI sem descarte</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(rule.rmiSemDescarte)}</p>
        </div>
        <div className="rounded-xl bg-background/70 p-3 text-sm">
          <p className="text-xs text-muted-foreground">RMI com descarte</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(rule.rmiComDescarte)}</p>
          {improvement > 0 && (
            <p className="text-xs text-emerald-600">
              +{improvement.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} ({rule.ganhoEstimado?.toFixed(2)}%)
            </p>
          )}
        </div>
      </div>
      {!rule.elegivel && rule.motivoNaoElegivel && (
        <p className="text-xs text-amber-700 rounded-lg bg-amber-50 p-2">{rule.motivoNaoElegivel}</p>
      )}
      {rule.competenciasDescartadas && rule.competenciasDescartadas.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-primary">Ver competências descartadas</summary>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-muted-foreground">
            {rule.competenciasDescartadas.slice(0, 4).map((item) => (
              <li key={item.competencia}>
                {item.competencia}: {item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </li>
            ))}
            {rule.competenciasDescartadas.length > 4 && <li>+ outras {rule.competenciasDescartadas.length - 4} competências</li>}
          </ul>
        </details>
      )}
    </div>
  );
};

export const StepSummary = () => {
  const { draft } = useSimulationWizard();
  const result = useMemo(() => calculateSimulation(draft), [draft]);

  const handleWhatsAppClick = () => {
    const { basicData } = draft;
    
    // Formatar dados básicos
    const sexoLabel = basicData.sexo === "masculino" ? "Masculino" : basicData.sexo === "feminino" ? "Feminino" : "Não informado";
    const dataNascFormatted = basicData.dataNascimento ? new Date(basicData.dataNascimento).toLocaleDateString("pt-BR") : "Não informado";
    const derFormatted = basicData.der ? new Date(basicData.der).toLocaleDateString("pt-BR") : "Não informado";
    const derReafirmadaFormatted = basicData.derReafirmada ? new Date(basicData.derReafirmada).toLocaleDateString("pt-BR") : "Não informado";
    const beneficioTipo = basicData.tipoBeneficio.length > 0 ? basicData.tipoBeneficio.join(", ") : "Não especificado";

    // Encontrar melhor resultado
    let melhorRegra = "";
    let melhorValor = 0;
    result.cenarios.forEach((cenario) => {
      if (cenario.melhorOpcao) {
        const valor = cenario.melhorOpcao.rmiComDescarte || cenario.melhorOpcao.rmiSemDescarte || 0;
        if (valor > melhorValor) {
          melhorValor = valor;
          melhorRegra = `${cenario.melhorOpcao.nome} (${cenario.derTipo === "atual" ? "DER Atual" : "DER Reafirmada"})`;
        }
      }
    });

    // Construir mensagem
    let message = `*🧮 SIMULAÇÃO DE APOSENTADORIA INSS*\n\n`;
    
    message += `*📋 DADOS BÁSICOS*\n`;
    message += `• Sexo: ${sexoLabel}\n`;
    message += `• Data de Nascimento: ${dataNascFormatted}\n`;
    message += `• DER: ${derFormatted}\n`;
    if (basicData.derReafirmada) {
      message += `• DER Reafirmada: ${derReafirmadaFormatted}\n`;
    }
    message += `• Tipo de Benefício: ${beneficioTipo}\n\n`;

    message += `*📊 RESUMO DA SIMULAÇÃO*\n`;
    message += `• Períodos importados: ${draft.periodos.length}\n`;
    message += `• Remunerações: ${draft.remuneracoes.length}\n`;
    message += `• Alertas críticos: ${result.alertas.length}\n\n`;

    if (melhorRegra && melhorValor > 0) {
      message += `*✅ MELHOR OPÇÃO IDENTIFICADA*\n`;
      message += `• Regra: ${melhorRegra}\n`;
      message += `• Valor estimado: ${formatCurrency(melhorValor)}\n\n`;
    }

    // Adicionar resultados por cenário
    result.cenarios.forEach((cenario) => {
      message += `*${cenario.derTipo === "atual" ? "📅 CENÁRIO DER ATUAL" : "📅 CENÁRIO DER REAFIRMADA"}*\n`;
      message += `DER: ${new Date(cenario.der).toLocaleDateString("pt-BR")}\n\n`;
      
      cenario.resultados.forEach((regra) => {
        if (regra.elegivel) {
          message += `  ✓ ${regra.nome}\n`;
          message += `    RMI sem descarte: ${formatCurrency(regra.rmiSemDescarte)}\n`;
          message += `    RMI com descarte: ${formatCurrency(regra.rmiComDescarte)}\n`;
          if (regra.ganhoEstimado && regra.ganhoEstimado > 0) {
            message += `    Ganho: ${regra.ganhoEstimado.toFixed(2)}%\n`;
          }
        } else {
          message += `  ✗ ${regra.nome} (Não elegível)\n`;
          if (regra.motivoNaoElegivel) {
            message += `    Motivo: ${regra.motivoNaoElegivel}\n`;
          }
        }
        message += `\n`;
      });
    });

    if (result.alertas.length > 0) {
      message += `*⚠️ ALERTAS*\n`;
      result.alertas.forEach((alerta) => {
        message += `• ${alerta}\n`;
      });
      message += `\n`;
    }

    message += `*📞 PRÓXIMOS PASSOS*\n`;
    message += `Gostaria de uma análise jurídica completa e personalizada do meu caso para validar estes resultados e dar entrada no benefício.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
  };

  const resumo = [
    {
      label: "Períodos importados",
      value: draft.periodos.length,
      description: "Consolidados após remover concomitâncias",
    },
    {
      label: "Remunerações",
      value: draft.remuneracoes.length,
      description: "Competências válidas para o PBC",
    },
    {
      label: "Alertas críticos",
      value: result.alertas.length,
      description: "Pendências que podem afetar a elegibilidade",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Resultado preliminar</CardTitle>
          <CardDescription>
            Aplicamos as regras da EC 103/2019, normalizamos os períodos e simulamos cenários com e sem DER reafirmada.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {resumo.map((item) => (
            <div key={item.label} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {result.cenarios.map((cenario) => (
        <Card key={`${cenario.derTipo}-${cenario.der}`} className="border-border/60 bg-card shadow-md">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="font-serif text-xl">
                  Cenário {cenario.derTipo === "atual" ? "DER Atual" : "DER Reafirmada"}
                </CardTitle>
                <CardDescription>DER considerada: {new Date(cenario.der).toLocaleDateString("pt-BR")}</CardDescription>
              </div>
              {cenario.melhorOpcao && (
                <Badge className="bg-[#C99700] text-[#0D1B2A]">
                  Regra mais vantajosa: {cenario.melhorOpcao.nome}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {cenario.resultados.map((rule) => (
                <RuleCard key={rule.regraId} rule={rule} />
              ))}
            </div>
            {result.alertas.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-semibold">Alertas que podem afetar o cenário</p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {result.alertas.map((alerta) => (
                    <li key={alerta}>{alerta}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Card className="border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Relatório e metodologia</CardTitle>
          <CardDescription>
            Gere um relatório em PDF ou CSV, exporte o rascunho JSON e compartilhe com o seu time jurídico.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Metodologia resumida</p>
            <p className="mt-1">{result.metodologiaResumo}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              className="gap-2 bg-whatsapp hover:bg-whatsapp/90 text-white w-full sm:w-auto" 
              onClick={handleWhatsAppClick}
              size="lg"
            >
              <MessageCircle className="h-5 w-5" />
              Enviar Resumo via WhatsApp
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2" onClick={() => downloadDraftJson(draft)}>
              <UploadCloud className="h-4 w-4" />
              Exportar rascunho (JSON)
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => downloadResultCsv(result)}>
              <FileText className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Button className="gap-2" onClick={() => downloadResultPdf(draft, result)}>
              <FileDown className="h-4 w-4" />
              Baixar PDF
            </Button>
            <Button 
              className="gap-2" 
              variant="secondary"
              onClick={() => {
                const message = `*🔍 SOLICITAÇÃO DE AUDITORIA*\n\nOlá! Gostaria de solicitar uma auditoria completa da minha simulação de aposentadoria INSS.\n\n*Dados da simulação:*\n• Períodos: ${draft.periodos.length}\n• Remunerações: ${draft.remuneracoes.length}\n• Alertas: ${result.alertas.length}\n\nPor favor, entre em contato para discutir os próximos passos.`;
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
              }}
            >
              <ShieldCheck className="h-4 w-4" />
              Solicitar auditoria
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
