"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripSchema, TripFormValues, TRANSPORT_MODES, TransportMode } from "@/lib/validations/trip";
import { updateTrip } from "@/lib/actions/trips";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { transportModeIcon, transportModeLabel } from "@/lib/utils/format";

interface EditTripDialogProps {
  open: boolean;
  onClose: () => void;
  trip: {
    id: string;
    title: string;
    description?: string | null;
    startLocation: string;
    endLocation?: string | null;
    startDate: string;
    endDate?: string | null;
    numPeople: number;
    notes?: string | null;
    primaryMode?: string | null;
  };
}

export function EditTripDialog({ open, onClose, trip }: EditTripDialogProps) {
  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema) as never,
    defaultValues: {
      title: "",
      description: "",
      startLocation: "",
      endLocation: "",
      startDate: "",
      endDate: "",
      numPeople: 1,
      notes: "",
      walletIds: [],
      primaryMode: null,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: trip.title,
        description: trip.description ?? "",
        startLocation: trip.startLocation,
        endLocation: trip.endLocation ?? "",
        startDate: trip.startDate,
        endDate: trip.endDate ?? "",
        numPeople: trip.numPeople,
        notes: trip.notes ?? "",
        walletIds: [],
        primaryMode: (trip.primaryMode as TransportMode) ?? null,
      });
    }
  }, [open, trip, form]);

  async function onSubmit(data: TripFormValues) {
    const result = await updateTrip(trip.id, data);
    if (result.success) {
      toast.success("Trip updated");
      onClose();
    } else {
      toast.error(result.error ?? "Failed to update trip");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Trip</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Goa Road Trip" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="startLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From *</FormLabel>
                    <FormControl>
                      <Input placeholder="Bangalore" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <Input placeholder="Goa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="numPeople"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>People *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="primaryMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transport Mode</FormLabel>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(v) =>
                        field.onChange(v === "" ? null : (v as TransportMode))
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue>
                            {(v: string | null) => v ? `${transportModeIcon(v)} ${transportModeLabel(v)}` : "Select mode"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">— None —</SelectItem>
                        {TRANSPORT_MODES.map((m) => (
                          <SelectItem key={m} value={m}>
                            {transportModeIcon(m)} {transportModeLabel(m)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Weekend getaway..." rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Packing list, reminders..." rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
