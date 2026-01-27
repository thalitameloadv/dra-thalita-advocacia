import { Shield, Heart, MapPin, Clock } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Consulta",
    description: "Gratuita",
  },
  {
    icon: Heart,
    title: "Atendimento humanizado",
    description: "Você é nossa prioridade",
  },
  {
    icon: MapPin,
    title: "Região do Cariri",
    description: "E todo o Ceará",
  },
  {
    icon: Clock,
    title: "Resposta rápida",
    description: "Em até 24 horas",
  },
];

const TrustBar = () => {
  return (
    <section className="py-12 bg-cream">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-3 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                <benefit.icon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
