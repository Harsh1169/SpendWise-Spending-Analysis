import { SmsInput } from "@/components/sms-input"
import { DashboardHeader } from "@/components/dashboard-header"
import { SpendingDashboard } from "@/components/spending-dashboard"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-balance">
                Track Your Spending with <span className="text-primary">AI</span>
              </h1>
              <p className="text-lg text-muted-foreground text-pretty">
                Paste your bank SMS messages and let AI analyze your spending patterns
              </p>
            </div>
            <SmsInput />
          </div>

          <SpendingDashboard />
        </div>
      </main>
    </div>
  )
}
