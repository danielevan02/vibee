/**
 * Shapes returned by the explore queries.
 *
 * They live here rather than in server/data/explore.ts because Client
 * Components need them, and that module is server-only - importing it from the
 * browser bundle would drag Prisma along with it.
 */
export interface ExplorePost {
  id: string;
  content: string | null;
  imageUrl: string | null;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    username: string;
    photo: string | null;
  };
  _count: {
    comments: number;
    likes: number;
  };
  comments: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      name: string;
      username: string;
      photo: string | null;
    };
  }[];
  likes: {
    authorId: string;
  }[];
}

export interface ExploreUser {
  id: string;
  name: string;
  username: string;
  photo: string | null;
  bio: string | null;
  _count: {
    followers: number;
    posts: number;
  };
  isFollowing?: boolean;
}
