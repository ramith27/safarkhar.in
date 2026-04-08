import {
  getOverallStats,
  getTopTrips,
  getAllCategorySpend,
  getMonthlySpend,
  getWalletBalanceSummary,
} from "@/lib/actions/reports";
import { formatRupees, expenseCategoryIcon, expenseCategoryLabel } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RechartsMonthlyChart } from "@/components/reports/recharts-monthly-chart";
import { RechartsCategoryChart } from "@/components/reports/recharts-category-chart";

export default async function ReportsPage() {
  const [stats, topTrips, categorySpend, monthlySpend, walletSummary] =
    await Promise.all([
      getOverallStats(),
      getTopTrips(),
      getAllCategorySpend(),
      getMonthlySpend(),
      getWalletBalanceSummary(),
    ]);

  return (
    <div className="px-4 pt-4 pb-6 md:px-6 md:pt-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Aggregated expense analytics
        </p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Completed Trips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.tripCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatRupees(stats?.totalSpendPaise ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Travellers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalPeople ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly spend chart */}
      {monthlySpend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Spend (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <RechartsMonthlyChart data={monthlySpend} />
          </CardContent>
        </Card>
      )}

      {/* Category breakdown */}
      {categorySpend.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Spend by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <RechartsCategoryChart data={categorySpend} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categorySpend.map((row) => (
                <div key={row.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{expenseCategoryIcon(row.category)}</span>
                    <span>{expenseCategoryLabel(row.category)}</span>
                    <span className="text-muted-foreground text-xs">
                      ({row.count} items)
                    </span>
                  </div>
                  <span className="font-semibold">{formatRupees(row.totalPaise)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top trips */}
      {topTrips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Trips by Spend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topTrips.map((trip, i) => (
              <div key={trip.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-muted-foreground font-mono text-xs w-5">
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{trip.title}</p>
                    <p className="text-xs text-muted-foreground">{trip.startDate}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="font-semibold">{formatRupees(trip.totalCostPaise)}</p>
                  {trip.numPeople > 1 && (
                    <p className="text-xs text-muted-foreground">
                      {formatRupees(Math.round(trip.totalCostPaise / trip.numPeople))} / person
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Wallet balances */}
      {walletSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Wallet Balances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {walletSummary.map((w) => (
              <div key={w.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{w.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {w.type.replace(/_/g, " ")}
                  </p>
                </div>
                <p className="font-semibold">{formatRupees(w.balancePaise)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
