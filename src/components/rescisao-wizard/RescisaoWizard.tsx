import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, ShieldCheck, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { RescisaoWizardProvider } from "./RescisaoContext";
import { StepDadosBasicos } from "./steps/StepDadosBasicos";
import { StepResultado } from "./steps/StepResultado";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: "A",
    title: "Dados do Contrato",
    subtitle: "Salário, datas e tipo de rescisão",
    component: StepDadosBasicos,
  },
  {
    id: "B", 
    title: "Resultado",
    subtitle: "Cálculo detalhado das verbas",
    component: StepResultado,
  },
];

const WizardShell = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const CurrentComponent = steps[currentIndex].component;

  const progress = useMemo(() => ((currentIndex + 1) / steps.length) * 100, [currentIndex]);

  const handlePrev = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const handleNext = () => setCurrentIndex((prev) => Math.min(steps.length - 1, prev + 1));

  return (
    <div className="grid gap-6 lg:gap-8 lg:grid-cols-[320px,1fr]">
      {/* Mobile Progress Header */}
      <div className="lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full rounded-2xl border border-border/60 bg-gradient-to-r from-[#0D1B2A] to-[#19273c] p-4 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C99700]/20">
                <Calculator className="h-5 w-5 text-[#C99700]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Etapa {currentIndex + 1} de {steps.length}</p>
                <p className="text-xs text-white/70">{steps[currentIndex].title}</p>
              </div>
            </div>
            {sidebarOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-white/20">
            <div className="h-full rounded-full bg-[#C99700] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "rounded-3xl border border-border/60 bg-gradient-to-b from-[#0D1B2A] to-[#19273c] p-6 text-white shadow-xl transition-all",
        "lg:block",
        sidebarOpen ? "block" : "hidden lg:block"
      )}>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C99700]/20">
              <Calculator className="h-6 w-6 text-[#C99700]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Calculadora de Rescisão</h3>
              <p className="text-sm text-white/70">Simulador passo a passo</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl p-3 transition-all cursor-pointer",
                  index === currentIndex
                    ? "bg-[#C99700]/20 border border-[#C99700]/30"
                    : "hover:bg-white/10"
                )}
                onClick={() => setCurrentIndex(index)}
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                  index === currentIndex
                    ? "bg-[#C99700] text-white"
                    : index < currentIndex
                    ? "bg-green-500 text-white"
                    : "bg-white/20 text-white/70"
                )}>
                  {index < currentIndex ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-white/70">{step.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-[#C99700]" />
              <span className="text-sm font-medium">Segurança e Privacidade</span>
            </div>
            <p className="text-xs text-white/70">
              Seus dados são processados localmente e não são armazenados em nossos servidores.
            </p>
          </div>

          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#C99700] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm text-white/70">
            {progress.toFixed(0)}% completo
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="space-y-6">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-foreground">
              {steps[currentIndex].title}
            </h1>
            <p className="text-muted-foreground mt-1">
              {steps[currentIndex].subtitle}
            </p>
          </div>
          <Badge variant="secondary" className="bg-[#C99700]/10 text-[#C99700] border-[#C99700]/30">
            Etapa {currentIndex + 1} de {steps.length}
          </Badge>
        </div>

        {/* Step Content */}
        <div className="min-h-[500px]">
          <CurrentComponent />
        </div>

        {/* Navigation */}
        <Separator />
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="border-border/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-2 w-8 rounded-full transition-all",
                  index === currentIndex
                    ? "bg-[#C99700]"
                    : index < currentIndex
                    ? "bg-green-500"
                    : "bg-border"
                )}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={currentIndex === steps.length - 1}
            className="bg-[#C99700] hover:bg-[#C99700]/90 text-white"
          >
            Próximo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
};

const RescisaoWizard = () => {
  return (
    <RescisaoWizardProvider>
      <WizardShell />
    </RescisaoWizardProvider>
  );
};

export default RescisaoWizard;
