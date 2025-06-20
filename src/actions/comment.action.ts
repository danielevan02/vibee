"use server"

import { prisma } from "@/lib/prisma"
import { onAuthenticateUser } from "./user.action"
import { revalidatePath } from "next/cache";

export async function createComment({content, postId}:{content: string; postId: string}){
  try {
    const { user } = await onAuthenticateUser()
    if(!user){
      return {
        status: 401,
        message: "You're not authenticated"
      }
    }

    const comment = await prisma.comment.create({
      data: {
        authorId: user.id,
        content,
        postId
      },
      include: {
        author: true
      }
    })

    revalidatePath('/home')

    return {
      status: 201,
      message: "Comment Posted!",
      comment
    }
  } catch (error) {
    console.log(error)
    return {
      status: 500,
      message: "Internal Server Error"
    }
  }
}