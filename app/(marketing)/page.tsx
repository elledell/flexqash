import TopBar from "../components/TopBar";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FlipCards from "../components/FlipCards";
import HowItWorks from "../components/HowItWorks";
import Countries from "../components/Countries";
import ForexLessons from "../components/ForexLessons";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-50">
      <TopBar />
      <Navbar />
      <Hero />
      <FlipCards />
      <HowItWorks />
      <Countries />
      <ForexLessons />
      <FAQ />
      <Footer />
    </main>
  );
}