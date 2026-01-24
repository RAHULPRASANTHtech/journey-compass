import { useState } from "react";
import { Users, Wifi, Battery, Star, Armchair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RouteVisualization } from "./RouteVisualization";
import { SeatSelectionModal } from "./SeatSelectionModal";
import { Bus } from "@/lib/data";

interface BusCardProps {
  bus: Bus;
}

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-3.5 w-3.5" />,
  Charging: <Battery className="h-3.5 w-3.5" />,
};

export function BusCard({ bus }: BusCardProps) {
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const occupancyPercentage = (bus.occupiedSeats / bus.totalSeats) * 100;
  const isAlmostFull = bus.availableSeats <= 5;

  return (
    <Card className="overflow-hidden bg-card hover:shadow-lg transition-shadow duration-300 border-border">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-foreground">{bus.operatorName}</h3>
              <div className="flex items-center gap-1 bg-accent px-2 py-0.5 rounded-full">
                <Star className="h-3.5 w-3.5 fill-accent-foreground text-accent-foreground" />
                <span className="text-xs font-medium text-accent-foreground">{bus.rating}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{bus.busType}</p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-primary">₹{bus.price.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">per seat</p>
          </div>
        </div>

        <RouteVisualization
          from={bus.from}
          to={bus.to}
          departureTime={bus.departureTime}
          arrivalTime={bus.arrivalTime}
          duration={bus.duration}
          distance={bus.distance}
        />

        <div className="mt-6 p-4 rounded-lg bg-background border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Armchair className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Seat Availability</span>
            </div>
            {isAlmostFull && (
              <Badge variant="destructive" className="text-xs">
                Filling Fast!
              </Badge>
            )}
          </div>

          <Progress value={occupancyPercentage} className="h-2 mb-3" />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">{bus.totalSeats}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div>
              <p className="text-lg font-bold text-destructive">{bus.occupiedSeats}</p>
              <p className="text-xs text-muted-foreground">Booked</p>
            </div>
            <div>
              <p className="text-lg font-bold text-primary">{bus.availableSeats}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {bus.amenities.map((amenity) => (
            <Badge key={amenity} variant="secondary" className="text-xs gap-1">
              {amenityIcons[amenity]}
              {amenity}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button className="w-full" size="lg" onClick={() => setSeatModalOpen(true)}>
          <Users className="mr-2 h-4 w-4" />
          Select Seats
        </Button>
      </CardFooter>
      
      <SeatSelectionModal 
        bus={bus} 
        open={seatModalOpen} 
        onOpenChange={setSeatModalOpen} 
      />
    </Card>
  );
}
