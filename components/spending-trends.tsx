"use client"

import { useTransactions } from "@/hooks/use-transactions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Calendar, CreditCard } from "lucide-react"
import { storage } from "@/lib/storage"

export function SpendingTrends() {
  const { transactions } = useTransactions()

  if (transactions.length === 0) return null

  const monthlySpending = storage.getMonthlySpending()
  const months = Object.keys(monthlySpending).sort()

  let trend = "stable"
  let trendPercentage = 0

  if (months.length >= 2) {
    const currentMonth = monthlySpending[months[months.length - 1]]
    const previousMonth = monthlySpending[months[months.length - 2]]
    trendPercentage = ((currentMonth - previousMonth) / previousMonth) * 100

    if (trendPercentage > 5) trend = "up"
    else if (trendPercentage < -5) trend = "down"
  }

  const categorySpending = storage.getSpendingByCategory()
  const topCategories = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  const avgTransactionAmount =
    transactions.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0) /
    transactions.filter((t) => t.type === "debit").length

  const trends = [
    {
      title: "Monthly Trend",
      value:
        trend === "up"
          ? `+${trendPercentage.toFixed(1)}%`
          : trend === "down"
            ? `${trendPercentage.toFixed(1)}%`
            : "Stable",
      description: trend === "up" ? "Spending increased" : trend === "down" ? "Spending decreased" : "No major change",
      icon: trend === "up" ? TrendingUp : TrendingDown,
      color:
        trend === "up"
          ? "text-destructive"
          : trend === "down"
            ? "text-green-600 dark:text-green-400"
            : "text-muted-foreground",
      bgColor: trend === "up" ? "bg-destructive/10" : trend === "down" ? "bg-green-600/10" : "bg-muted",
    },
    {
      title: "Top Category",
      value: topCategories[0]?.[0]?.charAt(0).toUpperCase() + topCategories[0]?.[0]?.slice(1) || "N/A",
      description: `₹${topCategories[0]?.[1]?.toLocaleString("en-IN") || 0} spent`,
      icon: CreditCard,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Avg Transaction",
      value: `₹${avgTransactionAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      description: "Per transaction",
      icon: Calendar,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {trends.map((trend) => (
        <Card key={trend.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{trend.title}</CardTitle>
            <div className={`p-2 rounded-lg ${trend.bgColor}`}>
              <trend.icon className={`w-4 h-4 ${trend.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${trend.color}`}>{trend.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{trend.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
