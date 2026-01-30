import { useEffect } from "react";
import CalculatorHub from "@/components/CalculatorHub";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CalculadorasPage = () => {
  useEffect(() => {
    document.title = "Calculadoras Jurídicas | Direito em Foco";
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Header />
      <CalculatorHub />
      <Footer />
    </>
  );
};

export default CalculadorasPage;
