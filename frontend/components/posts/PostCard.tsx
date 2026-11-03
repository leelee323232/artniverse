"use client";

import { useState } from "react";
import { PostImages } from "./PostImages";
import {
  Heart,
  MessageCircle,
  Send,
  Share2,
  MoreHorizontal,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComingSoon } from "@/components/common/ComingSoon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { AuthorLink } from "./AuthorLink";
import type { Post } from "@/lib/posts/types";
export type { Post, Comment } from "@/lib/posts/types";

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onAddComment?: (postId: string, commentText: string) => void;
}

export function PostCard({ post, onLike, onAddComment }: PostCardProps) {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  // TEMP: 原始互動邏輯暫時停用，改用 ComingSoon；恢復功能時取消下方註解。
// const handleLike = () => {
//     if (onLike) onLike(post.id);
//   };

  // TEMP: 原始互動邏輯暫時停用，改用 ComingSoon；恢復功能時取消下方註解。
// const handleCommentSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!commentText.trim()) return;
//     if (onAddComment) {
//       onAddComment(post.id, commentText.trim());
//       setCommentText("");
//     }
//   };

  // TEMP: 原始互動邏輯暫時停用，改用 ComingSoon；恢復功能時取消下方註解。
// const handleShare = () => {
//     if (navigator.share) {
//       navigator.share({
//         title: `${post.authorName} 的貼文`,
//         text: post.content,
//         url: window.location.href,
//       }).catch(console.error);
//     } else {
//       navigator.clipboard.writeText(window.location.href);
//       alert("已複製貼文連結至剪貼簿！");
//     }
//   };

  return (
    <article className="w-full border-b border-border/40 bg-card/10 p-5 backdrop-blur-sm transition-all hover:bg-card/20 md:rounded-xl md:border">
      <div className="flex gap-3">
        {/* 左側：頭像與 Threads 線條裝飾 */}
        <div className="flex flex-col items-center">
          <AuthorLink authorId={post.authorId} label={`查看 ${post.authorName} 的個人主頁`}>
          <Avatar className="h-10 w-10 border border-primary/20 ring-2 ring-background">
            <AvatarImage src={post.authorAvatar} alt={post.authorName} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
              {post.authorName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          </AuthorLink>
          {/* Threads 標誌性的垂直連接線 */}
          <div className="my-2 w-[2px] flex-1 bg-gradient-to-b from-border/50 to-transparent" />
        </div>

        {/* 右側：主內容區 */}
        <div className="flex-1 space-y-2">
          {/* 頂部：姓名與時間 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AuthorLink authorId={post.authorId} className="font-semibold text-foreground hover:underline">
                {post.authorName}
              </AuthorLink>
              {post.isVerified && (
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none text-[10px] px-1 py-0 scale-90">
                  創作者
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{post.createdAt}</span>
            </div>
            <ComingSoon className="flex-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </ComingSoon>
          </div>

          {/* 內文 */}
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {post.content}
          </p>

          <PostImages images={post.images} alt={`${post.authorName} 的貼文圖片`} />

          {/* Threads 四大核心功能列 */}
          <div className="flex items-center gap-1 py-1 text-muted-foreground">
            <ComingSoon className="flex-1">
              {/* TEMP: 暫時使用 ComingSoon 阻擋；恢復時移除阻擋版本，取消下方原始 JSX 註解。
<Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-red-500 hover:bg-red-500/5"
              >
                <Heart className="h-4 w-4" />
              </Button>
*/}
<Button aria-label="按讚"
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-red-500 hover:bg-red-500/5"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </ComingSoon>
            {/* TEMP: 暫時使用 ComingSoon 阻擋；恢復時移除阻擋版本，取消下方原始 JSX 註解。
<Button
              variant="ghost"
              size="icon"
              onClick={() => setShowComments(!showComments)}
              className="h-8 w-8 hover:text-primary hover:bg-primary/5"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
*/}
<ComingSoon className="flex-1">
<Button aria-label="留言"
              variant="ghost"
              size="icon"

              className="h-8 w-8 hover:text-primary hover:bg-primary/5"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
</ComingSoon>
            {/* TEMP: 暫時使用 ComingSoon 阻擋；恢復時移除阻擋版本，取消下方原始 JSX 註解。
<Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-8 w-8 hover:text-green-500 hover:bg-green-500/5"
            >
              <Send className="h-4 w-4" />
            </Button>
*/}
<ComingSoon className="flex-1">
<Button aria-label="分享貼文"
              variant="ghost"
              size="icon"

              className="h-8 w-8 hover:text-green-500 hover:bg-green-500/5"
            >
              <Send className="h-4 w-4" />
            </Button>
</ComingSoon>
            <ComingSoon className="flex-1">
              {/* TEMP: 暫時使用 ComingSoon 阻擋；恢復時移除阻擋版本，取消下方原始 JSX 註解。
<Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-yellow-500 hover:bg-yellow-500/5 ml-auto"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
*/}
<Button aria-label="收藏貼文"
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-yellow-500 hover:bg-yellow-500/5 ml-auto"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </ComingSoon>
          </div>

          {/* 讚數與回覆數快照 */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{post.likes} 個讚</span>
            <span>·</span>
            {/* TEMP: 暫時使用 ComingSoon 阻擋；恢復時移除阻擋版本，取消下方原始 JSX 註解。
<span
              className="hover:underline cursor-pointer"
              onClick={() => setShowComments(!showComments)}
            >
              {post.comments.length} 則回覆
            </span>
*/}
<ComingSoon className="flex-1">
<span
              className="hover:underline cursor-pointer"

            >
              {post.comments.length} 則回覆
            </span>
</ComingSoon>
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
              <form
                // TEMP: 原本 onSubmit={handleCommentSubmit}；留言功能暫時使用 ComingSoon 阻擋，保留防止原生送出。
                onSubmit={(event) => event.preventDefault()} className="flex gap-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="留個言支持一下..."
                  className="bg-white/5 border-border/40 focus-visible:ring-primary h-8 text-xs"
                />
                <ComingSoon className="flex-1">
                  {/* TEMP: 暫時使用 ComingSoon 阻擋；恢復時移除阻擋版本，取消下方原始 JSX 註解。
<Button type="button" size="sm" className="h-8 bg-primary hover:bg-primary/80 px-3">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
*/}
<Button aria-label="送出留言" type="button" size="sm" className="h-8 bg-primary hover:bg-primary/80 px-3">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </ComingSoon>
              </form>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
