"use server";

import { prisma } from "@/lib/prisma";
import { onAuthenticateUser } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createPost({
  content,
  imageUrl,
}: {
  content: string;
  imageUrl?: string;
}) {
  try {
    const { user } = await onAuthenticateUser();

    if(!user){
      return {
        status: 401,
        message: "You're not authenticated!"
      }
    }

    await prisma.post.create({
      data: {
        content,
        imageUrl,
        author: {
          connect: {
            id: user.id
          }
        },
      },
    });

    revalidatePath('/home')

    return {
      status: 201,
      message: "Post Created!"
    }
  } catch (error) {
    console.log(error)
    return {
      status: 500,
      message: "Internal Server Error"
    }
  }
}

export async function getAllPost(){
  return await prisma.post.findMany({
    take:10,
    include: {
      author: true,
      _count: {
        select: {
          likes: true,
          comments: true
        }
      },
      likes: {
        select: {
          authorId: true
        }
      },
      comments: {
        include: {
          author: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}