export interface Transaction {
  id: string
  amount: number
  type: "debit" | "credit"
  merchant: string
  date: string
  accountNumber?: string
  balance?: number
  category: string
  createdAt: string
}

const STORAGE_KEY = "spendwise_transactions"

export const storage = {
  getTransactions(): Transaction[] {
    if (typeof window === "undefined") return []
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("[v0] Error reading transactions:", error)
      return []
    }
  },

  addTransactions(transactions: Omit<Transaction, "id" | "createdAt">[]): Transaction[] {
    const existing = this.getTransactions()
    const newTransactions: Transaction[] = transactions.map((t) => ({
      ...t,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }))

    const all = [...existing, ...newTransactions]
    this.saveTransactions(all)
    return newTransactions
  },

  deleteTransaction(id: string): void {
    const transactions = this.getTransactions().filter((t) => t.id !== id)
    this.saveTransactions(transactions)
  },

  clearAllTransactions(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  },

  saveTransactions(transactions: Transaction[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
    }
  },

  getTransactionsByDateRange(startDate: Date, endDate: Date): Transaction[] {
    return this.getTransactions().filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  },

  getTransactionsByCategory(category: string): Transaction[] {
    return this.getTransactions().filter((t) => t.category === category)
  },

  getTotalSpending(type: "debit" | "credit" = "debit"): number {
    return this.getTransactions()
      .filter((t) => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0)
  },

  getSpendingByCategory(): Record<string, number> {
    const transactions = this.getTransactions().filter((t) => t.type === "debit")
    return transactions.reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>,
    )
  },

  getSpendingByDate(): Record<string, number> {
    const transactions = this.getTransactions().filter((t) => t.type === "debit")
    return transactions.reduce(
      (acc, t) => {
        const date = new Date(t.date).toISOString().split("T")[0]
        acc[date] = (acc[date] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>,
    )
  },

  getMonthlySpending(): Record<string, number> {
    const transactions = this.getTransactions().filter((t) => t.type === "debit")
    return transactions.reduce(
      (acc, t) => {
        const date = new Date(t.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        acc[monthKey] = (acc[monthKey] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>,
    )
  },
}
