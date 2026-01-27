import { Briefcase, FileCheck, Users, Heart, ShoppingBag, Scale, ArrowRight } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

const areas = [
  {
    icon: Briefcase,
    title: "Direito Trabalhista",
    description: "Rescisão, horas extras, assédio moral, verbas não pagas, FGTS e muito mais.",
    problems: ["Fui demitido sem justa causa", "Não recebi minhas verbas", "Sofri assédio no trabalho"],
  },
  {
    icon: FileCheck,
    title: "Direito Previdenciário",
    description: "Aposentadoria, auxílio-doença, BPC/LOAS, pensão por morte e revisões.",
    problems: ["INSS negou meu benefício", "Quero me aposentar", "Preciso de auxílio-doença"],
  },
  {
    icon: Users,
    title: "Direito de Família",
    description: "Divórcio, pensão alimentícia, guarda de filhos, inventário e partilha.",
    problems: ["Quero me divorciar", "Preciso de pensão", "Disputa de guarda"],
  },
  {
    icon: Heart,
    title: "Direito Civil",
    description: "Contratos, indenizações, cobranças, responsabilidade civil e danos morais.",
    problems: ["Sofri danos morais", "Contrato descumprido", "Preciso cobrar dívida"],
  },
  {
    icon: ShoppingBag,
    title: "Direito do Consumidor",
    description: "Produto com defeito, propaganda enganosa, cobranças indevidas e recalls.",
    problems: ["Produto com defeito", "Cobrado indevidamente", "Serviço não prestado"],
  },
  {
    icon: Scale,
    title: "Advocacia Geral",
    description: "Consultoria jurídica, elaboração de contratos, pareceres e outras demandas.",
    problems: ["Preciso de consultoria", "Elaborar um contrato", "Orientação jurídica"],
  },
];

const AreasSection = () => {
  const whatsappNumber = "5588996017070";

  return (
    <section id="areas" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
          <p className="text-accent font-medium mb-4">Áreas de Atuação</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mb-6">
            Como posso te ajudar?
          </h2>
          <p className="text-lg text-muted-foreground">
            Atuação especializada em diversas áreas do direito, sempre com foco 
            na defesa dos seus direitos e resolução do seu problema.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area, index) => (
            <Card
              key={index}
              className="group bg-card border-border/50 hover:border-primary/30 hover:shadow-card transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <area.icon className="w-7 h-7 text-primary" />
                </div>
                
                <div>
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                    {area.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {area.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  {area.problems.map((problem, i) => (
                    <a
                      key={i}
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Olá! ${problem}. Gostaria de agendar uma consulta.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-primary/10 transition-colors group/item"
                    >
                      <span className="text-sm text-foreground">{problem}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                    </a>
                  ))}
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="w-full mt-4 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Olá! Tenho uma dúvida sobre ${area.title}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Tenho esse problema
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AreasSection;
