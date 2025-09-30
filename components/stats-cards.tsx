"use client"

import { useTransactions } from "@/hooks/use-transactions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, TrendingDown, Wallet } from "lucide-react"
import { storage } from "@/lib/storage"

export function StatsCards() {
  const { transactions } = useTransactions()

  const totalDebit = storage.getTotalSpending("debit")
  const totalCredit = storage.getTotalSpending("credit")
  const netBalance = totalCredit - totalDebit
  const transactionCount = transactions.length

  const stats = [
    {
      title: "Total Spent",
      value: `₹${totalDebit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
      icon: ArrowDownRight,
      iconColor: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Total Received",
      value: `₹${totalCredit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
      icon: ArrowUpRight,
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-600/10",
    },
    {
      title: "Net Balance",
      value: `₹${netBalance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
      icon: Wallet,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Transactions",
      value: transactionCount.toString(),
      icon: TrendingDown,
      iconColor: "text-accent",
      bgColor: "bg-accent/10",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
