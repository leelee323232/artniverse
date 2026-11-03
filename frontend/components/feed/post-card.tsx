"use client";

import { useState } from "react";
import { ComingSoon } from "@/components/common/ComingSoon";
import { PostImages } from "@/components/posts/PostImages";
import { CollapsiblePostContent } from "@/components/posts/CollapsiblePostContent";
import { AuthorLink } from "@/components/posts/AuthorLink";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Post } from "@/lib/posts/types";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [likes, setLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);

  // TEMP: 原始互動邏輯暫時停用，改用 ComingSoon；恢復功能時取消下方註解。
  // const handleLike = () => {
  //     setIsLiked(!isLiked)
  //     setLikes(isLiked ? likes - 1 : likes + 1)
  //   }

  return (
    <Card className="gap-0 py-0 border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center gap-3 px-4 py-2">
        <AuthorLink
          authorId={post.authorId}
          authorType={post.authorType}
          label={`查看 ${post.authorName} 的個人主頁`}
        >
          <Avatar className="h-10 w-10 ring-2 ring-primary/10 hover:ring-primary/30 transition-all cursor-pointer">
            <AvatarImage src={post.authorAvatar} alt={post.authorName} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {post.authorName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </AuthorLink>
        <div className="flex-1 min-w-0">
          <AuthorLink
            authorId={post.authorId}
            authorType={post.authorType}
            className="font-semibold text-foreground hover:text-primary transition-colors"
          >
            {post.authorName}
          </AuthorLink>
          <p className="text-sm text-muted-foreground">{post.createdAt}</p>
        </div>
        {/* 使用非模態選單，避免開啟時鎖住頁面捲動並補償捲軸寬度。 */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="貼文選單"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* TEMP: 暫時使用 ComingSoon 阻擋；恢復時移除阻擋版本，取消下方原始 JSX 註解。
<DropdownMenuItem>追蹤此創作者</DropdownMenuItem>
*/}
            <ComingSoon className="flex-1">
              <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                追蹤此創作者
              </DropdownMenuItem>
            </ComingSoon>
            {/* TEMP: 暫時使用 ComingSoon 阻擋；恢復時移除阻擋版本，取消下方原始 JSX 註解。
<DropdownMenuItem>分享貼文</DropdownMenuItem>
*/}
            <ComingSoon className="flex-1">
              <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                分享貼文
              </DropdownMenuItem>
            </ComingSoon>
            {/* TEMP: 暫時使用 ComingSoon 阻擋；恢復時移除阻擋版本，取消下方原始 JSX 註解。
<DropdownMenuItem>檢舉</DropdownMenuItem>
*/}
            <ComingSoon className="flex-1">
              <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                檢舉
              </DropdownMenuItem>
            </ComingSoon>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="p-0">
        <PostImages
          images={post.images}
          alt={`${post.authorName} 的貼文圖片`}
        />
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-3 p-4">
        {/* 暫時隱藏：首頁貼文的按讚、留言、分享及收藏互動列；恢復時取消下方逐行註解。 */}
        {
          //         <div className="flex items-center justify-between w-full">
          //           <div className="flex items-center gap-1">
          //             {/* TEMP: 暫時使用 ComingSoon 阻擋；恢復時移除阻擋版本，取消下方原始 JSX 註解。
          // <Button
          //               variant="ghost"
          //               size="icon"
          //               className={`h-9 w-9 ${isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
          //               onClick={handleLike}
          //             >
          //               <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
          //             </Button>
          // */}
          //             <ComingSoon className="flex-1">
          //               <Button
          //                 aria-label="按讚"
          //                 variant="ghost"
          //                 size="icon"
          //                 className={`h-9 w-9 ${isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
          //               >
          //                 <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
          //               </Button>
          //             </ComingSoon>
          //             {/* TEMP: 暫時使用 ComingSoon 阻擋；恢復時移除阻擋版本，取消下方原始 JSX 註解。
          // <Button
          //               variant="ghost"
          //               size="icon"
          //               className="h-9 w-9 text-muted-foreground hover:text-primary"
          //               onClick={() => setShowComments(!showComments)}
          //             >
          //               <MessageCircle className="h-5 w-5" />
          //             </Button>
          // */}
          //             <ComingSoon className="flex-1">
          //               <Button
          //                 aria-label="留言"
          //                 variant="ghost"
          //                 size="icon"
          //                 className="h-9 w-9 text-muted-foreground hover:text-primary"
          //               >
          //                 <MessageCircle className="h-5 w-5" />
          //               </Button>
          //             </ComingSoon>
          //             {/* TEMP: 暫時使用 ComingSoon 阻擋；恢復時移除阻擋版本，取消下方原始 JSX 註解。
          // <Button
          //               variant="ghost"
          //               size="icon"
          //               className="h-9 w-9 text-muted-foreground hover:text-primary"
          //             >
          //               <Share2 className="h-5 w-5" />
          //             </Button>
          // */}
          //             <ComingSoon className="flex-1">
          //               <Button
          //                 aria-label="分享貼文"
          //                 variant="ghost"
          //                 size="icon"
          //                 className="h-9 w-9 text-muted-foreground hover:text-primary"
          //               >
          //                 <Share2 className="h-5 w-5" />
          //               </Button>
          //             </ComingSoon>
          //           </div>
          //           {/* TEMP: 暫時使用 ComingSoon 阻擋；恢復時移除阻擋版本，取消下方原始 JSX 註解。
          // <Button
          //             variant="ghost"
          //             size="icon"
          //             className={`h-9 w-9 ${isSaved ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
          //             onClick={() => setIsSaved(!isSaved)}
          //           >
          //             <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
          //           </Button>
          // */}
          //           <ComingSoon className="flex-1">
          //             <Button
          //               aria-label="收藏貼文"
          //               variant="ghost"
          //               size="icon"
          //               className={`h-9 w-9 ${isSaved ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
          //             >
          //               <Bookmark
          //                 className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`}
          //               />
          //             </Button>
          //           </ComingSoon>
          //         </div>
        }

        <div className="space-y-1 w-full">
          <p className="font-semibold text-sm">{likes.toLocaleString()} 個讚</p>
          <CollapsiblePostContent content={post.content}>
            <AuthorLink
              authorId={post.authorId}
              authorType={post.authorType}
              className="font-semibold hover:text-primary"
            >
              {post.authorName}
            </AuthorLink>{" "}
          </CollapsiblePostContent>
          {post.comments.length > 0 && (
            <>
              {/* TEMP: 暫時使用 ComingSoon 阻擋；恢復時移除阻擋版本，取消下方原始 JSX 註解。
<button
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setShowComments(!showComments)}
            >
              查看全部 {post.comments.length} 則留言
            </button>
*/}
              <ComingSoon className="flex-1">
                <button className="text-sm text-muted-foreground hover:text-foreground">
                  查看全部 {post.comments.length} 則留言
                </button>
              </ComingSoon>
            </>
          )}
        </div>

        {showComments && (
          <div className="w-full pt-3 border-t border-border/50">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="新增留言..."
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              />
              {/* TEMP: 原本發布按鈕暫時以 ComingSoon 阻擋，恢復時移除包裝。 */}
              <ComingSoon className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary font-semibold"
                >
                  發布
                </Button>
              </ComingSoon>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
