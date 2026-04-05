"use client"

import type React from "react"

import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function CreatorSettingsPage() {
  const { toast } = useToast()

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "設定已儲存",
      description: "你的個人資料已成功更新",
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
          <h1 className="mb-2 text-3xl font-bold text-foreground">創作者設定</h1>
          <p className="text-muted-foreground">管理你的個人資料與星球設定</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="profile">個人資料</TabsTrigger>
            <TabsTrigger value="planet">星球設定</TabsTrigger>
            <TabsTrigger value="commission">接案設定</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <form onSubmit={handleSave}>
              <Card className="border-border/50 bg-card/30 p-8 backdrop-blur-sm">
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="space-y-3">
                    <Label>大頭貼</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-primary to-secondary" />
                      <div>
                        <Button type="button" variant="outline" size="sm">
                          <Upload className="mr-2 h-4 w-4" />
                          上傳圖片
                        </Button>
                        <p className="mt-2 text-xs text-muted-foreground">建議尺寸：400x400px</p>
                      </div>
                    </div>
                  </div>

                  {/* Creator Name */}
                  <div className="space-y-2">
                    <Label htmlFor="creator-name">創作者名稱 *</Label>
                    <Input id="creator-name" defaultValue="小夢創作室" required className="bg-background/50" />
                  </div>

                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label htmlFor="display-name">顯示名稱 *</Label>
                    <Input id="display-name" defaultValue="夢幻星球" required className="bg-background/50" />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">個人簡介 *</Label>
                    <Textarea
                      id="bio"
                      defaultValue="專注於療癒系插畫與周邊商品設計，帶給你溫暖的視覺體驗"
                      rows={4}
                      required
                      className="bg-background/50"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">所在地</Label>
                    <Input id="location" defaultValue="台北市" className="bg-background/50" />
                  </div>

                  {/* Contact Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">聯絡信箱 *</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="dream@example.com"
                      required
                      className="bg-background/50"
                    />
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4">
                    <Label>社群連結</Label>
                    <div className="space-y-3">
                      <Input placeholder="Instagram 網址" className="bg-background/50" />
                      <Input placeholder="Facebook 網址" className="bg-background/50" />
                      <Input placeholder="個人網站" className="bg-background/50" />
                    </div>
                  </div>

                  <div className="flex gap-3 border-t border-border/50 pt-6">
                    <Button type="submit" className="bg-gradient-to-r from-primary to-secondary">
                      儲存變更
                    </Button>
                    <Button type="button" variant="outline">
                      取消
                    </Button>
                  </div>
                </div>
              </Card>
            </form>
          </TabsContent>

          {/* Planet Settings Tab */}
          <TabsContent value="planet">
            <form onSubmit={handleSave}>
              <Card className="border-border/50 bg-card/30 p-8 backdrop-blur-sm">
                <div className="space-y-6">
                  {/* Planet Color */}
                  <div className="space-y-3">
                    <Label htmlFor="planet-color">星球顏色</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="planet-color"
                        type="color"
                        defaultValue="#a78bfa"
                        className="h-12 w-24 cursor-pointer"
                      />
                      <p className="text-sm text-muted-foreground">選擇代表你創作風格的顏色</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-3">
                    <Label>風格標籤</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">療癒</Badge>
                      <Badge variant="secondary">可愛</Badge>
                      <Badge variant="secondary">插畫</Badge>
                      <Badge variant="outline">+ 新增標籤</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">最多 5 個標籤</p>
                  </div>

                  {/* Banner Image */}
                  <div className="space-y-3">
                    <Label>星球橫幅圖片</Label>
                    <div className="aspect-[3/1] overflow-hidden rounded-lg bg-muted/30">
                      <div className="flex h-full items-center justify-center">
                        <Button type="button" variant="outline">
                          <Upload className="mr-2 h-4 w-4" />
                          上傳橫幅
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">建議尺寸：1200x400px</p>
                  </div>

                  {/* Featured Products */}
                  <div className="space-y-3">
                    <Label>精選商品</Label>
                    <p className="text-sm text-muted-foreground">選擇最多 6 個商品在星球首頁展示</p>
                    <Button type="button" variant="outline">
                      選擇商品
                    </Button>
                  </div>

                  <div className="flex gap-3 border-t border-border/50 pt-6">
                    <Button type="submit" className="bg-gradient-to-r from-primary to-secondary">
                      儲存變更
                    </Button>
                    <Button type="button" variant="outline">
                      取消
                    </Button>
                  </div>
                </div>
              </Card>
            </form>
          </TabsContent>

          {/* Commission Settings Tab */}
          <TabsContent value="commission">
            <form onSubmit={handleSave}>
              <Card className="border-border/50 bg-card/30 p-8 backdrop-blur-sm">
                <div className="space-y-6">
                  {/* Accept Commissions */}
                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/30 p-4">
                    <div>
                      <h3 className="font-bold text-foreground">接受委託</h3>
                      <p className="text-sm text-muted-foreground">開放接受客製化設計委託</p>
                    </div>
                    <Button type="button" variant="outline">
                      開啟
                    </Button>
                  </div>

                  {/* Commission Types */}
                  <div className="space-y-3">
                    <Label>接案類型</Label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm text-foreground">品牌設計</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm text-foreground">插畫繪製</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-foreground">周邊商品設計</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-foreground">包裝設計</span>
                      </label>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="min-price">最低價格 (NT$)</Label>
                      <Input id="min-price" type="number" defaultValue="5000" min="0" className="bg-background/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-price">最高價格 (NT$)</Label>
                      <Input id="max-price" type="number" defaultValue="50000" min="0" className="bg-background/50" />
                    </div>
                  </div>

                  {/* Turnaround Time */}
                  <div className="space-y-2">
                    <Label htmlFor="turnaround">平均完成時間 (天)</Label>
                    <Input id="turnaround" type="number" defaultValue="14" min="1" className="bg-background/50" />
                  </div>

                  {/* Commission Description */}
                  <div className="space-y-2">
                    <Label htmlFor="commission-desc">接案說明</Label>
                    <Textarea
                      id="commission-desc"
                      placeholder="說明你的接案流程、注意事項等..."
                      rows={6}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="flex gap-3 border-t border-border/50 pt-6">
                    <Button type="submit" className="bg-gradient-to-r from-primary to-secondary">
                      儲存變更
                    </Button>
                    <Button type="button" variant="outline">
                      取消
                    </Button>
                  </div>
                </div>
              </Card>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
