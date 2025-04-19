import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Heart, MapPin, MessageSquare, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500" />
            <span className="text-xl font-bold">Maadhyam</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-rose-50 to-indigo-50 py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-2 md:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Connecting <span className="text-rose-500">Donors</span> with{" "}
                  <span className="text-indigo-500">Help Seekers</span>
                </h1>
                <p className="text-lg text-gray-600">
                  Maadhyam is a platform that bridges the gap between those who want to help and those in need, based on
                  location and cause.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="gap-2">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#how-it-works">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="/placeholder.svg?height=400&width=400"
                  alt="Maadhyam Platform Illustration"
                  className="rounded-lg shadow-lg"
                  width={400}
                  height={400}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16" id="how-it-works">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">How Maadhyam Works</h2>
              <p className="mt-4 text-gray-600">Our platform makes it easy to connect and make a difference</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center rounded-lg border p-6 text-center shadow-sm">
                <div className="mb-4 rounded-full bg-rose-100 p-3">
                  <Users className="h-6 w-6 text-rose-500" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Create Your Profile</h3>
                <p className="text-gray-600">
                  Sign up as a donor or help seeker and complete your profile with your location and causes.
                </p>
              </div>
              <div className="flex flex-col items-center rounded-lg border p-6 text-center shadow-sm">
                <div className="mb-4 rounded-full bg-indigo-100 p-3">
                  <MapPin className="h-6 w-6 text-indigo-500" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Find Matches</h3>
                <p className="text-gray-600">
                  Search for donors or help seekers based on location and causes you care about.
                </p>
              </div>
              <div className="flex flex-col items-center rounded-lg border p-6 text-center shadow-sm">
                <div className="mb-4 rounded-full bg-emerald-100 p-3">
                  <MessageSquare className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Connect & Communicate</h3>
                <p className="text-gray-600">
                  Use our real-time chat system to communicate and coordinate your support efforts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">Ready to Make a Difference?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Join Maadhyam today and be part of a community dedicated to helping those in need.
            </p>
            <div className="mt-8">
              <Link href="/signup">
                <Button size="lg">Sign Up Now</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              <span className="font-semibold">Maadhyam</span>
            </div>
            <div className="text-sm text-gray-500">© {new Date().getFullYear()} Maadhyam. All rights reserved.</div>
            <div className="flex gap-4">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
