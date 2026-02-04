import { useCallback } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { BusListings } from "@/components/BusListings";
import { TouristRecommendations } from "@/components/TouristRecommendations";
import { Footer } from "@/components/Footer";

const Index = () => {
  const scrollToBuses = useCallback(() => {
    document
      .getElementById("available-buses")
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection onSearchClick={scrollToBuses} />
        <BusListings />
        <TouristRecommendations />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
