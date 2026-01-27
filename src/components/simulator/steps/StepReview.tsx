import { useSimulationWizard } from "../WizardContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

export const StepReview = () => {
  const { draft, removePeriodo, removeRemuneracao } = useSimulationWizard();

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Períodos (Etapa C)</CardTitle>
          <CardDescription>
            Ajuste datas, categorias e observações para garantir que o cálculo considere somente períodos válidos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-full overflow-x-auto">
            <ScrollArea className="w-full max-w-full max-h-[320px] rounded-xl border border-border/60">
              <Table className="w-max min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Carência</TableHead>
                    <TableHead>Fonte</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {draft.periodos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                        Nenhum período importado ainda. Envie o CNIS, Contagem ou adicione manualmente.
                      </TableCell>
                    </TableRow>
                  )}
                  {draft.periodos.map((periodo) => (
                    <TableRow key={periodo.id} className="text-sm">
                      <TableCell>{periodo.inicio}</TableCell>
                      <TableCell>{periodo.fim}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{periodo.categoria}</Badge>
                      </TableCell>
                      <TableCell>{periodo.indicadorCarencia ? "Sim" : "Não"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{periodo.fonte.replace("_upload", "").toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => removePeriodo(periodo.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
          <Button variant="outline" className="mt-4 w-full sm:w-auto">
            Adicionar período manualmente
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Remunerações</CardTitle>
          <CardDescription>
            Revise os valores por competência. Detectamos automaticamente salários fora de faixa e duplicidades.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-full overflow-x-auto">
            <ScrollArea className="w-full max-w-full max-h-[320px] rounded-xl border border-border/60">
              <Table className="w-max min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Competência</TableHead>
                    <TableHead className="text-xs">Valor (R$)</TableHead>
                    <TableHead className="text-xs">Origem</TableHead>
                    <TableHead className="text-xs">Alertas</TableHead>
                    <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {draft.remuneracoes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                      Sem remunerações registradas ainda.
                    </TableCell>
                  </TableRow>
                )}
                {draft.remuneracoes.map((remuneracao) => (
                  <TableRow key={remuneracao.id}>
                    <TableCell className="text-xs">{remuneracao.competencia}</TableCell>
                    <TableCell className="text-xs">{remuneracao.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">{remuneracao.fonte}</Badge>
                    </TableCell>
                    <TableCell>
                      {remuneracao.inconsistente ? (
                        <Badge variant="destructive">Inconsistência</Badge>
                      ) : (
                        <Badge variant="outline">OK</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => removeRemuneracao(remuneracao.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">Detecção de duplicidade</Badge>
            <Badge variant="outline">Alerta salário mínimo</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
