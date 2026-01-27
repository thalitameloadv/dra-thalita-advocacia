import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { Button } from "./ui/button";
import ConsultationPopup from "./ConsultationPopup";

const ConsultationTrigger = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hasShownExitIntent, setHasShownExitIntent] = useState(false);

  // Exit intent detection (desktop only)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (
        e.clientY <= 0 &&
        !hasShownExitIntent &&
        !isPopupOpen &&
        !sessionStorage.getItem("exitIntentShown")
      ) {
        setIsPopupOpen(true);
        setHasShownExitIntent(true);
        sessionStorage.setItem("exitIntentShown", "true");
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasShownExitIntent, isPopupOpen]);

  // Show popup after 30 seconds on page (if not already shown)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem("timeoutPopupShown") && !isPopupOpen) {
        setIsPopupOpen(true);
        sessionStorage.setItem("timeoutPopupShown", "true");
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [isPopupOpen]);

  return (
    <>
      {/* Floating CTA Button - Desativado conforme solicitação */}
      {/* <Button
        onClick={() => setIsPopupOpen(true)}
        className="hidden lg:flex fixed bottom-8 left-8 z-40 bg-primary hover:bg-primary/90 text-primary-foreground shadow-elegant hover:shadow-glow transition-all duration-300 gap-2"
        size="lg"
      >
        <Calendar className="w-5 h-5" />
        Consulta Gratuita
      </Button> */}

      <ConsultationPopup open={isPopupOpen} onOpenChange={setIsPopupOpen} />
    </>
  );
};

export default ConsultationTrigger;
