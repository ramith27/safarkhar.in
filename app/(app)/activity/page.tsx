import { getAllWalletTransactions } from "@/lib/actions/wallets";
import { formatRupees } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Receipt, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default async function ActivityPage() {
  const transactions = await getAllWalletTransactions();

  return (
    <div className="px-4 pt-4 pb-6 md:px-6 md:pt-6 space-y-5 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          All wallet transactions — {transactions.length} record
          {transactions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Receipt className="h-12 w-12 mb-4 opacity-20" />
          <p className="font-medium">No transactions yet</p>
          <p className="text-sm mt-1">
            Transactions will appear here after top-ups and trip expenses
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-4 py-2.5 bg-muted/40 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <span className="w-6" />
            <span>Description</span>
            <span>Wallet</span>
            <span>Type</span>
            <span className="text-right w-24">Amount</span>
          </div>

          <div className="divide-y">
            {transactions.map((tx) => {
              const isCredit = tx.type === "CREDIT";
              const date = new Date(tx.createdAt);
              const dateStr = date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
              const timeStr = date.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div key={tx.id}>
                  {/* Mobile row */}
                  <div className="flex md:hidden items-center gap-3 px-4 py-3.5">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                        isCredit
                          ? "bg-emerald-100 dark:bg-emerald-950/50"
                          : "bg-red-100 dark:bg-red-950/50"
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft
                          className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                        />
                      ) : (
                        <ArrowUpRight
                          className="h-4 w-4 text-red-600 dark:text-red-400"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {tx.description ?? tx.referenceType.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(tx as { wallet?: { name: string } }).wallet?.name ?? "—"} · {dateStr}
                      </p>
                    </div>
                    <p
                      className={`font-semibold text-sm shrink-0 ${
                        isCredit
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isCredit ? "+" : "−"}
                      {formatRupees(Math.abs(tx.amountPaise))}
                    </p>
                  </div>

                  {/* Desktop row */}
                  <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        isCredit
                          ? "bg-emerald-100 dark:bg-emerald-950/50"
                          : "bg-red-100 dark:bg-red-950/50"
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {tx.description ?? tx.referenceType.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {dateStr} at {timeStr}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground w-36 truncate text-center">
                      {(tx as { wallet?: { name: string } }).wallet?.name ?? "—"}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-5 w-32 justify-center"
                    >
                      {tx.referenceType.replace(/_/g, " ")}
                    </Badge>
                    <p
                      className={`font-semibold text-sm w-24 text-right ${
                        isCredit
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isCredit ? "+" : "−"}
                      {formatRupees(Math.abs(tx.amountPaise))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
