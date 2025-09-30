import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">SpendWise</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost">Dashboard</Button>
            <Button variant="ghost">Analytics</Button>
            <Button variant="ghost">Settings</Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
