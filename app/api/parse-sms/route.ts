import { z } from "zod"

const transactionSchema = z.object({
  transactions: z.array(
    z.object({
      amount: z.number().describe("Transaction amount in the currency"),
      type: z.enum(["debit", "credit"]).describe("Whether money was debited or credited"),
      merchant: z.string().describe("Merchant or payee name"),
      date: z.string().describe("Transaction date in ISO format"),
      accountNumber: z.string().optional().describe("Last 4 digits of account number"),
      balance: z.number().optional().describe("Available balance after transaction"),
      category: z
        .enum([
          "food",
          "shopping",
          "transport",
          "entertainment",
          "bills",
          "healthcare",
          "education",
          "transfer",
          "other",
        ])
        .describe("Transaction category"),
    }),
  ),
})

export async function POST(req: Request) {
  try {
    const { smsText } = await req.json()

    if (!smsText || typeof smsText !== "string") {
      return Response.json({ error: "SMS text is required" }, { status: 400 })
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
                  text: `You are a financial transaction parser. Extract all transaction details from bank SMS messages and return them in JSON format.

The response must be a JSON object with a "transactions" array. Each transaction should have:
- amount (number): Transaction amount
- type (string): "debit" or "credit"
- merchant (string): Merchant or payee name
- date (string): Transaction date in ISO format
- accountNumber (string, optional): Last 4 digits of account number
- balance (number, optional): Available balance after transaction
- category (string): One of: food, shopping, transport, entertainment, bills, healthcare, education, transfer, other

Common patterns:
- Debited/Credited indicates transaction type
- Amount is usually prefixed with Rs., INR, or currency symbol
- Date formats vary (DD-MMM-YY, DD/MM/YYYY, etc.)
- Merchant name usually follows "at" or "to"
- Account numbers are often masked (XX1234)
- Balance is mentioned as "Avl Bal", "Available Balance", etc.

Extract all transactions from these SMS messages:

${smsText}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
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
    const validated = transactionSchema.parse(parsed)

    return Response.json(validated)
  } catch (error) {
    console.error("[v0] Error parsing SMS:", error)
    return Response.json({ error: "Failed to parse SMS messages" }, { status: 500 })
  }
}
