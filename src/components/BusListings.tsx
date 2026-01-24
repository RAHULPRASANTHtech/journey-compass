import { Bus as BusIcon, Filter, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusCard } from "./BusCard";
import { useApp } from "@/contexts/AppContext";
import { getAllAvailableBuses, getBusesByRoute } from "@/lib/data";

export function BusListings() {
  const { fromCity, toCity } = useApp();

  const buses = fromCity && toCity 
    ? getBusesByRoute(fromCity, toCity) 
    : getAllAvailableBuses();

  const hasSearchCriteria = fromCity && toCity;

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BusIcon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
                {hasSearchCriteria 
                  ? `Buses from ${fromCity} to ${toCity}` 
                  : "Available Buses"}
              </h2>
            </div>
            <p className="text-muted-foreground">
              {buses.length} bus{buses.length !== 1 ? "es" : ""} found
              {hasSearchCriteria ? " for your route" : " across popular routes"}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <SortAsc className="h-4 w-4" />
              Sort
            </Button>
          </div>
        </div>

        {buses.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <BusIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No buses found</h3>
            <p className="text-muted-foreground">
              Try selecting different cities or check back later
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {buses.map((bus) => (
              <BusCard key={bus.id} bus={bus} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
