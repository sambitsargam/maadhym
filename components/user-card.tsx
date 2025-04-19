"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { addDoc, collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface UserCardProps {
  user: any
  currentUserId: string | undefined
}

export function UserCard({ user, currentUserId }: UserCardProps) {
  const [isStartingChat, setIsStartingChat] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleStartChat = async () => {
    if (!currentUserId) return

    setIsStartingChat(true)

    try {
      // Check if conversation already exists
      const conversationsQuery = query(
        collection(db, "conversations"),
        where("participants", "array-contains", currentUserId),
      )

      const querySnapshot = await getDocs(conversationsQuery)
      let existingConversation = null

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.participants.includes(user.id)) {
          existingConversation = { id: doc.id, ...data }
        }
      })

      if (existingConversation) {
        // Navigate to existing conversation
        router.push(`/dashboard/messages?conversation=${existingConversation.id}`)
      } else {
        // Create new conversation
        const newConversation = await addDoc(collection(db, "conversations"), {
          participants: [currentUserId, user.id],
          createdAt: new Date().toISOString(),
          lastMessage: null,
          lastMessageTime: null,
        })

        toast({
          title: "Chat started",
          description: `You can now chat with ${user.name}`,
        })

        router.push(`/dashboard/messages?conversation=${newConversation.id}`)
      }
    } catch (error) {
      console.error("Error starting chat:", error)
      toast({
        title: "Error starting chat",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsStartingChat(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Avatar className="h-14 w-14">
          <AvatarImage src={user.profileImageUrl || "/placeholder.svg"} alt={user.name} />
          <AvatarFallback>{getInitials(user.name || "User")}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.location}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 line-clamp-3 text-sm">{user.bio}</div>
        <div className="flex flex-wrap gap-2">
          {user.causes?.map((cause: string) => (
            <Badge key={cause} variant="secondary">
              {cause}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleStartChat} disabled={isStartingChat} className="w-full gap-2">
          <MessageSquare className="h-4 w-4" />
          {isStartingChat ? "Starting Chat..." : "Start Chat"}
        </Button>
      </CardFooter>
    </Card>
  )
}
