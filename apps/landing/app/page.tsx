import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import InteractiveDemo from "../components/InteractiveDemo";
import BentoGrid from "../components/BentoGrid";
import FAQSection from "../components/FAQSection";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-bg text-ink selection:bg-brand-500 selection:text-white">
      <Navbar />
      <Hero />
      <InteractiveDemo />
      <BentoGrid />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
