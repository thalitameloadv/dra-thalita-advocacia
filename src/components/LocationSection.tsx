import { MapPin, Clock, Phone, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import predioImg from "@/assets/predio.jpg";
import recepcaoImg from "@/assets/recepcao.jpg";
import escritorioImg from "@/assets/escritorio.jpg";
import visaoEscritorioImg from "@/assets/visao-escritorio.jpg";
const LocationSection = () => {
  const address = "R. Profa. Maria Nilde Couto Bem, 220 - Triângulo, Juazeiro do Norte - CE, 63041-155";
  const googleMapsUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3948.8726969088!2d-39.31555982425!3d-7.213889692792!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7a17f1c0b1f8b51%3A0x7eb4c0a5a3f8e1c7!2sEdif%C3%ADcio%20Office%20Cariri!5e0!3m2!1spt-BR!2sbr!4v1699999999999!5m2!1spt-BR!2sbr`;
  const directionsUrl = "https://www.google.com/maps/dir//R.+Profa.+Maria+Nilde+Couto+Bem,+220+-+Tri%C3%A2ngulo,+Juazeiro+do+Norte+-+CE,+63041-155";

  return (
    <section id="localizacao" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Localização
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mt-2 mb-4">
            Nosso Escritório
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Estamos localizados no coração do Cariri, prontos para atender você com 
            toda a dedicação que seu caso merece.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Map */}
          <div className="rounded-2xl overflow-hidden shadow-card h-[400px] lg:h-[500px]">
            <iframe
              src={googleMapsUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização do Escritório"
              className="w-full h-full"
            />
          </div>

          {/* Info & Images */}
          <div className="space-y-6">
            {/* Address Card */}
            <div className="bg-background rounded-2xl p-6 shadow-card">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-lg text-foreground mb-1">
                    Edifício Office Cariri
                  </h3>
                  <p className="text-muted-foreground">
                    R. Profa. Maria Nilde Couto Bem, 220<br />
                    Triângulo - Juazeiro do Norte/CE<br />
                    9º Andar, Sala 915<br />
                    CEP: 63041-155
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Horário</p>
                    <p className="text-sm text-muted-foreground">Seg - Sex: 8h às 18h</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Telefone</p>
                    <p className="text-sm text-muted-foreground">88996017070</p>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => window.open(directionsUrl, '_blank')}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Como Chegar
              </Button>
            </div>

            {/* Office Images Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-card">
                <img 
                  src={predioImg} 
                  alt="Fachada do Edifício Office Cariri" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-card">
                <img 
                  src={recepcaoImg} 
                  alt="Recepção do Edifício" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-card">
                <img 
                  src={escritorioImg} 
                  alt="Escritório de Advocacia" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-card">
                <img 
                  src={visaoEscritorioImg} 
                  alt="Vista do Escritório" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
