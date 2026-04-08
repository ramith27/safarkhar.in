"use client";

import { useState } from "react";
import { Wallet } from "@/lib/db/schema";
import { deleteWallet } from "@/lib/actions/wallets";
import { formatRupees } from "@/lib/utils/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { WalletDialog } from "./wallet-dialog";
import { TopUpDialog } from "./top-up-dialog";
import { AdjustBalanceDialog } from "./adjust-balance-dialog";
import { Plus, Wallet as WalletIcon } from "lucide-react";

interface WalletsClientProps {
  wallets: Wallet[];
}

export function WalletsClient({ wallets }: WalletsClientProps) {
  const [walletDialog, setWalletDialog] = useState(false);
  const [topUpDialog, setTopUpDialog] = useState(false);
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [topUpTarget, setTopUpTarget] = useState<Wallet | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<Wallet | null>(null);

  function openNew() {
    setEditingWallet(null);
    setWalletDialog(true);
  }

  function openEdit(w: Wallet) {
    setEditingWallet(w);
    setWalletDialog(true);
  }

  function openTopUp(w: Wallet) {
    setTopUpTarget(w);
    setTopUpDialog(true);
  }

  function openAdjust(w: Wallet) {
    setAdjustTarget(w);
    setAdjustDialog(true);
  }

  async function handleDelete(w: Wallet) {
    if (!confirm(`Delete "${w.name}"?`)) return;
    const result = await deleteWallet(w.id);
    if (result.success) toast.success("Wallet deleted");
    else toast.error("Failed to delete wallet");
  }

  const totalBalance = wallets.reduce((s, w) => s + w.balancePaise, 0);

  return (
    <div className="px-4 pt-4 pb-6 md:px-6 md:pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Wallets</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Total balance:{" "}
            <span className="font-semibold text-foreground">
              {formatRupees(totalBalance)}
            </span>
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Add Wallet
        </Button>
      </div>

      {wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <WalletIcon className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">No wallets yet</p>
          <p className="text-sm mt-1">
            Create a FASTag, fuel card, or travel wallet to track payments
          </p>
          <Button className="mt-4" onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" /> Add Wallet
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {wallets.map((w) => (
            <Card key={w.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{w.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {w.type === "FASTAG" ? "FASTag" :
                         w.type === "EV_CHARGER" ? "EV Charger" :
                         w.type === "FUEL_CARD" ? "Fuel Card" :
                         w.type === "TRAVEL_CARD" ? "Travel Card" :
                         w.type === "AIRLINE_WALLET" ? "Airline Wallet" :
                         w.type === "TRAIN_WALLET" ? "Train Wallet" :
                         w.type === "TAXI_WALLET" ? "Taxi Wallet" :
                         w.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold mt-2">
                      {formatRupees(w.balancePaise)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openTopUp(w)}
                    >
                      <PlusCircle className="h-3.5 w-3.5 mr-1" /> Top Up
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAdjust(w)}
                    >
                      Set Balance
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(w)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(w)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <WalletDialog
        open={walletDialog}
        onClose={() => { setWalletDialog(false); setEditingWallet(null); }}
        wallet={editingWallet}
      />
      {topUpTarget && (
        <TopUpDialog
          open={topUpDialog}
          onClose={() => { setTopUpDialog(false); setTopUpTarget(null); }}
          walletId={topUpTarget.id}
          walletName={topUpTarget.name}
        />
      )}
      {adjustTarget && (
        <AdjustBalanceDialog
          open={adjustDialog}
          onClose={() => { setAdjustDialog(false); setAdjustTarget(null); }}
          walletId={adjustTarget.id}
          walletName={adjustTarget.name}
          currentBalancePaise={adjustTarget.balancePaise}
        />
      )}
    </div>
  );
}
