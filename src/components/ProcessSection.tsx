import { MessageCircle, FileText, Scale, CheckCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageCircle,
    title: "Contato Inicial",
    description: "Entre em contato pelo WhatsApp ou telefone. Respondemos rapidamente e agendamos sua consulta gratuita.",
    highlight: "Gratuito",
  },
  {
    number: "02",
    icon: FileText,
    title: "Análise do Caso",
    description: "Avaliamos sua situação detalhadamente, analisamos documentos e identificamos a melhor estratégia jurídica.",
    highlight: "Sem compromisso",
  },
  {
    number: "03",
    icon: Scale,
    title: "Atuação Jurídica",
    description: "Entramos com as medidas necessárias, seja administrativa ou judicial, mantendo você informado em cada etapa.",
    highlight: "Transparência total",
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Resolução",
    description: "Trabalhamos até conquistar seus direitos. Você recebe o que é seu por justiça, com todo suporte necessário.",
    highlight: "Resultado",
  },
];

const ProcessSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
          <p className="text-accent font-medium mb-4">Como Funciona</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mb-6">
            Do contato à conquista dos seus direitos
          </h2>
          <p className="text-lg text-muted-foreground">
            Um processo simples e transparente para garantir que você seja bem atendido
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            
            <div className="grid grid-cols-4 gap-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                    {/* Step Card */}
                    <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:shadow-elegant transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-4xl font-serif font-bold text-primary/20">{step.number}</span>
                        <span className="text-xs font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
                          {step.highlight}
                        </span>
                      </div>
                      
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      
                      <h3 className="font-serif font-semibold text-xl text-foreground mb-3">
                        {step.title}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                    
                    {/* Arrow between cards */}
                    {index < steps.length - 1 && (
                      <div className="absolute top-24 -right-3 z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex gap-4">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-full bg-primary/20 mt-2" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="bg-card rounded-xl p-5 shadow-card border border-border/50 flex-1 mb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-serif font-bold text-primary/30">{step.number}</span>
                      <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
                        {step.highlight}
                      </span>
                    </div>
                    <h3 className="font-serif font-semibold text-lg text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
