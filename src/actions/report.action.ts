"use server";

import { prisma } from "@/db";
import { onAuthenticateUser } from "./user.action";

export async function createReport({
  postId,
  reason,
  details,
}: {
  postId: string;
  reason: string;
  details?: string;
}) {
  try {
    const { user } = await onAuthenticateUser();

    if (!user) {
      return {
        status: 401,
        message: "You must be logged in to report a vibe.",
      };
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });

    if (!post) {
      return {
        status: 404,
        message: "Post not found.",
      };
    }

    if (post.authorId === user.id) {
      return {
        status: 400,
        message: "You cannot report your own vibe.",
      };
    }

    // Check if user already reported this post
    const existingReport = await prisma.report.findUnique({
      where: {
        reporterId_postId: {
          reporterId: user.id,
          postId,
        },
      },
    });

    if (existingReport) {
      return {
        status: 409,
        message: "You have already reported this vibe. Our team has received your report.",
      };
    }

    // Save report to database
    await prisma.report.create({
      data: {
        reporterId: user.id,
        postId,
        reason,
        details: details?.trim() || null,
      },
    });

    return {
      status: 201,
      message: "Report submitted successfully. Thank you for helping keep VIBEE safe!",
    };
  } catch (error) {
    console.error("createReport error:", error);
    return {
      status: 500,
      message: "An error occurred while submitting your report.",
    };
  }
}
