"use client";

import { Vehicle } from "@/lib/db/schema";
import { deleteVehicle } from "@/lib/actions/vehicles";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Zap, Fuel } from "lucide-react";
import { toast } from "sonner";

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
}

export function VehicleCard({ vehicle, onEdit }: VehicleCardProps) {
  async function handleDelete() {
    if (!confirm(`Delete "${vehicle.name}"?`)) return;
    const result = await deleteVehicle(vehicle.id);
    if (result.success) {
      toast.success("Vehicle deleted");
    } else {
      toast.error("Failed to delete vehicle");
    }
  }

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold">{vehicle.name}</p>
              <Badge variant="secondary">
                {vehicle.type === "EV" ? (
                  <><Zap className="h-3 w-3 mr-1" />EV</>
                ) : vehicle.type === "HYBRID" ? (
                  <>⚡ Hybrid</>
                ) : (
                  <><Fuel className="h-3 w-3 mr-1" />ICE</>
                )}
              </Badge>
            </div>
            {(vehicle.make || vehicle.model) && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {[vehicle.make, vehicle.model].filter(Boolean).join(" ")}
              </p>
            )}
            {vehicle.registrationNumber && (
              <p className="text-xs font-mono bg-muted inline-block px-2 py-0.5 rounded mt-1">
                {vehicle.registrationNumber}
              </p>
            )}
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
              {vehicle.batteryCapacityKwh && (
                <span>🔋 {vehicle.batteryCapacityKwh} kWh</span>
              )}
              {vehicle.fuelType && <span>⛽ {vehicle.fuelType}</span>}
              {vehicle.tankCapacityLitres && (
                <span>🛢 {vehicle.tankCapacityLitres}L</span>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(vehicle)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
