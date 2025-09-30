"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { storage } from "@/lib/storage"

interface Transaction {
  amount: number
  type: "debit" | "credit"
  merchant: string
  date: string
  accountNumber?: string
  balance?: number
  category: string
}

export function SmsInput() {
  const [smsText, setSmsText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!smsText.trim()) return

    setIsProcessing(true)

    try {
      const response = await fetch("/api/parse-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smsText }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse SMS" }))
        throw new Error(errorData.error || "Failed to parse SMS")
      }

      const data = await response.json()
      console.log("[v0] Parsed transactions:", data)

      storage.addTransactions(data.transactions)

      toast({
        title: "Success!",
        description: `Parsed ${data.transactions.length} transaction${data.transactions.length !== 1 ? "s" : ""} successfully`,
      })

      setSmsText("")

      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent("transactionsUpdated"))
    } catch (error) {
      console.error("[v0] Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to parse SMS messages. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Add Bank Messages
        </CardTitle>
        <CardDescription>
          Paste your bank SMS messages below. Our AI will automatically extract transaction details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Example: Your A/c XX1234 debited with Rs.500.00 on 01-Jan-25 at AMAZON. Avl Bal: Rs.5000.00"
            value={smsText}
            onChange={(e) => setSmsText(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Supports multiple messages - paste them all at once</p>
            <Button type="submit" disabled={!smsText.trim() || isProcessing} className="gap-2">
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze with AI
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
