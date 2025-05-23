import { Skeleton } from "@/components/ui/skeleton"
import DashboardLayout from "@/components/dashboard-layout"

export default function BusinessIntelligenceLoading() {
  return (
    <DashboardLayout role="supplier">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Business Intelligence Dashboard</h2>
            <p className="text-muted-foreground">Advanced analytics and insights for your business</p>
          </div>
        </div>

        <div className="grid gap-4">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
