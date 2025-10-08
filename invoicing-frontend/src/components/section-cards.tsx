import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardsProps {
  data?: {
    totalRevenue: number;
    newCustomers: number;
    activeInvoices: number;
    growthRate: number;
    revenueChange: number;
    customersChange: number;
    invoicesChange: number;
    growthChange: number;
  };
}

export function SectionCards({ data }: SectionCardsProps) {
  // Default mock data for development
  const stats = data || {
    totalRevenue: 125000,
    newCustomers: 124,
    activeInvoices: 456,
    growthRate: 12.5,
    revenueChange: 12.5,
    customersChange: -8.2,
    invoicesChange: 15.3,
    growthChange: 4.5,
  };

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            ${stats.totalRevenue.toLocaleString()}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              {stats.revenueChange > 0 ? (
                <TrendingUpIcon className="size-3" />
              ) : (
                <TrendingDownIcon className="size-3" />
              )}
              {stats.revenueChange > 0 ? '+' : ''}{stats.revenueChange}%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.revenueChange > 0 ? 'Revenue up this month' : 'Revenue down this month'} 
            {stats.revenueChange > 0 ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Monthly recurring revenue
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>New Clients</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.newCustomers}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              {stats.customersChange > 0 ? (
                <TrendingUpIcon className="size-3" />
              ) : (
                <TrendingDownIcon className="size-3" />
              )}
              {stats.customersChange > 0 ? '+' : ''}{stats.customersChange}%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.customersChange > 0 ? 'Growing client base' : 'Client acquisition needs focus'}
            {stats.customersChange > 0 ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            New clients this month
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Active Invoices</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.activeInvoices}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              {stats.invoicesChange > 0 ? (
                <TrendingUpIcon className="size-3" />
              ) : (
                <TrendingDownIcon className="size-3" />
              )}
              {stats.invoicesChange > 0 ? '+' : ''}{stats.invoicesChange}%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.invoicesChange > 0 ? 'Invoice volume up' : 'Invoice volume down'}
            {stats.invoicesChange > 0 ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Active invoices this month
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.growthRate}%
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              {stats.growthChange > 0 ? (
                <TrendingUpIcon className="size-3" />
              ) : (
                <TrendingDownIcon className="size-3" />
              )}
              {stats.growthChange > 0 ? '+' : ''}{stats.growthChange}%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.growthChange > 0 ? 'Strong growth trend' : 'Growth needs attention'}
            {stats.growthChange > 0 ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Month-over-month growth
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
