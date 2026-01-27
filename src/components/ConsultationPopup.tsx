import { useState, useEffect } from "react";
import { X, MessageCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

const consultationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Nome deve ter pelo menos 2 caracteres" })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres" }),
  phone: z
    .string()
    .trim()
    .min(10, { message: "Telefone inválido" })
    .max(15, { message: "Telefone inválido" })
    .regex(/^[\d\s()-]+$/, { message: "Telefone deve conter apenas números" }),
  email: z
    .string()
    .trim()
    .email({ message: "Email inválido" })
    .max(255, { message: "Email deve ter no máximo 255 caracteres" }),
  problem: z
    .string()
    .trim()
    .min(10, { message: "Descreva seu caso com pelo menos 10 caracteres" })
    .max(1000, { message: "Descrição deve ter no máximo 1000 caracteres" }),
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

interface ConsultationPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ConsultationPopup = ({ open, onOpenChange }: ConsultationPopupProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      problem: "",
    },
  });

  const onSubmit = async (data: ConsultationFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call - replace with actual backend when Lovable Cloud is enabled
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // For now, open WhatsApp with the data
    const whatsappNumber = "5588996017070";
    const message = encodeURIComponent(
      `*Nova Solicitação de Consulta Gratuita*\n\n` +
      `*Nome:* ${data.name}\n` +
      `*Telefone:* ${data.phone}\n` +
      `*Email:* ${data.email}\n\n` +
      `*Descrição do Caso:*\n${data.problem}`
    );
    
    // Open WhatsApp in background
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setIsSuccess(false);
      form.reset();
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border p-0 overflow-hidden">
        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="bg-gradient-hero p-6 pb-8">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-serif font-semibold text-foreground">
                      Consulta Gratuita
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Analisamos seu caso sem compromisso
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
            </div>

            {/* Form */}
            <div className="p-6 pt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Nome completo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite seu nome"
                            className="bg-background border-border focus:border-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Telefone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(88) 99999-9999"
                              className="bg-background border-border focus:border-primary"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="seu@email.com"
                              className="bg-background border-border focus:border-primary"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="problem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Descreva seu caso ou problema</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Conte-nos sobre sua situação para que possamos ajudá-lo da melhor forma..."
                            className="bg-background border-border focus:border-primary min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold shadow-elegant"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Solicitar Consulta Gratuita"
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Seus dados estão seguros e não serão compartilhados.
                  </p>
                </form>
              </Form>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-whatsapp/10 flex items-center justify-center mx-auto animate-scale-in">
              <CheckCircle className="w-10 h-10 text-whatsapp" />
            </div>
            
            <div className="space-y-3 animate-fade-in">
              <h3 className="text-2xl font-serif font-semibold text-foreground">
                Obrigado pelo contato!
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Recebemos sua solicitação de consulta gratuita. Em breve entraremos em 
                contato para conversarmos sobre sua situação e encontrarmos as melhores soluções.
              </p>
            </div>

            <div className="pt-4 space-y-3 animate-fade-in delay-200">
              <p className="text-sm text-muted-foreground">
                Tempo médio de resposta: <strong className="text-foreground">até 24 horas</strong>
              </p>
              <Button
                onClick={handleClose}
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationPopup;
