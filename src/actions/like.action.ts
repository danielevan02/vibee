"use server"

import { prisma } from "@/lib/prisma";
import { onAuthenticateUser } from "./user.action";

export async function createLike({postId}: {postId: string;}){
  try {
    const { user } = await onAuthenticateUser()
    if(!user){
      return {
        status: 401,
        message: "You're not authenticated!"
      }
    }

    await prisma.like.create({
      data: {
        authorId: user.id,
        postId
      }
    })

    return {
      status: 201,
    }
  } catch (error) {
    console.log(error)
    return {
      status: 500,
      message: 'Internal Server Error'
    }
  }
}

export async function removeLike({postId}: {postId: string;}){
  try {
    const { user } = await onAuthenticateUser()
    if(!user){
      return {
        status: 401,
        message: "You're not authenticated!"
      }
    }

    await prisma.like.delete({
      where: {
        authorId_postId: {
          authorId: user.id,
          postId
        }
      }
    })

    return {
      status: 201,
    }
  } catch (error) {
    console.log(error)
    return {
      status: 500,
      message: 'Internal Server Error'
    }
  }
}