import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const testimonials = [
  {
    name: "Maria Silva",
    location: "Juazeiro do Norte",
    text: "A Dra. Thalita foi fundamental na minha aposentadoria. Depois de ter o benefício negado duas vezes, ela conseguiu reverter a decisão. Profissional atenciosa e dedicada.",
    rating: 5,
    case: "Aposentadoria por Idade",
  },
  {
    name: "José Oliveira",
    location: "Crato",
    text: "Recebi todas as minhas verbas trabalhistas graças ao trabalho da Dra. Thalita. Ela me explicou todo o processo de forma clara e me manteve informado em cada etapa.",
    rating: 5,
    case: "Rescisão Trabalhista",
  },
  {
    name: "Ana Santos",
    location: "Barbalha",
    text: "Excelente profissional! Me ajudou no processo de divórcio com muita sensibilidade e competência. Recomendo a todos que precisam de uma advogada de confiança.",
    rating: 5,
    case: "Direito de Família",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 md:py-28 bg-cream">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
          <p className="text-accent font-medium mb-4">Depoimentos</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mb-6">
            O que nossos clientes dizem
          </h2>
          <p className="text-lg text-muted-foreground">
            A satisfação dos nossos clientes é nossa maior conquista
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-card border-border/50 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-primary/20" />
                </div>

                <p className="text-foreground leading-relaxed">
                  "{testimonial.text}"
                </p>

                <div className="pt-4 border-t border-border/50">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.location} · {testimonial.case}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Social Proof Banner */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8 text-center">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-muted border-2 border-card flex items-center justify-center text-sm font-medium text-muted-foreground"
                >
                  {i === 4 ? "+99" : ""}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Advocacia com dedicação</span> e olhar humano para o seu caso
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-accent text-accent" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">4.9/5</span> no Google
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
