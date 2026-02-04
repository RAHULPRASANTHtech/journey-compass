import { ArrowRight, MapPin, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useApp } from "@/contexts/AppContext";
import { INDIAN_CITIES, IndianCity } from "@/lib/data";
import heroImage from "@/assets/hero-bus-travel.jpg";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  onSearchClick?: () => void;
}

export function HeroSection({ onSearchClick }: HeroSectionProps) {
  const { fromCity, setFromCity, toCity, setToCity, journeyDate, setJourneyDate } = useApp();

  const handleSwapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  // Disable past dates
  const disablePastDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Bus traveling through scenic Indian landscape"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
      </div>

      <div className="container relative py-20 md:py-32">
        <div className="max-w-2xl">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Your Journey,{" "}
            <span className="text-primary">Our Commitment</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Book bus tickets across India's most popular routes. Comfortable, safe, and affordable travel awaits you.
          </p>

          <div className="mt-10 rounded-xl bg-card/90 backdrop-blur-sm p-6 shadow-lg border border-border">
            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_1fr_auto]">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  From
                </label>
                <Select
                  value={fromCity || ""}
                  onValueChange={(value) => setFromCity(value as IndianCity)}
                >
                  <SelectTrigger className="h-12 bg-background border-input">
                    <SelectValue placeholder="Select departure city" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {INDIAN_CITIES.filter((city) => city !== toCity).map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end pb-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-accent"
                  onClick={handleSwapCities}
                >
                  <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  To
                </label>
                <Select
                  value={toCity || ""}
                  onValueChange={(value) => setToCity(value as IndianCity)}
                >
                  <SelectTrigger className="h-12 bg-background border-input">
                    <SelectValue placeholder="Select destination city" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {INDIAN_CITIES.filter((city) => city !== fromCity).map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  Journey Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-12 w-full justify-start text-left font-normal bg-background border-input",
                        !journeyDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {journeyDate ? format(journeyDate, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={journeyDate}
                      onSelect={setJourneyDate}
                      disabled={disablePastDates}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-end">
                <Button
                  size="lg"
                  className="h-12 w-full md:w-auto px-8"
                  onClick={onSearchClick}
                >
                  Search Buses
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>500+ Bus Operators</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>10,000+ Routes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
