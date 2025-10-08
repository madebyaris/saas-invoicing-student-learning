import {
  Bell,
  Home,
  LineChart,
  Package2,
  FileText,
  CreditCard,
  Users,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

export function Sidebar() {
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="">SaaS Invoicing</span>
          </Link>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              activeProps={{ className: "bg-muted text-primary" }}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/dashboard/invoices"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              activeProps={{ className: "bg-muted text-primary" }}
            >
              <FileText className="h-4 w-4" />
              Invoices
              <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                6
              </Badge>
            </Link>
            <Link
              to="/dashboard/clients"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              activeProps={{ className: "bg-muted text-primary" }}
            >
              <Users className="h-4 w-4" />
              Clients
            </Link>
            <Link
              to="/dashboard/payments"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              activeProps={{ className: "bg-muted text-primary" }}
            >
              <CreditCard className="h-4 w-4" />
              Payments
            </Link>
            <Link
              to="/dashboard/analytics"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              activeProps={{ className: "bg-muted text-primary" }}
            >
              <LineChart className="h-4 w-4" />
              Analytics
            </Link>
            <Link
              to="/dashboard/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              activeProps={{ className: "bg-muted text-primary" }}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Card>
            <CardHeader className="p-2 pt-0 md:p-4">
              <CardTitle>Upgrade to Pro</CardTitle>
              <CardDescription>
                Unlock all features and get unlimited access to our support
                team.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
              <Button size="sm" className="w-full">
                Upgrade
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
