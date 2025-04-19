"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

interface ChatWindowProps {
  conversationId: string
  currentUserId: string | undefined
}

export function ChatWindow({ conversationId, currentUserId }: ChatWindowProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [otherUser, setOtherUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!conversationId || !currentUserId) return

    const fetchConversationData = async () => {
      try {
        // Get conversation details
        const conversationDoc = await getDoc(doc(db, "conversations", conversationId))
        if (!conversationDoc.exists()) return

        const conversationData = conversationDoc.data()

        // Get the other participant's ID
        const otherParticipantId = conversationData.participants.find((id: string) => id !== currentUserId)

        // Get the other participant's details
        const userDoc = await getDoc(doc(db, "users", otherParticipantId))
        if (userDoc.exists()) {
          setOtherUser(userDoc.data())
        }
      } catch (error) {
        console.error("Error fetching conversation data:", error)
      }
    }

    fetchConversationData()

    // Subscribe to messages
    const messagesQuery = query(
      collection(db, "messages"),
      where("conversationId", "==", conversationId),
      orderBy("timestamp", "asc"),
    )

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toISOString(),
      }))

      setMessages(messagesList)
      setIsLoading(false)

      // Scroll to bottom on new messages
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    })

    return () => unsubscribe()
  }, [conversationId, currentUserId])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || !currentUserId || !conversationId) return

    try {
      // Add message to Firestore
      await addDoc(collection(db, "messages"), {
        conversationId,
        senderId: currentUserId,
        text: message,
        timestamp: serverTimestamp(),
      })

      // Update conversation with last message
      await updateDoc(doc(db, "conversations", conversationId), {
        lastMessage: message,
        lastMessageTime: serverTimestamp(),
      })

      // Clear input
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col rounded-lg border">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="h-10 w-10 animate-pulse rounded-full bg-muted"></div>
          <div className="h-5 w-32 animate-pulse rounded bg-muted"></div>
        </div>
        <div className="flex-1"></div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-lg border">
      <div className="flex items-center gap-3 border-b p-4">
        <Avatar>
          <AvatarImage src={otherUser?.profileImageUrl || "/placeholder.svg"} alt={otherUser?.name} />
          <AvatarFallback>{getInitials(otherUser?.name || "User")}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{otherUser?.name}</p>
          <p className="text-sm text-muted-foreground">{otherUser?.location}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground">Send a message to start the conversation</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isSentByCurrentUser = msg.senderId === currentUserId

              return (
                <div key={msg.id} className={`flex ${isSentByCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isSentByCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p
                      className={`text-right text-xs ${
                        isSentByCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Sending..."}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="flex items-center gap-2 border-t p-4">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!message.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
