"use server"

import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"

export async function onAuthenticateUser(){
  try {
    const user = await currentUser()

    if(!user){
      return {
        status: 403
      }
    }

    const existUser = await prisma.user.findFirst({
      where: {
        clerkId: user.id
      }
    })

    if(existUser) {
      return {
        status: 201,
        user: existUser
      }
    }

    const newUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        photo: user.imageUrl,
        username: user.username??"",
        password: "",
      }
    })

    if(!newUser){
      return {
        status: 500,
        message: "Failed creating user!"
      }
    }

    return {
      status: 200,
      user: newUser
    }
  } catch (error) {
    console.log("🛑 ERROR: ", error)
    return {
      status: 500,
      message: "Internal Server Error"
    }
  }
}