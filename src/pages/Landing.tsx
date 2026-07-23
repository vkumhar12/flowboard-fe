import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import InteractiveDemo from "../components/landing/InteractiveDemo";
import BentoGrid from "../components/landing/BentoGrid";
import FAQSection from "../components/landing/FAQSection";
import FinalCTA from "../components/landing/FinalCTA";
import Footer from "../components/landing/Footer";

const Landing = () => (
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

export default Landing;
