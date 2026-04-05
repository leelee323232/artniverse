"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { Heart, Users, Package, Star, Bell, BellOff, Trash2 } from "lucide-react"
import Link from "next/link"

const mockFavorites = [
  {
    id: "1",
    name: "星空畫室",
    avatar: "",
    followers: 12500,
    products: 24,
    rating: 4.9,
    tags: ["療癒", "可愛", "插畫"],
    isNotifying: true,
    latestProduct: "星空筆記本",
  },
  {
    id: "2",
    name: "月光工作室",
    avatar: "",
    followers: 8700,
    products: 18,
    rating: 4.8,
    tags: ["夢幻", "自然", "水彩"],
    isNotifying: true,
    latestProduct: "月光明信片",
  },
  {
    id: "3",
    name: "森林畫家",
    avatar: "",
    followers: 5600,
    products: 12,
    rating: 4.7,
    tags: ["自然", "手繪", "治癒"],
    isNotifying: false,
    latestProduct: "森林海報",
  },
  {
    id: "4",
    name: "夢想插畫",
    avatar: "",
    followers: 9200,
    products: 32,
    rating: 4.9,
    tags: ["美式", "卡通", "趣味"],
    isNotifying: false,
    latestProduct: "趣味貼紙組",
  },
]

export default function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState(mockFavorites)

  if (!user) {
    return (
      <div className="relative min-h-screen">
        <UniverseBackground />
        <Navigation />
        <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-16">
          <Card className="border-border/50 bg-card/30 p-8 backdrop-blur-md text-center">
            <p className="mb-4 text-foreground">請先登入以查看收藏名單</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-primary to-secondary">前往登入</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  const toggleNotification = (id: string) => {
    setFavorites(
      favorites.map((f) => (f.id === id ? { ...f, isNotifying: !f.isNotifying } : f))
    )
  }

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter((f) => f.id !== id))
  }

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">創作者收藏名單</h1>
              <p className="mt-2 text-muted-foreground">您收藏了 {favorites.length} 位創作者</p>
            </div>
          </div>

          {favorites.length === 0 ? (
            <Card className="border-border/50 bg-card/30 p-12 backdrop-blur-md text-center">
              <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-4 text-muted-foreground">您尚未收藏任何創作者</p>
              <Link href="/explore">
                <Button className="bg-gradient-to-r from-primary to-secondary">探索創作者</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {favorites.map((creator) => (
                <Card
                  key={creator.id}
                  className="border-border/50 bg-card/30 p-6 backdrop-blur-md transition-all hover:bg-card/40"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Link href={`/creator/${creator.id}`}>
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary to-secondary">
                        {creator.avatar ? (
                          <img
                            src={creator.avatar}
                            alt={creator.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-xl font-bold text-primary-foreground">
                              {creator.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1">
                      <Link href={`/creator/${creator.id}`}>
                        <h3 className="font-bold text-foreground hover:text-primary">
                          {creator.name}
                        </h3>
                      </Link>

                      <div className="mt-1 flex flex-wrap gap-1">
                        {creator.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-primary/20 text-primary text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {(creator.followers / 1000).toFixed(1)}K
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {creator.products}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          {creator.rating}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-muted-foreground">
                        最新作品：<span className="text-foreground">{creator.latestProduct}</span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={creator.isNotifying ? "text-primary" : "text-muted-foreground"}
                        onClick={() => toggleNotification(creator.id)}
                        title={creator.isNotifying ? "關閉通知" : "開啟通知"}
                      >
                        {creator.isNotifying ? (
                          <Bell className="h-4 w-4" />
                        ) : (
                          <BellOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeFavorite(creator.id)}
                        title="取消收藏"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Visit Button */}
                  <div className="mt-4 flex gap-2">
                    <Link href={`/creator/${creator.id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        查看商店
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
