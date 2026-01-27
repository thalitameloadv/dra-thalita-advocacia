import { MapPin, Phone, Mail, Instagram, Clock, BookOpen, Calculator, Home } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy text-primary-foreground py-16">
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Logo & Description */}
          <div className="lg:col-span-2 space-y-6">
            <img src={logo} alt="Thalita Melo Advocacia" className="h-28 brightness-0 invert" />
            <p className="text-primary-foreground/70 leading-relaxed max-w-md">
              Advocacia humanizada em Juazeiro do Norte (CE). Defendemos seus direitos
              trabalhistas, previdenciários, civis e de família com dedicação e empatia.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/thalitademeloadv/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary/50 transition-colors"
                aria-label="Instagram de Thalita Melo Advocacia"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif font-semibold text-lg">Links Rápidos</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Início
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Blog Jurídico
                </Link>
              </li>
              <li>
                <Link
                  to="/calculadoras"
                  className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  <Calculator className="w-4 h-4" />
                  Calculadoras
                </Link>
              </li>
              <li>
                <Link
                  to="/calculadora-aposentadoria"
                  className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors pl-6"
                >
                  Aposentadoria
                </Link>
              </li>
              <li>
                <Link
                  to="/calculadora-rescisao-trabalhista"
                  className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors pl-6"
                >
                  Rescisão Trabalhista
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-serif font-semibold text-lg">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-primary-foreground/70">
                <Phone className="w-5 h-5 shrink-0 mt-0.5" />
                <span>88996017070</span>
              </li>
              <li className="flex items-start gap-3 text-primary-foreground/70">
                <Mail className="w-5 h-5 shrink-0 mt-0.5" />
                <span>contato@thalitameloadv.com.br</span>
              </li>
              <li className="flex items-start gap-3 text-primary-foreground/70">
                <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                <span>Seg - Sex: 8h às 18h</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10 mb-12">
          {/* Address */}
          <div className="space-y-4">
            <h4 className="font-serif font-semibold text-lg">Endereço</h4>
            <div className="flex items-start gap-3 text-primary-foreground/70">
              <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p>R. Profa. Maria Nilde Couto Bem, 220</p>
                <p>Triângulo - Juazeiro do Norte/CE</p>
                <p>Ed. Office Cariri, 9º Andar, Sala 915</p>
                <p>CEP: 63041-155</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/50">
          <p>© {currentYear} Thalita Melo Advocacia. Todos os direitos reservados.</p>
          <p>OAB/CE 53.837</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
