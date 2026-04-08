"use client";

import { useState } from "react";
import { Vehicle } from "@/lib/db/schema";
import { VehicleCard } from "./vehicle-card";
import { VehicleDialog } from "./vehicle-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Car } from "lucide-react";

interface VehiclesClientProps {
  vehicles: Vehicle[];
}

export function VehiclesClient({ vehicles }: VehiclesClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  function openNew() {
    setEditingVehicle(null);
    setDialogOpen(true);
  }

  function openEdit(v: Vehicle) {
    setEditingVehicle(v);
    setDialogOpen(true);
  }

  function onClose() {
    setDialogOpen(false);
    setEditingVehicle(null);
  }

  return (
    <div className="px-4 pt-4 pb-6 md:px-6 md:pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vehicles</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your vehicles for trip tracking
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Car className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">No vehicles yet</p>
          <p className="text-sm mt-1">Add a vehicle to track fuel, charging, and trip details</p>
          <Button className="mt-4" onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" /> Add Vehicle
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} onEdit={openEdit} />
          ))}
        </div>
      )}

      <VehicleDialog
        open={dialogOpen}
        onClose={onClose}
        vehicle={editingVehicle}
      />
    </div>
  );
}
