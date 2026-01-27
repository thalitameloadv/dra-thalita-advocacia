import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useRescisaoWizard } from "../RescisaoContext";
import { Calendar, DollarSign, FileText, Info } from "lucide-react";

export const StepDadosBasicos = () => {
  const { dadosBasicos, updateDadosBasicos } = useRescisaoWizard();

  const handleInputChange = (field: keyof typeof dadosBasicos, value: string) => {
    updateDadosBasicos({ [field]: value });
  };

  return (
    <Card className="border-border/50 shadow-card bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-serif">Dados do Contrato</CardTitle>
            <CardDescription>
              Informe os dados básicos do seu contrato de trabalho
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="salario" className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Salário Bruto Mensal
            </Label>
            <Input
              id="salario"
              type="text"
              placeholder="R$ 0,00"
              value={dadosBasicos.salarioBruto}
              onChange={(e) => handleInputChange("salarioBruto", e.target.value)}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="saldoFGTS" className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Saldo FGTS (opcional)
            </Label>
            <Input
              id="saldoFGTS"
              type="text"
              placeholder="R$ 0,00"
              value={dadosBasicos.saldoFGTS}
              onChange={(e) => handleInputChange("saldoFGTS", e.target.value)}
              className="text-base"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="dataAdmissao" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data de Admissão
            </Label>
            <Input
              id="dataAdmissao"
              type="date"
              value={dadosBasicos.dataAdmissao}
              onChange={(e) => handleInputChange("dataAdmissao", e.target.value)}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataDesligamento" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data de Desligamento
            </Label>
            <Input
              id="dataDesligamento"
              type="date"
              value={dadosBasicos.dataDesligamento}
              onChange={(e) => handleInputChange("dataDesligamento", e.target.value)}
              className="text-base"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Tipo de Rescisão</Label>
            <RadioGroup
              value={dadosBasicos.tipoRescisao}
              onValueChange={(value) => handleInputChange("tipoRescisao", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sem_justa_causa" id="sem_justa_causa" />
                <Label htmlFor="sem_justa_causa" className="text-sm">
                  Sem Justa Causa (empregador demite)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pedido_demissao" id="pedido_demissao" />
                <Label htmlFor="pedido_demissao" className="text-sm">
                  Pedido de Demissão (empregado pede)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="justa_causa" id="justa_causa" />
                <Label htmlFor="justa_causa" className="text-sm">
                  Justa Causa (empregador demite por falta)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="término_contrato" id="término_contrato" />
                <Label htmlFor="término_contrato" className="text-sm">
                  Término de Contrato por Prazo Determinado
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm font-medium">Aviso Prévio</Label>
            <Select
              value={dadosBasicos.avisoPrevio}
              onValueChange={(value) => handleInputChange("avisoPrevio", value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecione o tipo de aviso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trabalhado">Aviso Prévio Trabalhado</SelectItem>
                <SelectItem value="indenizado">Aviso Prévio Indenizado</SelectItem>
                <SelectItem value="sem_aviso">Sem Aviso Prévio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Férias Vencidas</Label>
            <RadioGroup
              value={dadosBasicos.feriasVencidas}
              onValueChange={(value) => handleInputChange("feriasVencidas", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="ferias_nao_vencidas" />
                <Label htmlFor="ferias_nao_vencidas" className="text-sm">
                  Não tenho férias vencidas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="30" id="ferias_30_dias" />
                <Label htmlFor="ferias_30_dias" className="text-sm">
                  Tenho 30 dias de férias vencidas
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-accent mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Preencha todos os campos para obter um cálculo preciso. Os dados são utilizados 
              para calcular todas as verbas rescisórias conforme a legislação trabalhista brasileira.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
