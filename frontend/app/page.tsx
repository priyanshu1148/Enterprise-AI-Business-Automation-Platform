import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowWeHelp from "./components/HowWeHelp";
import RealBusinessSolutions from "./components/RealBusinessSolutions";
import AutomationSystems from "./components/AutomationSystems";
import FinalCTA from "./components/FinalCTA";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import AIChat from "./components/AIChat";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <HowWeHelp />
      <RealBusinessSolutions />
      <AutomationSystems />

      <AIChat />

      <FinalCTA />
      <FAQ />
      <Footer />
    </main>
  );
}