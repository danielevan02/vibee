import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const payload = await req.json();
  
  if (payload.type === 'user.updated') {
    const user = payload.data;

    const clerkId = user.id;
    const name = user.first_name + ' ' + user.last_name;
    const photo = user.image_url
    const username = user.username

    await prisma.user.update({
      where: { clerkId }, // atau gunakan email kalau tidak simpan clerkId
      data: {
        name,
        photo,
        username
      },
    });

    revalidatePath('/home')
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false });
}