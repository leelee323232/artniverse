"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PostCardProps {
  post: {
    id: string
    creator: {
      id: string
      name: string
      avatar: string
      username: string
    }
    image: string
    title: string
    description: string
    likes: number
    comments: number
    timeAgo: string
    isLiked?: boolean
    isSaved?: boolean
  }
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false)
  const [isSaved, setIsSaved] = useState(post.isSaved || false)
  const [likes, setLikes] = useState(post.likes)
  const [showComments, setShowComments] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Link href={`/creator/${post.creator.id}`}>
          <Avatar className="h-10 w-10 ring-2 ring-primary/10 hover:ring-primary/30 transition-all cursor-pointer">
            <AvatarImage src={post.creator.avatar} alt={post.creator.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {post.creator.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link 
            href={`/creator/${post.creator.id}`}
            className="font-semibold text-foreground hover:text-primary transition-colors"
          >
            {post.creator.name}
          </Link>
          <p className="text-sm text-muted-foreground">@{post.creator.username} · {post.timeAgo}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>追蹤此創作者</DropdownMenuItem>
            <DropdownMenuItem>分享貼文</DropdownMenuItem>
            <DropdownMenuItem>檢舉</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="p-0">
        <Link href={`/post/${post.id}`}>
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </Link>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-3 p-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-9 w-9 ${isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
              onClick={handleLike}
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-muted-foreground hover:text-primary"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-muted-foreground hover:text-primary"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-9 w-9 ${isSaved ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            onClick={() => setIsSaved(!isSaved)}
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
          </Button>
        </div>

        <div className="space-y-1 w-full">
          <p className="font-semibold text-sm">{likes.toLocaleString()} 個讚</p>
          <p className="text-sm">
            <Link href={`/creator/${post.creator.id}`} className="font-semibold hover:text-primary">
              {post.creator.name}
            </Link>{" "}
            <span className="text-foreground/90">{post.description}</span>
          </p>
          {post.comments > 0 && (
            <button 
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setShowComments(!showComments)}
            >
              查看全部 {post.comments} 則留言
            </button>
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
              <Button variant="ghost" size="sm" className="text-primary font-semibold">
                發布
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
