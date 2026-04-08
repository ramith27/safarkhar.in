"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, ExpenseFormValues } from "@/lib/validations/expense";
import { createExpense } from "@/lib/actions/expenses";
import { Wallet, Segment } from "@/lib/db/schema";
import { formatRupees } from "@/lib/utils/format";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Check } from "lucide-react";

const CATEGORIES = [
  { value: "TRANSPORT", label: "✈️ Transport" },
  { value: "FOOD", label: "🍽 Food & Drinks" },
  { value: "STAY", label: "🏨 Stay / Accommodation" },
  { value: "FUEL", label: "⛽ Fuel" },
  { value: "CHARGING", label: "🔌 EV Charging" },
  { value: "TOLL", label: "🛣 Toll" },
  { value: "PARKING", label: "🅿️ Parking" },
  { value: "MISC", label: "📦 Miscellaneous" },
];

const PAYMENT_METHODS = [
  { value: "WALLET", label: "Wallet" },
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
  { value: "PREPAID", label: "Prepaid" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
];

interface AddExpenseFormProps {
  tripId: string;
  wallets: Wallet[];
  segments: Segment[];
  defaultSegmentId?: string | null;
}

export function AddExpenseForm({ tripId, wallets, segments, defaultSegmentId }: AddExpenseFormProps) {
  const router = useRouter();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as never,
    defaultValues: {
      tripId,
      segmentId: defaultSegmentId ?? null,
      category: "MISC",
      subcategory: null,
      paymentMethod: "CASH",
      walletId: null,
      amountRupees: 0,
      description: "",
      vendorName: "",
      numPeople: 1,
      mealType: null,
      checkInDate: "",
      checkOutDate: "",
      numNights: null,
      roomType: "",
      litresAdded: null,
      fuelStationName: "",
      kwhAdded: null,
      chargerName: "",
      tollName: "",
      ticketRef: "",
    },
  });

  const category = form.watch("category");
  const paymentMethod = form.watch("paymentMethod");

  async function onSubmit(data: ExpenseFormValues) {
    const result = await createExpense(data);
    if (result.success) {
      toast.success("Expense added");
      router.push(`/trips/${tripId}`);
    } else {
      toast.error(result.error ?? "Failed to add expense");
    }
  }

  return (
    <div className="px-4 pt-4 pb-6 md:px-6 md:pt-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/trips/${tripId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Add Expense</h1>
          <p className="text-muted-foreground text-sm">
            Record a cost for this trip
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue>
                          {(v: string | null) => v ? (CATEGORIES.find(c => c.value === v)?.label ?? v) : "Select category"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amountRupees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="500"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.valueAsNumber || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue>
                          {(v: string | null) => v ? (PAYMENT_METHODS.find(m => m.value === v)?.label ?? v) : "Select method"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numPeople"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>People sharing</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.valueAsNumber || 1)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Wallet selector when payment is WALLET */}
          {paymentMethod === "WALLET" && wallets.length > 0 && (
            <FormField
              control={form.control}
              name="walletId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pay from Wallet *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                          <SelectValue>
                            {(v: string | null) => {
                              if (!v) return "Select wallet";
                              const w = wallets.find(x => x.id === v);
                              return w ? `${w.name} — ${formatRupees(w.balancePaise)}` : v;
                            }}
                          </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wallets.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name} — {formatRupees(w.balancePaise)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="vendorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor / Restaurant</FormLabel>
                  <FormControl>
                    <Input placeholder="Hotel Sunrise" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {segments.length > 0 && (
              <FormField
                control={form.control}
                name="segmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link to Segment</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                              <SelectValue>
                                {(v: string | null) => {
                                  if (!v) return "Optional";
                                  const idx = segments.findIndex(s => s.id === v);
                                  const s = segments[idx];
                                  return s ? `#${idx + 1} ${s.fromLocation}${s.toLocation ? ` → ${s.toLocation}` : ""}` : v;
                                }}
                              </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {segments.map((s, i) => (
                          <SelectItem key={s.id} value={s.id}>
                            #{i + 1} {s.fromLocation}
                            {s.toLocation ? ` → ${s.toLocation}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Category-specific fields */}
          {category === "STAY" && (
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="checkInDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="checkOutDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-out Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numNights"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nights</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="2"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? e.target.valueAsNumber : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roomType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Deluxe Double" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {category === "FUEL" && (
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="litresAdded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Litres Added</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="20"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? e.target.valueAsNumber : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fuelStationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Station</FormLabel>
                    <FormControl>
                      <Input placeholder="HP Petrol Pump" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {category === "CHARGING" && (
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="kwhAdded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>kWh Added</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="20"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? e.target.valueAsNumber : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="chargerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Charger / Station</FormLabel>
                    <FormControl>
                      <Input placeholder="Tata Power EV" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {category === "TOLL" && (
            <FormField
              control={form.control}
              name="tollName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Toll Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Tumkur Toll" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {category === "TRANSPORT" && (
            <FormField
              control={form.control}
              name="ticketRef"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket / Booking Ref</FormLabel>
                  <FormControl>
                    <Input placeholder="IRCTC booking ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description / Note</FormLabel>
                <FormControl>
                  <Input placeholder="Optional note" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/trips/${tripId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                "Adding..."
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" /> Add Expense
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
