"use client"

import { useTransactions } from "@/hooks/use-transactions"
import { Card, CardContent } from "@/components/ui/card"
import { SpendingChart } from "@/components/spending-chart"
import { CategoryChart } from "@/components/category-chart"
import { TransactionList } from "@/components/transaction-list"
import { StatsCards } from "@/components/stats-cards"
import { MonthlyChart } from "@/components/monthly-chart"
import { AiInsights } from "@/components/ai-insights"
import { SpendingTrends } from "@/components/spending-trends"

export function SpendingDashboard() {
  const { transactions, isLoading } = useTransactions()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading transactions...</div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            No transactions yet. Add your bank SMS messages above to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <StatsCards />

      <SpendingTrends />

      <AiInsights />

      <div className="grid gap-6 md:grid-cols-2">
        <SpendingChart />
        <CategoryChart />
      </div>

      <MonthlyChart />

      <TransactionList />
    </div>
  )
}
