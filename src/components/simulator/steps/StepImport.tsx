import { useMemo, useState } from "react";
import { CloudUpload, FileSpreadsheet, FileText, Loader2, ShieldAlert, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSimulationWizard } from "../WizardContext";
import { importData, type ImportMode } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const tabConfig: { id: ImportMode; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: "cnis",
    label: "Extrato CNIS",
    description: "PDF com Relações Previdenciárias e Remunerações atualizado no Meu INSS.",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: "contagem",
    label: "Contagem INSS",
    description: "Contagem oficial emitida pelo INSS com períodos já consolidados.",
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    id: "planilha",
    label: "Planilha Template",
    description: "Planilha padrão (Excel/Sheets) com períodos e remunerações organizados.",
    icon: <FileSpreadsheet className="h-4 w-4" />,
  },
];

export const StepImport = () => {
  const { toast } = useToast();
  const { draft, ingestImport } = useSimulationWizard();
  const [activeTab, setActiveTab] = useState<ImportMode>("cnis");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const lastImports = useMemo(() => draft.importSummaries.slice(-3).reverse(), [draft.importSummaries]);

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Arquivo obrigatório",
        description: "Selecione um arquivo antes de iniciar a importação.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await importData(activeTab, file);
      ingestImport(result);
      toast({
        title: "Dados importados",
        description: `${result.summary.periodosImportados} período(s) e ${result.summary.remuneracoesImportadas} remuneração(ões) adicionados.`,
      });
      setFile(null);
    } catch (error) {
      toast({
        title: "Erro ao importar",
        description: error instanceof Error ? error.message : "Falha inesperada",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Importe seus dados</CardTitle>
          <CardDescription>
            Estamos prontos para receber CNIS, Contagem ou planilha. Nenhum arquivo é armazenado além de 24h e os dados
            estruturados ficam seguros (criptografia at-rest no Brasil).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ImportMode)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 gap-1">
              {tabConfig.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-3 py-2 flex-col sm:flex-row gap-1">
                  <div className="sm:mr-2">{tab.icon}</div>
                  <span className="truncate">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {tabConfig.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                <div className="space-y-4 rounded-xl border border-dashed border-border/60 bg-muted/20 p-6">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-foreground">{tab.label}</p>
                    <p className="text-sm text-muted-foreground">{tab.description}</p>
                  </div>
                  <label
                    className={cn(
                      "flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-border/70 bg-background p-6 text-center transition",
                      "hover:border-primary/70 hover:bg-primary/5",
                    )}
                  >
                    <CloudUpload className="h-8 w-8 text-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Arraste e solte ou clique para selecionar</p>
                      <p className="text-xs text-muted-foreground">PDF, ZIP, XLSX ou CSV até 15MB</p>
                    </div>
                    <Input
                      type="file"
                      className="hidden"
                      accept={
                        tab.id === "planilha"
                          ? ".xlsx,.xls,.csv"
                          : tab.id === "cnis"
                            ? ".pdf,.zip"
                            : ".pdf"
                      }
                      onChange={(event) => {
                        const selectedFile = event.target.files?.[0] ?? null;
                        setFile(selectedFile);
                      }}
                    />
                    {file && (
                      <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        {file.name}
                      </div>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <Badge variant="outline">Processamento seguro</Badge>
                    <Badge variant="outline">Detecção de inconsistências</Badge>
                    <Badge variant="outline">Tempo médio &lt; 3s</Badge>
                  </div>
                  <div className="flex flex-col gap-2 rounded-xl bg-amber-50 px-4 py-3 text-amber-900">
                    <div className="flex items-center gap-2 font-semibold">
                      <ShieldAlert className="h-4 w-4" />
                      LGPD em primeiro lugar
                    </div>
                    <p className="text-sm">
                      Não armazenamos PDFs originais. Após o parsing, apenas os dados estruturados permanecem por até 30
                      dias.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button disabled={loading} onClick={handleImport}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importando…
                        </>
                      ) : (
                        "Importar dados"
                      )}
                    </Button>
                    {tab.id === "planilha" && (
                      <Button variant="ghost" className="text-primary underline-offset-4 hover:underline">
                        Baixar template Excel
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      <Card className="border-border/60 bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-xl">Histórico recente</CardTitle>
              <CardDescription>Últimas importações desta simulação.</CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              Autorrecuperação ativada
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {lastImports.length === 0 && (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              Nenhuma importação registrada ainda. Envie seu CNIS, Contagem ou planilha para habilitar a Etapa C.
            </div>
          )}
          {lastImports.map((importSummary, index) => (
            <div
              key={`${importSummary.fonte}-${index}`}
              className="rounded-xl border border-border/50 bg-muted/10 p-4 text-sm text-muted-foreground"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-foreground">
                <div className="font-medium">
                  {importSummary.fonte === "cnis_upload"
                    ? "CNIS"
                    : importSummary.fonte === "contagem_upload"
                      ? "Contagem INSS"
                      : "Planilha"}
                </div>
                <div className="text-xs">
                  {importSummary.periodosImportados} período(s) • {importSummary.remuneracoesImportadas} remuneração(ões)
                </div>
              </div>
              <ul className="mt-2 list-disc pl-5 text-xs">
                {importSummary.mensagens.map((msg) => (
                  <li key={msg}>{msg}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
