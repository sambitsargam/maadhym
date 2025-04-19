"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import DashboardLayout from "@/components/dashboard-layout"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ChatList } from "@/components/chat-list"
import { ChatWindow } from "@/components/chat-window"

export default function MessagesPage() {
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
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

          // Fetch conversations
          fetchConversations(user.uid)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [user, loading, router])

  const fetchConversations = async (userId: string) => {
    try {
      const conversationsQuery = query(collection(db, "conversations"), where("participants", "array-contains", userId))

      const querySnapshot = await getDocs(conversationsQuery)
      const conversationsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setConversations(conversationsData)

      // Select the first conversation by default if available
      if (conversationsData.length > 0 && !selectedConversation) {
        setSelectedConversation(conversationsData[0].id)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
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
      <div className="flex h-[calc(100vh-10rem)] flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="w-full md:w-1/3">
          <ChatList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            currentUserId={user?.uid}
          />
        </div>

        <div className="flex-1">
          {selectedConversation ? (
            <ChatWindow conversationId={selectedConversation} currentUserId={user?.uid} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border">
              <p className="text-muted-foreground">Select a conversation or start a new one</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
