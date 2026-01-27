import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import AreasSection from "@/components/AreasSection";
import ProcessSection from "@/components/ProcessSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import AboutSection from "@/components/AboutSection";
import CalculatorHub from "@/components/CalculatorHub";
import FAQSection from "@/components/FAQSection";
import LocationSection from "@/components/LocationSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ConsultationTrigger from "@/components/ConsultationTrigger";
import UrgencyBar from "@/components/UrgencyBar";
import SocialProofNotification from "@/components/SocialProofNotification";
import Header from "@/components/Header";

const Index = () => {
  return (
    <>
      <Header />
      <main className="overflow-hidden">
        <UrgencyBar />
        <HeroSection />
        <TrustBar />
        <AreasSection />
        <ProcessSection />
        <TestimonialsSection />
        <AboutSection />
        <CalculatorHub />
        <FAQSection />
        <LocationSection />
        <Footer />
        <WhatsAppButton />
        <ConsultationTrigger />
        <SocialProofNotification />
      </main>
    </>
  );
};

export default Index;
