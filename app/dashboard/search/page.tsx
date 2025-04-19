"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Search } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { UserCard } from "@/components/user-card"

const CAUSE_TYPES = [
  { id: "all", label: "All Causes" },
  { id: "education", label: "Education" },
  { id: "healthcare", label: "Healthcare" },
  { id: "food", label: "Food & Nutrition" },
  { id: "shelter", label: "Shelter & Housing" },
  { id: "clothing", label: "Clothing" },
  { id: "elderly", label: "Elderly Care" },
  { id: "children", label: "Children's Welfare" },
  { id: "disabilities", label: "Disabilities Support" },
  { id: "environment", label: "Environment" },
  { id: "animals", label: "Animal Welfare" },
]

export default function SearchPage() {
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLocation, setSearchLocation] = useState("")
  const [searchCause, setSearchCause] = useState("all")
  const [isSearching, setIsSearching] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    const fetchUserData = async () => {
      if (!user) return

      try {
        const userDoc = await getDocs(query(collection(db, "users"), where("email", "==", user.email)))
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data()
          setUserData(userData)

          // If profile is not complete, redirect to profile setup
          if (!userData.profileComplete) {
            router.push("/profile/setup")
            return
          }

          // Initial search based on user's role
          performSearch()
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [user, loading, router])

  const performSearch = async () => {
    if (!userData) return

    setIsSearching(true)

    try {
      // Search for users with opposite role
      const oppositeRole = userData.role === "donor" ? "help-seeker" : "donor"

      const searchQuery = query(
        collection(db, "users"),
        where("role", "==", oppositeRole),
        where("profileComplete", "==", true),
      )

      const querySnapshot = await getDocs(searchQuery)
      let results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Filter by location if provided
      if (searchLocation.trim()) {
        const locationLower = searchLocation.toLowerCase()
        results = results.filter((result) => result.location && result.location.toLowerCase().includes(locationLower))
      }

      // Filter by cause if selected
      if (searchCause !== "all") {
        results = results.filter((result) => result.causes && result.causes.includes(searchCause))
      }

      setSearchResults(results)
    } catch (error) {
      console.error("Error performing search:", error)
    } finally {
      setIsSearching(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Find {userData?.role === "donor" ? "Help Seekers" : "Donors"}
          </h1>
          <p className="text-muted-foreground">
            Search for{" "}
            {userData?.role === "donor"
              ? "people or organizations that need your help"
              : "donors who can support your cause"}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, State, Country"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cause">Cause</Label>
              <Select value={searchCause} onValueChange={setSearchCause}>
                <SelectTrigger id="cause">
                  <SelectValue placeholder="Select a cause" />
                </SelectTrigger>
                <SelectContent>
                  {CAUSE_TYPES.map((cause) => (
                    <SelectItem key={cause.id} value={cause.id}>
                      {cause.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={performSearch} disabled={isSearching} className="w-full gap-2">
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {searchResults.length} {searchResults.length === 1 ? "Result" : "Results"} Found
          </h2>

          {searchResults.length === 0 ? (
            <div className="rounded-lg border p-8 text-center">
              <p className="text-muted-foreground">No matches found. Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((result) => (
                <UserCard key={result.id} user={result} currentUserId={user?.uid} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
