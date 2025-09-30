"use client"

import { useTransactions } from "@/hooks/use-transactions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, ArrowDownRight, ArrowUpRight } from "lucide-react"
import { useState } from "react"

export function TransactionList() {
  const { transactions, deleteTransaction } = useTransactions()
  const [showAll, setShowAll] = useState(false)

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const displayedTransactions = showAll ? sortedTransactions : sortedTransactions.slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest spending activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`p-2 rounded-lg ${transaction.type === "debit" ? "bg-destructive/10" : "bg-green-600/10"}`}
                >
                  {transaction.type === "debit" ? (
                    <ArrowDownRight className="w-4 h-4 text-destructive" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{transaction.merchant}</p>
                    <Badge variant="secondary" className="text-xs">
                      {transaction.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.type === "debit" ? "text-destructive" : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {transaction.type === "debit" ? "-" : "+"}₹
                    {transaction.amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </p>
                  {transaction.balance && (
                    <p className="text-xs text-muted-foreground">Bal: ₹{transaction.balance.toLocaleString("en-IN")}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 text-muted-foreground hover:text-destructive"
                onClick={() => deleteTransaction(transaction.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        {transactions.length > 10 && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Show Less" : `Show All (${transactions.length} transactions)`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
