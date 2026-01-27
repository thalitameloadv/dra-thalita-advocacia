import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulationWizard } from "../WizardContext";
import { cn } from "@/lib/utils";

const beneficioOptions = [
  { id: "idade", label: "Aposentadoria por Idade (RGPS)" },
  { id: "programada", label: "Aposentadoria Programada pós-EC 103" },
  { id: "tempo", label: "Aposentadoria por Tempo (direito adquirido/transição)" },
  { id: "transicao", label: "Regras de Transição (pontos/pedágio)" },
  { id: "especial", label: "Aposentadoria Especial" },
  { id: "pcd", label: "Aposentadoria da Pessoa com Deficiência" },
];

const sexoOptions = [
  { id: "feminino", label: "Mulher" },
  { id: "masculino", label: "Homem" },
  { id: "outro", label: "Outro" },
  { id: "nao_informado", label: "Prefiro não informar" },
];

export const StepBasicData = () => {
  const { draft, updateBasicData } = useSimulationWizard();

  const handleBeneficioToggle = (id: string) => {
    const alreadySelected = draft.basicData.tipoBeneficio.includes(id);
    const next = alreadySelected
      ? draft.basicData.tipoBeneficio.filter((item) => item !== id)
      : [...draft.basicData.tipoBeneficio, id];
    updateBasicData({ tipoBeneficio: next });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl text-foreground">Dados básicos</CardTitle>
          <CardDescription>
            Essas informações calibram a linha do tempo e as regras aplicáveis à sua simulação.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Sexo</Label>
            <RadioGroup
              className="grid gap-2"
              value={draft.basicData.sexo}
              onValueChange={(value) => updateBasicData({ sexo: value as typeof draft.basicData.sexo })}
            >
              {sexoOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/20 px-4 py-3"
                >
                  <RadioGroupItem id={option.id} value={option.id} />
                  <Label htmlFor={option.id} className="cursor-pointer text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Data de nascimento</Label>
            <Input
              id="dob"
              type="date"
              value={draft.basicData.dataNascimento}
              onChange={(e) => updateBasicData({ dataNascimento: e.target.value })}
              max={new Date().toISOString().slice(0, 10)}
            />
            <p className="text-xs text-muted-foreground">
              Usamos a data para calcular idade mínima e pontuação em regras de transição.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="der">DER desejada</Label>
            <Input
              id="der"
              type="date"
              value={draft.basicData.der}
              onChange={(e) => updateBasicData({ der: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Data de Entrada do Requerimento (DER). Pode ser a data atual ou futura.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="der-reafirmada">DER reafirmada (opcional)</Label>
            <Input
              id="der-reafirmada"
              type="date"
              value={draft.basicData.derReafirmada ?? ""}
              onChange={(e) => updateBasicData({ derReafirmada: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Use se deseja simular o cenário reafirmado (ex.: adicionar meses de contribuição).
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl text-foreground">Tipo de benefício alvo</CardTitle>
          <CardDescription>
            Selecione um ou mais tipos para que possamos considerar as regras correspondentes. Não tem certeza? Marque
            “Não sei”.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {beneficioOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleBeneficioToggle(option.id)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition hover:border-primary/70",
                  draft.basicData.tipoBeneficio.includes(option.id)
                    ? "border-primary/80 bg-primary/10 text-primary-foreground"
                    : "border-border/70 bg-muted/30",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{option.label}</span>
                  {draft.basicData.tipoBeneficio.includes(option.id) && <Badge variant="outline">Selecionado</Badge>}
                </div>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border/70 bg-muted/20 p-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="nao-sei"
                checked={draft.basicData.naoSeiBeneficio}
                onCheckedChange={(checked) => updateBasicData({ naoSeiBeneficio: Boolean(checked) })}
              />
              <Label htmlFor="nao-sei" className="font-medium">
                Não sei qual benefício escolher
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Podemos sugerir automaticamente a melhor regra com base nos seus períodos e remunerações.
            </p>
            <Button variant="outline" size="sm" className="w-fit">
              Conversar com especialista
            </Button>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <span className="font-semibold">Importante:</span> quanto mais específico o objetivo, mais preciso será o
            enquadramento das regras da EC 103/2019.
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Precisão desejada</CardTitle>
          <CardDescription>
            Perfeito para iniciar com poucos dados, mas destacamos a limitação quando o CNIS não é importado.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Modo simplificado</p>
            <p className="text-xs text-muted-foreground">
              Calcula apenas com idade, contribuição e salário aproximado (sem histórico CNIS).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="modo-simplificado"
              checked={draft.basicData.modoSimplificado}
              onCheckedChange={(checked) => updateBasicData({ modoSimplificado: Boolean(checked) })}
            />
            <Label htmlFor="modo-simplificado" className="text-sm">
              Permanecer no modo simplificado (menos preciso)
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
