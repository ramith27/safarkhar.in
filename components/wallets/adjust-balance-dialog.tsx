"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { adjustWalletBalance } from "@/lib/actions/wallets";
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
import { Button } from "@/components/ui/button";
import { paisaToRupees } from "@/lib/utils/format";

const schema = z.object({
  newBalanceRupees: z.coerce.number().min(0, "Balance cannot be negative"),
  description: z.string().optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

interface AdjustBalanceDialogProps {
  open: boolean;
  onClose: () => void;
  walletId: string;
  walletName: string;
  currentBalancePaise: number;
}

export function AdjustBalanceDialog({
  open,
  onClose,
  walletId,
  walletName,
  currentBalancePaise,
}: AdjustBalanceDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: { newBalanceRupees: 0, description: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        newBalanceRupees: parseFloat(paisaToRupees(currentBalancePaise)),
        description: "",
      });
    }
  }, [open, currentBalancePaise, form]);

  async function onSubmit(data: FormValues) {
    const result = await adjustWalletBalance(walletId, data);
    if (result.success) {
      toast.success("Balance adjusted");
      onClose();
    } else {
      toast.error(result.error ?? "Failed to adjust balance");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust Balance — {walletName}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newBalanceRupees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Balance (₹) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Correction / reconciliation" {...field} />
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
                {form.formState.isSubmitting ? "Saving..." : "Set Balance"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
