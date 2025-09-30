"use client"

import { useState, useEffect } from "react"
import { storage, type Transaction } from "@/lib/storage"

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadTransactions = () => {
    setIsLoading(true)
    const data = storage.getTransactions()
    setTransactions(data)
    setIsLoading(false)
  }

  useEffect(() => {
    loadTransactions()

    const handleUpdate = () => {
      loadTransactions()
    }

    window.addEventListener("transactionsUpdated", handleUpdate)
    return () => window.removeEventListener("transactionsUpdated", handleUpdate)
  }, [])

  const deleteTransaction = (id: string) => {
    storage.deleteTransaction(id)
    loadTransactions()
    window.dispatchEvent(new CustomEvent("transactionsUpdated"))
  }

  const clearAll = () => {
    storage.clearAllTransactions()
    loadTransactions()
    window.dispatchEvent(new CustomEvent("transactionsUpdated"))
  }

  return {
    transactions,
    isLoading,
    deleteTransaction,
    clearAll,
    refresh: loadTransactions,
  }
}
