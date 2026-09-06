"use server"

import { prisma } from "@/db";
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
    });

    // Notify post author if not liking own post
    const targetPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, content: true },
    });

    if (targetPost && targetPost.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          type: "LIKE",
          content: targetPost.content?.slice(0, 100) || "your vibe",
          recipientId: targetPost.authorId,
          senderId: user.id,
          postId,
        },
      });
    }

    return {
      status: 201,
    }
  } catch (error) {
    console.error("createLike error:", error);
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
    });

    // Delete like notification if still unread
    await prisma.notification.deleteMany({
      where: {
        type: "LIKE",
        senderId: user.id,
        postId,
        read: false,
      },
    });

    return {
      status: 200,
    }
  } catch (error) {
    console.error("removeLike error:", error);
    return {
      status: 500,
      message: 'Internal Server Error'
    }
  }
}