import { Star, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TouristAttraction } from "@/lib/data";

interface AttractionCardProps {
  attraction: TouristAttraction;
}

export function AttractionCard({ attraction }: AttractionCardProps) {
  return (
    <Card className="overflow-hidden group bg-card hover:shadow-lg transition-all duration-300 border-border">
      <div className="relative h-48 overflow-hidden">
        <img
          src={attraction.imageUrl}
          alt={attraction.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <Badge className="absolute top-3 left-3" variant="secondary">
          {attraction.category}
        </Badge>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-semibold text-lg text-foreground mb-1">{attraction.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{attraction.city}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {attraction.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-accent-foreground text-accent-foreground" />
            <span className="font-medium text-foreground">{attraction.rating}</span>
            <span className="text-muted-foreground">/5</span>
          </div>

          <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary">
            Explore
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
