import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { BusListings } from "@/components/BusListings";
import { TouristRecommendations } from "@/components/TouristRecommendations";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <BusListings />
        <TouristRecommendations />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
