"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface ChatListProps {
  conversations: any[]
  selectedConversation: string | null
  onSelectConversation: (id: string) => void
  currentUserId: string | undefined
}

export function ChatList({ conversations, selectedConversation, onSelectConversation, currentUserId }: ChatListProps) {
  const [conversationDetails, setConversationDetails] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const conversationId = searchParams.get("conversation")
    if (conversationId) {
      onSelectConversation(conversationId)
    }
  }, [searchParams, onSelectConversation])

  useEffect(() => {
    const fetchConversationDetails = async () => {
      if (!conversations.length || !currentUserId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const detailsPromises = conversations.map(async (conversation) => {
          // Get the other participant's ID
          const otherParticipantId = conversation.participants.find((id: string) => id !== currentUserId)

          // Get the other participant's details
          const userDoc = await getDoc(doc(db, "users", otherParticipantId))
          const userData = userDoc.exists() ? userDoc.data() : null

          return {
            ...conversation,
            otherParticipant: userData,
          }
        })

        const details = await Promise.all(detailsPromises)
        setConversationDetails(details)
      } catch (error) {
        console.error("Error fetching conversation details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversationDetails()
  }, [conversations, currentUserId])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (conversationDetails.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border p-4 text-center">
        <p className="text-muted-foreground">No conversations yet</p>
        <p className="text-sm text-muted-foreground">Start a chat with someone from the search page</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto rounded-lg border">
      <div className="p-4">
        <h2 className="font-semibold">Messages</h2>
      </div>
      <div className="divide-y">
        {conversationDetails.map((conversation) => (
          <button
            key={conversation.id}
            className={`flex w-full items-center gap-3 p-4 text-left hover:bg-accent ${
              selectedConversation === conversation.id ? "bg-accent" : ""
            }`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <Avatar>
              <AvatarImage
                src={conversation.otherParticipant?.profileImageUrl || "/placeholder.svg"}
                alt={conversation.otherParticipant?.name}
              />
              <AvatarFallback>{getInitials(conversation.otherParticipant?.name || "User")}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="font-medium">{conversation.otherParticipant?.name || "User"}</p>
              <p className="truncate text-sm text-muted-foreground">{conversation.lastMessage || "No messages yet"}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
