import { useState, useEffect } from "react";
import { MessageCircle, X, Clock } from "lucide-react";

const UrgencyBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const whatsappNumber = "5588996017070";
  const whatsappMessage = encodeURIComponent("Olá! Gostaria de agendar uma consulta gratuita.");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercentage >= 50 && !isDismissed) {
        setIsVisible(true);
      } else if (scrollPercentage < 40) {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="bg-accent text-accent-foreground py-2 px-3 sm:py-3 sm:px-4 shadow-lg">
        <div className="container flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1">
            <div className="hidden sm:flex items-center gap-2 animate-pulse">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">Consulta Gratuita</span>
            </div>
            <span className="text-xs sm:text-base font-medium">
              🔥 Vagas limitadas essa semana! Agende sua consulta agora
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 bg-card text-foreground px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-card/90 transition-colors shadow-md"
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Falar Agora</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-accent-foreground/10 rounded-full transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrgencyBar;