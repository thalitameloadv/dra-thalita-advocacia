import { useEffect } from "react";
import { SimulationWizard } from "@/components/simulator/SimulationWizard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CalculadoraAposentadoriaPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Calculadora de Aposentadoria | Direito em Foco";
    window.scrollTo(0, 0);
  }, []);

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
          <SimulationWizard />
        </div>
      </section>
    </>
  );
};

export default CalculadoraAposentadoriaPage;
