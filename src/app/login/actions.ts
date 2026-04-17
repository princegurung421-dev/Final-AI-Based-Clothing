"use server"

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { revalidatePath } from "next/cache"

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    // signIn on success throws NEXT_REDIRECT — invalidate layout cache so
    // the navbar picks up the new session on the next render
    revalidatePath('/', 'layout')
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: '/' });
}
