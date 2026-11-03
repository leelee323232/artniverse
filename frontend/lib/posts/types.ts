export interface Comment {
  id: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Post {
  authorType?: "official" | "creator";
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  isVerified?: boolean;
  content: string;
  images: string[];
  likes: number;
  isLiked?: boolean;
  isSaved?: boolean;
  comments: Comment[];
  createdAt: string;
}

