import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { prisma } from "@/db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    username({
      displayUsername: false,
    }),
    nextCookies(),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              photo: user.image || "/user-placeholder.png",
            },
          };
        },
      },
    },
  },
  user: {
    additionalFields: {
      photo: {
        type: "string",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
      website: {
        type: "string",
        required: false,
      },
      location: {
        type: "string",
        required: false,
      },
      coverImage: {
        type: "string",
        required: false,
      },
    },
  },
});
