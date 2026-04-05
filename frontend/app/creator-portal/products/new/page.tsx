"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function NewProductPage() {
  const [images, setImages] = useState<string[]>([])
  const { toast } = useToast()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setImages([...images, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "商品已新增",
      description: "你的商品已成功上架",
    })
  }

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto max-w-4xl px-4 pt-24 pb-20">
        {/* Header */}
        <div className="mb-8">
          <Link href="/creator-portal">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回控制台
            </Button>
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-foreground">新增商品</h1>
          <p className="text-muted-foreground">填寫商品資訊並上架到你的星球</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-border/50 bg-card/30 p-8 backdrop-blur-sm">
            <div className="space-y-6">
              {/* Product Images */}
              <div className="space-y-3">
                <Label>商品圖片</Label>
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="group relative aspect-square overflow-hidden rounded-lg bg-muted/30">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Product ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 rounded-full bg-destructive p-1 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-4 w-4 text-destructive-foreground" />
                      </button>
                    </div>
                  ))}
                  {images.length < 8 && (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 bg-muted/20 transition-colors hover:border-primary/50 hover:bg-muted/30">
                      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">上傳圖片</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">建議尺寸：800x800px，最多 8 張圖片</p>
              </div>

              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name">商品名稱 *</Label>
                <Input id="name" placeholder="例如：星空筆記本" required className="bg-background/50" />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">商品分類 *</Label>
                <Select required>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="選擇分類" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stationery">文具</SelectItem>
                    <SelectItem value="stickers">貼紙</SelectItem>
                    <SelectItem value="cards">卡片</SelectItem>
                    <SelectItem value="bags">包包</SelectItem>
                    <SelectItem value="badges">徽章</SelectItem>
                    <SelectItem value="posters">海報</SelectItem>
                    <SelectItem value="accessories">配件</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">商品描述 *</Label>
                <Textarea
                  id="description"
                  placeholder="詳細描述你的商品特色、材質、尺寸等資訊..."
                  rows={6}
                  required
                  className="bg-background/50"
                />
              </div>

              {/* Price and Stock */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">售價 (NT$) *</Label>
                  <Input id="price" type="number" placeholder="380" min="0" required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">庫存數量 *</Label>
                  <Input id="stock" type="number" placeholder="50" min="0" required className="bg-background/50" />
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="length">長度 (cm)</Label>
                  <Input id="length" type="number" placeholder="15" min="0" step="0.1" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">寬度 (cm)</Label>
                  <Input id="width" type="number" placeholder="10" min="0" step="0.1" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">高度 (cm)</Label>
                  <Input id="height" type="number" placeholder="2" min="0" step="0.1" className="bg-background/50" />
                </div>
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight">重量 (g)</Label>
                <Input id="weight" type="number" placeholder="200" min="0" className="bg-background/50" />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">標籤</Label>
                <Input id="tags" placeholder="療癒, 可愛, 手作 (用逗號分隔)" className="bg-background/50" />
                <p className="text-xs text-muted-foreground">幫助顧客更容易找到你的商品</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 border-t border-border/50 pt-6">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-secondary">
                  上架商品
                </Button>
                <Link href="/creator-portal" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    取消
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  )
}
