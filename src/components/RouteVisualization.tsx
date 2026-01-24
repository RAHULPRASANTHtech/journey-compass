import { MapPin, Clock, Route } from "lucide-react";

interface RouteVisualizationProps {
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  distance: string;
}

export function RouteVisualization({
  from,
  to,
  departureTime,
  arrivalTime,
  duration,
  distance,
}: RouteVisualizationProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border-2 border-primary">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div className="mt-1 text-center">
          <p className="text-sm font-semibold text-foreground">{departureTime}</p>
          <p className="text-xs text-muted-foreground max-w-[80px] truncate">{from}</p>
        </div>
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-x-0 top-5 flex items-center">
          <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/60 to-primary rounded-full" />
        </div>
        <div className="relative flex justify-center">
          <div className="bg-card px-3 py-1.5 rounded-full border border-border shadow-sm flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground">{duration}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <Route className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground">{distance}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent border-2 border-accent-foreground">
          <MapPin className="h-5 w-5 text-accent-foreground" />
        </div>
        <div className="mt-1 text-center">
          <p className="text-sm font-semibold text-foreground">{arrivalTime}</p>
          <p className="text-xs text-muted-foreground max-w-[80px] truncate">{to}</p>
        </div>
      </div>
    </div>
  );
}
