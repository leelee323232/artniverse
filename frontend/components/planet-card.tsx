"use client"

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PlanetCardProps {
  id: string
  name: string
  creator: string
  description: string
  tags: string[]
  followers: number
  rating: number
  image: string
  color: string
}

export function PlanetCard({ id, name, creator, description, tags, followers, rating, image, color }: PlanetCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  return (
    <Link href={`/creator/${id}`}>
      <Card
        className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden">
          <div
            className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
            style={{
              background: `radial-gradient(circle at center, ${color}40 0%, ${color}10 50%, transparent 100%)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="h-32 w-32 rounded-full transition-all duration-500 group-hover:h-36 group-hover:w-36"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${color} 0%, ${color}80 100%)`,
                boxShadow: `0 0 60px ${color}60, inset 0 0 30px ${color}40`,
              }}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-10 bg-background/50 backdrop-blur-sm hover:bg-background/80"
            onClick={(e) => {
              e.preventDefault()
              setIsLiked(!isLiked)
            }}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-foreground"}`} />
          </Button>
        </div>

        <div className="space-y-3 p-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{creator}</p>
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>

          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span>{rating}</span>
            </div>
            <div className="text-sm text-muted-foreground">{followers.toLocaleString()} 追蹤</div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
