import { useEffect } from "react";
import CalculatorHub from "@/components/CalculatorHub";

const CalculadorasPage = () => {
  useEffect(() => {
    document.title = "Calculadoras Jurídicas | Direito em Foco";
    window.scrollTo(0, 0);
  }, []);

  return <CalculatorHub />;
};

export default CalculadorasPage;
