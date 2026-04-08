"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { walletSchema, WalletFormValues } from "@/lib/validations/wallet";
import { createWallet, updateWallet } from "@/lib/actions/wallets";
import { Wallet } from "@/lib/db/schema";
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

const WALLET_TYPES = [
  { value: "GENERAL", label: "General" },
  { value: "FASTAG", label: "FASTag" },
  { value: "EV_CHARGER", label: "EV Charger Wallet" },
  { value: "FUEL_CARD", label: "Fuel Card" },
  { value: "TRAVEL_CARD", label: "Travel Card" },
  { value: "AIRLINE_WALLET", label: "Airline Wallet" },
  { value: "TRAIN_WALLET", label: "Train Wallet" },
  { value: "TAXI_WALLET", label: "Taxi Wallet" },
];

interface WalletDialogProps {
  open: boolean;
  onClose: () => void;
  wallet?: Wallet | null;
}

export function WalletDialog({ open, onClose, wallet }: WalletDialogProps) {
  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema) as never,
    defaultValues: { name: "", type: "GENERAL", vehicleId: "" },
  });

  useEffect(() => {
    if (wallet) {
      form.reset({
        name: wallet.name,
        type: wallet.type,
        vehicleId: wallet.vehicleId ?? "",
      });
    } else {
      form.reset({ name: "", type: "GENERAL", vehicleId: "" });
    }
  }, [wallet, form]);

  async function onSubmit(data: WalletFormValues) {
    const result = wallet
      ? await updateWallet(wallet.id, data)
      : await createWallet(data);
    if (result.success) {
      toast.success(wallet ? "Wallet updated" : "Wallet created");
      onClose();
    } else {
      toast.error(result.error ?? "Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{wallet ? "Edit Wallet" : "Create Wallet"}</DialogTitle>
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
                    <Input placeholder="My FASTag" {...field} />
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
                          {(v: string | null) => v ? (WALLET_TYPES.find(t => t.value === v)?.label ?? v) : "Select type"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {WALLET_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Saving..."
                  : wallet
                  ? "Save Changes"
                  : "Create Wallet"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
