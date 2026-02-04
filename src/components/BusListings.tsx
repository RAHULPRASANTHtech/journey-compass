import { useState, useEffect } from "react";
import { Bus as BusIcon, Filter, SortAsc, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusCard } from "./BusCard";
import { useApp } from "@/contexts/AppContext";
import { getAllAvailableBuses, getBusesByRoute } from "@/lib/data";
import { Bus } from "@/lib/data";

const INITIAL_BUS_COUNT = 3;

export function BusListings() {
  const { fromCity, toCity, journeyDate } = useApp();
  const [showAllBuses, setShowAllBuses] = useState(false);

  const allBuses =
    fromCity && toCity
      ? getBusesByRoute(fromCity, toCity, journeyDate)
      : getAllAvailableBuses(journeyDate);

  useEffect(() => {
    setShowAllBuses(false);
  }, [fromCity, toCity, journeyDate]);

  const buses: Bus[] = showAllBuses ? allBuses : allBuses.slice(0, INITIAL_BUS_COUNT);
  const hasMore = allBuses.length > INITIAL_BUS_COUNT;
  const hiddenCount = allBuses.length - INITIAL_BUS_COUNT;

  const hasSearchCriteria = fromCity && toCity;

  return (
    <section id="available-buses" className="py-16 bg-background scroll-mt-20">
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
              {allBuses.length} bus{allBuses.length !== 1 ? "es" : ""} found
              {hasSearchCriteria ? " for your route" : " across popular routes"}
              {hasMore && !showAllBuses && ` (showing ${INITIAL_BUS_COUNT})`}
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
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {buses.map((bus) => (
                <BusCard key={bus.id} bus={bus} />
              ))}
            </div>
            {hasMore && !showAllBuses && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setShowAllBuses(true)}
                >
                  <ChevronDown className="h-4 w-4" />
                  Show all buses ({hiddenCount} more)
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
