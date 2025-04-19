import Link from "next/link"
import { ArrowRight, MessageSquare, Search, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardOverviewProps {
  userData: any
}

export function DashboardOverview({ userData }: DashboardOverviewProps) {
  const isHelpSeeker = userData?.role === "help-seeker"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome, {userData?.name || "User"}</h1>
        <p className="text-muted-foreground">
          {isHelpSeeker
            ? "Find donors who can support your cause"
            : "Discover people and organizations that need your help"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Profile</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData?.name}</div>
            <p className="text-xs text-muted-foreground">{userData?.location || "No location set"}</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/profile" className="w-full">
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Find {isHelpSeeker ? "Donors" : "Help Seekers"}</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Search</div>
            <p className="text-xs text-muted-foreground">
              {isHelpSeeker
                ? "Find donors who can support your cause"
                : "Discover people and organizations that need your help"}
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/search" className="w-full">
              <Button variant="outline" className="w-full">
                Search Now
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Chat</div>
            <p className="text-xs text-muted-foreground">Connect and communicate with others</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/messages" className="w-full">
              <Button variant="outline" className="w-full">
                View Messages
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/dashboard/search">
            <Button variant="default" className="w-full justify-between">
              Find {isHelpSeeker ? "Donors" : "Help Seekers"} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard/messages">
            <Button variant="outline" className="w-full justify-between">
              View Messages <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
