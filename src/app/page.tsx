import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import WelcomeSection from '@/components/WelcomeSection';
import ServiceSection from '@/components/ServiceSection';
import Gallery from '@/components/Gallary';
import VicarSection from '@/components/VicarSection';
import ContactSection from '@/components/ContactSection';
import ScrollToTopButton from "@/components/ScrollToTopButton";
import LiveStreamFloatingModal from "@/components/LiveStreamFloatingModal"; 
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <WelcomeSection />
      <ServiceSection />
      <Gallery/>
      <VicarSection />
      <ContactSection />
      <Footer />
      <ScrollToTopButton />
      <LiveStreamFloatingModal/>
    </main>
  );
}