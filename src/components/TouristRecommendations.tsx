import { Compass, Sparkles } from "lucide-react";
import { AttractionCard } from "./AttractionCard";
import { useApp } from "@/contexts/AppContext";
import { getAttractionsByCity, TOURIST_ATTRACTIONS } from "@/lib/data";

export function TouristRecommendations() {
  const { toCity } = useApp();

  const attractions = toCity 
    ? getAttractionsByCity(toCity) 
    : TOURIST_ATTRACTIONS.slice(0, 6);

  if (attractions.length === 0) return null;

  return (
    <section className="py-16 bg-card">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Compass className="h-5 w-5 text-accent-foreground" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
                {toCity 
                  ? `Explore ${toCity}` 
                  : "Popular Destinations"}
              </h2>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {toCity 
                ? "Discover nearby attractions and must-visit places" 
                : "Handpicked tourist attractions across India"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {attractions.map((attraction) => (
            <AttractionCard key={attraction.id} attraction={attraction} />
          ))}
        </div>
      </div>
    </section>
  );
}
