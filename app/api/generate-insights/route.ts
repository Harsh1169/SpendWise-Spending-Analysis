export async function POST(req: Request) {
  try {
    const { transactions } = await req.json()

    if (!transactions || !Array.isArray(transactions)) {
      return Response.json({ error: "Transactions array is required" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json(
        {
          error: "GEMINI_API_KEY is not configured. Please add it in Project Settings → Environment Variables",
        },
        { status: 500 },
      )
    }

    const totalSpent = transactions.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0)

    const categorySpending = transactions
      .filter((t) => t.type === "debit")
      .reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>,
      )

    const topCategory = Object.entries(categorySpending).sort(([, a], [, b]) => b - a)[0]

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a financial advisor analyzing spending patterns. Generate 3-4 personalized insights and recommendations.

Return a JSON object with an "insights" array. Each insight should have:
- title (string): Brief insight title
- description (string): 2-3 sentence explanation with actionable advice

Analyze this spending data and provide insights:

Total Spent: ₹${totalSpent.toFixed(2)}
Number of Transactions: ${transactions.length}
Top Spending Category: ${topCategory?.[0] || "N/A"} (₹${topCategory?.[1]?.toFixed(2) || 0})
Category Breakdown: ${JSON.stringify(categorySpending)}

Provide actionable insights about:
1. Spending patterns and trends
2. Areas where they could save money
3. Budget recommendations
4. Positive spending habits to maintain`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error("[v0] Gemini API error:", errorData)

      if (response.status === 400) {
        return Response.json(
          {
            error: "Gemini API: Invalid request. Please check your API key and request format.",
          },
          { status: 400 },
        )
      }

      if (response.status === 401 || response.status === 403) {
        return Response.json(
          {
            error:
              "Gemini API: Invalid or missing API key. Please check your GEMINI_API_KEY in Project Settings. Get your key at https://aistudio.google.com/app/apikey",
          },
          { status: 401 },
        )
      }

      if (response.status === 429) {
        return Response.json(
          {
            error: "Gemini API: Rate limit exceeded. Please try again later.",
          },
          { status: 429 },
        )
      }

      const errorMessage = errorData?.error?.message || "Unknown error"
      return Response.json(
        {
          error: `Gemini API error: ${errorMessage}`,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
      return Response.json({ error: "No response from Gemini API" }, { status: 500 })
    }

    const parsed = JSON.parse(content)

    return Response.json(parsed)
  } catch (error) {
    console.error("[v0] Error generating insights:", error)
    return Response.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
