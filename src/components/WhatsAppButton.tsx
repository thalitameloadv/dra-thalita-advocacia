import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const whatsappNumber = "5588996017070";
  const whatsappMessage = encodeURIComponent("Olá! Gostaria de agendar uma consulta.");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <>
      {/* Desktop - Floating Button */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex fixed bottom-8 right-8 z-50 items-center gap-3 bg-whatsapp text-accent-foreground px-6 py-4 rounded-full shadow-lg hover:scale-105 transition-transform animate-pulse-soft"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="font-semibold">Fale no WhatsApp</span>
      </a>

      {/* Mobile - Sticky Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur border-t border-border">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-whatsapp text-accent-foreground py-4 rounded-xl font-semibold shadow-lg"
        >
          <MessageCircle className="w-5 h-5" />
          Fale Agora no WhatsApp
        </a>
      </div>
    </>
  );
};

export default WhatsAppButton;
