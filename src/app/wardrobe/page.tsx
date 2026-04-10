import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import WardrobeClient from "./WardrobeClient"

export default async function WardrobePage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const items = await prisma.wardrobeItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })

  return <WardrobeClient initialItems={items} />
}
