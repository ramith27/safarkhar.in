"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, VehicleFormValues } from "@/lib/validations/vehicle";
import { createVehicle, updateVehicle } from "@/lib/actions/vehicles";
import { Vehicle } from "@/lib/db/schema";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  ICE: "ICE (Petrol/Diesel)",
  EV: "Electric (EV)",
  HYBRID: "Hybrid",
};

const FUEL_TYPE_LABELS: Record<string, string> = {
  PETROL: "Petrol",
  DIESEL: "Diesel",
  CNG: "CNG",
  LPG: "LPG",
};

interface VehicleDialogProps {
  open: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
}

export function VehicleDialog({ open, onClose, vehicle }: VehicleDialogProps) {
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema) as never,
    defaultValues: {
      name: "",
      type: "ICE",
      make: "",
      model: "",
      registrationNumber: "",
      batteryCapacityKwh: undefined,
      fuelType: undefined,
      tankCapacityLitres: undefined,
    },
  });

  useEffect(() => {
    if (vehicle) {
      form.reset({
        name: vehicle.name,
        type: vehicle.type,
        make: vehicle.make ?? "",
        model: vehicle.model ?? "",
        registrationNumber: vehicle.registrationNumber ?? "",
        batteryCapacityKwh: vehicle.batteryCapacityKwh ?? undefined,
        fuelType: vehicle.fuelType ?? undefined,
        tankCapacityLitres: vehicle.tankCapacityLitres ?? undefined,
      });
    } else {
      form.reset({
        name: "",
        type: "ICE",
        make: "",
        model: "",
        registrationNumber: "",
      });
    }
  }, [vehicle, form]);

  const vehicleType = form.watch("type");

  async function onSubmit(data: VehicleFormValues) {
    const result = vehicle
      ? await updateVehicle(vehicle.id, data)
      : await createVehicle(data);
    if (result.success) {
      toast.success(vehicle ? "Vehicle updated" : "Vehicle added");
      onClose();
    } else {
      toast.error(result.error ?? "Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{vehicle ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="My Car" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input placeholder="Toyota" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Camry" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="registrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Number</FormLabel>
                  <FormControl>
                    <Input placeholder="KA01AB1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue>
                          {(v: string | null) => v ? (VEHICLE_TYPE_LABELS[v] ?? v) : "Select type"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ICE">ICE (Petrol/Diesel)</SelectItem>
                      <SelectItem value="EV">Electric (EV)</SelectItem>
                      <SelectItem value="HYBRID">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {(vehicleType === "EV" || vehicleType === "HYBRID") && (
              <FormField
                control={form.control}
                name="batteryCapacityKwh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Battery Capacity (kWh)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="40"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {(vehicleType === "ICE" || vehicleType === "HYBRID") && (
              <>
                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue>
                              {(v: string | null) => v ? (FUEL_TYPE_LABELS[v] ?? v) : "Select fuel type"}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PETROL">Petrol</SelectItem>
                          <SelectItem value="DIESEL">Diesel</SelectItem>
                          <SelectItem value="CNG">CNG</SelectItem>
                          <SelectItem value="LPG">LPG</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tankCapacityLitres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tank Capacity (litres)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="45"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Saving..."
                  : vehicle
                  ? "Save Changes"
                  : "Add Vehicle"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
