"use client"

import { useTransactions } from "@/hooks/use-transactions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Cell, Pie, PieChart } from "recharts"
import { storage } from "@/lib/storage"

const CATEGORY_COLORS: Record<string, string> = {
  food: "hsl(var(--chart-1))",
  shopping: "hsl(var(--chart-2))",
  transport: "hsl(var(--chart-3))",
  entertainment: "hsl(var(--chart-4))",
  bills: "hsl(var(--chart-5))",
  healthcare: "hsl(var(--destructive))",
  education: "hsl(var(--primary))",
  transfer: "hsl(var(--accent))",
  other: "hsl(var(--muted-foreground))",
}

export function CategoryChart() {
  const { transactions } = useTransactions()

  const spendingByCategory = storage.getSpendingByCategory()
  const chartData = Object.entries(spendingByCategory).map(([category, amount]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    amount,
    fill: CATEGORY_COLORS[category] || CATEGORY_COLORS.other,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>Breakdown of your expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={Object.fromEntries(
            Object.keys(CATEGORY_COLORS).map((cat) => [
              cat,
              {
                label: cat.charAt(0).toUpperCase() + cat.slice(1),
                color: CATEGORY_COLORS[cat],
              },
            ]),
          )}
          className="h-[300px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie data={chartData} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={100} label>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
