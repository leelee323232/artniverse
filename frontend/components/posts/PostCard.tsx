"use client";

import { useState } from "react";
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Share2, 
  MoreHorizontal,
  Bookmark,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface Comment {
  id: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorName: string;
  authorAvatar?: string;
  isVerified?: boolean;
  content: string;
  images: string[];
  likes: number;
  isLiked?: boolean;
  comments: Comment[];
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onAddComment?: (postId: string, commentText: string) => void;
}

export function PostCard({ post, onLike, onAddComment }: PostCardProps) {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const handleLike = () => {
    if (onLike) onLike(post.id);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (onAddComment) {
      onAddComment(post.id, commentText.trim());
      setCommentText("");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${post.authorName} 的貼文`,
        text: post.content,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("已複製貼文連結至剪貼簿！");
    }
  };

  const nextImage = () => {
    if (currentImgIndex < post.images.length - 1) {
      setCurrentImgIndex(currentImgIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImgIndex > 0) {
      setCurrentImgIndex(currentImgIndex - 1);
    }
  };

  return (
    <article className="w-full border-b border-border/40 bg-card/10 p-5 backdrop-blur-sm transition-all hover:bg-card/20 md:rounded-xl md:border">
      <div className="flex gap-3">
        {/* 左側：頭像與 Threads 線條裝飾 */}
        <div className="flex flex-col items-center">
          <Avatar className="h-10 w-10 border border-primary/20 ring-2 ring-background">
            <AvatarImage src={post.authorAvatar} alt={post.authorName} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
              {post.authorName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {/* Threads 標誌性的垂直連接線 */}
          <div className="my-2 w-[2px] flex-1 bg-gradient-to-b from-border/50 to-transparent" />
        </div>

        {/* 右側：主內容區 */}
        <div className="flex-1 space-y-2">
          {/* 頂部：姓名與時間 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground hover:underline cursor-pointer">
                {post.authorName}
              </span>
              {post.isVerified && (
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none text-[10px] px-1 py-0 scale-90">
                  創作者
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{post.createdAt}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* 內文 */}
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {post.content}
          </p>

          {/* 圖片輪播牆 (最多 10 張) */}
          {post.images.length > 0 && (
            <div className="relative overflow-hidden rounded-xl border border-border/30 bg-black/20">
              <div 
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${currentImgIndex * 100}%)` }}
              >
                {post.images.map((img, idx) => (
                  <div key={idx} className="aspect-video w-full flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`Post Attachment ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* 多圖左右切換箭頭 */}
              {post.images.length > 1 && (
                <>
                  {currentImgIndex > 0 && (
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-sm hover:bg-black/80"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  )}
                  {currentImgIndex < post.images.length - 1 && (
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-sm hover:bg-black/80"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                  {/* 分頁圓點指標 */}
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">
                    {post.images.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 w-1.5 rounded-full transition-all ${
                          idx === currentImgIndex ? "bg-white scale-125" : "bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Threads 四大核心功能列 */}
          <div className="flex items-center gap-1 py-1 text-muted-foreground">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              className={`h-8 w-8 hover:text-red-500 hover:bg-red-500/5 ${post.isLiked ? "text-red-500 fill-red-500" : ""}`}
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowComments(!showComments)}
              className="h-8 w-8 hover:text-primary hover:bg-primary/5"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-8 w-8 hover:text-green-500 hover:bg-green-500/5"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-yellow-500 hover:bg-yellow-500/5 ml-auto"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>

          {/* 讚數與回覆數快照 */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{post.likes} 個讚</span>
            <span>·</span>
            <span 
              className="hover:underline cursor-pointer"
              onClick={() => setShowComments(!showComments)}
            >
              {post.comments.length} 則回覆
            </span>
          </div>

          {/* 單層簡易留言板 */}
          {showComments && (
            <div className="mt-3 space-y-3 border-t border-border/20 pt-3">
              {/* 留言列表 */}
              {post.comments.length > 0 ? (
                <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2.5 text-sm items-start">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={comment.userAvatar} />
                        <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                          {comment.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 rounded-lg bg-white/5 px-3 py-2">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-medium text-xs text-foreground/80">{comment.userName}</span>
                          <span className="text-[10px] text-muted-foreground">{comment.createdAt}</span>
                        </div>
                        <p className="text-sm text-foreground/95">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-muted-foreground py-2">尚未有留言，成為第一個留言的人吧！</p>
              )}

              {/* 新增留言 Input */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="留個言支持一下..."
                  className="bg-white/5 border-border/40 focus-visible:ring-primary h-8 text-xs"
                />
                <Button type="submit" size="sm" className="h-8 bg-primary hover:bg-primary/80 px-3">
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}