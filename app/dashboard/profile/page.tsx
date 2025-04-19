"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { Checkbox } from "@/components/ui/checkbox"
import DashboardLayout from "@/components/dashboard-layout"

const CAUSE_TYPES = [
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

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  location: z.string().min(2, { message: "Location is required" }),
  bio: z
    .string()
    .min(10, { message: "Bio must be at least 10 characters" })
    .max(500, { message: "Bio must not exceed 500 characters" }),
  causes: z.array(z.string()).min(1, { message: "Please select at least one cause" }),
  profileImage: z.any().optional(),
})

type ProfileValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading } = useAuth()

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      location: "",
      bio: "",
      causes: [],
    },
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUserData(userData)

            // If profile is not complete, redirect to profile setup
            if (!userData.profileComplete) {
              router.push("/profile/setup")
              return
            }

            // Set form values
            form.reset({
              name: userData.name || "",
              location: userData.location || "",
              bio: userData.bio || "",
              causes: userData.causes || [],
            })

            // Set image preview if available
            if (userData.profileImageUrl) {
              setImagePreview(userData.profileImageUrl)
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchUserData()
    }
  }, [user, loading, router, form])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue("profileImage", file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function onSubmit(data: ProfileValues) {
    if (!user) return

    setIsSaving(true)

    try {
      let profileImageUrl = userData?.profileImageUrl || ""

      // Upload profile image if provided
      if (data.profileImage && data.profileImage instanceof File) {
        const storageRef = ref(storage, `profile-images/${user.uid}`)
        await uploadBytes(storageRef, data.profileImage)
        profileImageUrl = await getDownloadURL(storageRef)
      }

      // Update user profile in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        name: data.name,
        location: data.location,
        bio: data.bio,
        causes: data.causes,
        profileImageUrl: profileImageUrl,
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
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
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your profile information</p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex-1 space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, State, Country" {...field} />
                        </FormControl>
                        <FormDescription>
                          This helps connect you with {userData?.role === "donor" ? "help seekers" : "donors"} in your
                          area
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="mb-4 h-32 w-32 overflow-hidden rounded-full border bg-gray-100">
                    {imagePreview ? (
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">No image</div>
                    )}
                  </div>
                  <Input type="file" accept="image/*" onChange={handleImageChange} className="max-w-[200px]" />
                  <p className="mt-2 text-xs text-gray-500">Upload a profile picture</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          userData?.role === "donor"
                            ? "Tell us about yourself and why you want to help..."
                            : "Tell us about your organization or your needs..."
                        }
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{500 - (field.value?.length || 0)} characters remaining</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="causes"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">
                        {userData?.role === "donor" ? "Causes you want to support" : "Causes you need help with"}
                      </FormLabel>
                      <FormDescription>Select all that apply</FormDescription>
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {CAUSE_TYPES.map((cause) => (
                        <FormField
                          key={cause.id}
                          control={form.control}
                          name="causes"
                          render={({ field }) => {
                            return (
                              <FormItem key={cause.id} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(cause.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, cause.id])
                                        : field.onChange(field.value?.filter((value) => value !== cause.id))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{cause.label}</FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving changes..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  )
}
