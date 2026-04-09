import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ProfileClient from "./ProfileClient"

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch full user data including styles, sizes, and location
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      location: true,
      stylePreferences: true,
      sizes: true
    }
  })

  if (!user) {
    redirect("/login")
  }

  return <ProfileClient user={user} />
}
