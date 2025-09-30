"use client"

import { useTransactions } from "@/hooks/use-transactions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Lightbulb, AlertCircle } from "lucide-react"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Insight {
  title: string
  description: string
}

export function AiInsights() {
  const { transactions } = useTransactions()
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateInsights = async () => {
    if (transactions.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate insights")
      }

      const data = await response.json()
      setInsights(data.insights)
    } catch (err) {
      console.error("[v0] Error:", err)
      setError("Failed to generate insights. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (transactions.length === 0) {
    return null
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI-Powered Insights
        </CardTitle>
        <CardDescription>Get personalized recommendations based on your spending patterns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-6">
            <Button onClick={generateInsights} disabled={isLoading} className="gap-2">
              {isLoading ? (
                <>Analyzing...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <Alert key={index} className="border-l-4 border-l-primary">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <AlertTitle className="font-semibold">{insight.title}</AlertTitle>
                  <AlertDescription className="text-sm leading-relaxed">{insight.description}</AlertDescription>
                </Alert>
              ))}
            </div>
            <Button
              onClick={generateInsights}
              variant="outline"
              disabled={isLoading}
              className="w-full gap-2 bg-transparent"
            >
              {isLoading ? <>Regenerating...</> : <>Regenerate Insights</>}
            </Button>
          </>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
