"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Star, Heart, Share2, Crown, Sparkles, Coins, Gift, Check, Upload, Send, CheckCircle } from "lucide-react"

// Mock data - in real app this would come from database
const creatorData = {
  id: "1",
  name: "夢幻星球",
  creator: "小夢創作室",
  description:
    "專注於療癒系插畫與周邊商品設計，帶給你溫暖的視覺體驗。我們相信每個人心中都有一個夢幻的小宇宙，透過我們的作品，希望能點亮你心中的那顆星。",
  tags: ["療癒", "可愛", "插畫", "手作"],
  followers: 12500,
  rating: 4.9,
  totalReviews: 856,
  color: "#a78bfa",
  joinedDate: "2022年3月",
  superSubscription: {
    enabled: true,
    price: 99,
    benefits: ["每月獨家桌布", "新品搶先看", "專屬折扣碼", "創作幕後分享"],
  },
}

const products = [
  {
    id: "1",
    name: "星空筆記本",
    price: 380,
    image: "/cute-notebook-with-stars.jpg",
    category: "文具",
    stock: 45,
  },
  {
    id: "2",
    name: "療癒小熊貼紙組",
    price: 120,
    image: "/cute-bear-stickers.jpg",
    category: "貼紙",
    stock: 120,
  },
  {
    id: "3",
    name: "夢境明信片套組",
    price: 250,
    image: "/dreamy-postcards.jpg",
    category: "卡片",
    stock: 68,
  },
  {
    id: "4",
    name: "宇宙帆布袋",
    price: 450,
    image: "/universe-tote-bag.jpg",
    category: "包包",
    stock: 32,
  },
  {
    id: "5",
    name: "星球徽章組",
    price: 180,
    image: "/planet-badges.jpg",
    category: "徽章",
    stock: 95,
  },
  {
    id: "6",
    name: "手繪插畫海報",
    price: 580,
    image: "/hand-drawn-illustration-poster.jpg",
    category: "海報",
    stock: 28,
  },
]

const commissionWorks = [
  {
    id: "1",
    title: "品牌吉祥物設計",
    client: "甜點工作室",
    image: "/cute-mascot-design.jpg",
    description: "為在地甜點品牌設計的療癒系吉祥物",
  },
  {
    id: "2",
    title: "婚禮插畫邀請卡",
    client: "王先生 & 李小姐",
    image: "/wedding-invitation-illustration.jpg",
    description: "客製化婚禮邀請卡插畫設計",
  },
  {
    id: "3",
    title: "兒童繪本插圖",
    client: "小樹出版社",
    image: "/children-book-illustration.jpg",
    description: "溫馨兒童繪本全書插圖繪製",
  },
]

// Product categories for commission
const productCategories = [
  "T-shirt",
  "帽子",
  "貼紙",
  "明信片",
  "海報",
  "帆布袋",
  "馬克杯",
  "手機殼",
  "徽章",
  "筆記本",
  "其他",
]

export default function CreatorPage({ params }: { params: { id: string } }) {
  const [tipAmount, setTipAmount] = useState(100)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showTipDialog, setShowTipDialog] = useState(false)
  const [showCommissionDialog, setShowCommissionDialog] = useState(false)
  const [commissionSubmitted, setCommissionSubmitted] = useState(false)
  
  // Commission form state
  const [commissionForm, setCommissionForm] = useState({
    summary: "",
    needInvoice: "no",
    companyName: "",
    taxId: "",
    productType: "",
    specialRequirements: "",
    email: "",
    referenceImages: [] as File[],
  })

  const handleSubscribe = () => {
    setIsSubscribed(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCommissionForm({
        ...commissionForm,
        referenceImages: [...commissionForm.referenceImages, ...Array.from(e.target.files)],
      })
    }
  }

  const removeImage = (index: number) => {
    setCommissionForm({
      ...commissionForm,
      referenceImages: commissionForm.referenceImages.filter((_, i) => i !== index),
    })
  }

  const handleCommissionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In real app, this would send to the backend and then to creator's dashboard
    setCommissionSubmitted(true)
  }

  const resetCommissionForm = () => {
    setCommissionForm({
      summary: "",
      needInvoice: "no",
      companyName: "",
      taxId: "",
      productType: "",
      specialRequirements: "",
      email: "",
      referenceImages: [],
    })
    setCommissionSubmitted(false)
    setShowCommissionDialog(false)
  }

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      {/* Creator Hero Section */}
      <section className="container mx-auto px-4 pt-24 pb-12">
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 p-8 backdrop-blur-sm md:p-12">
          {/* Background planet effect */}
          <div
            className="absolute right-0 top-0 h-64 w-64 rounded-full opacity-30 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${creatorData.color} 0%, transparent 70%)`,
            }}
          />

          <div className="relative z-10 grid gap-8 md:grid-cols-[auto_1fr]">
            {/* Planet Avatar */}
            <div className="flex justify-center md:justify-start">
              <div className="relative">
                <div
                  className="h-32 w-32 rounded-full md:h-40 md:w-40"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${creatorData.color} 0%, ${creatorData.color}80 100%)`,
                    boxShadow: `0 0 60px ${creatorData.color}60, inset 0 0 30px ${creatorData.color}40`,
                  }}
                />
                <div className="absolute -bottom-2 -right-2 rounded-full border-4 border-background bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  認證
                </div>
              </div>
            </div>

            {/* Creator Info */}
            <div className="space-y-4">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">{creatorData.name}</h1>
                <p className="text-lg text-muted-foreground">{creatorData.creator}</p>
              </div>

              <p className="text-pretty text-muted-foreground">{creatorData.description}</p>

              <div className="flex flex-wrap gap-2">
                {creatorData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Stats - Only showing followers, rating, and joinedDate */}
              <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4 md:grid-cols-3">
                <div>
                  <div className="text-2xl font-bold text-foreground">{creatorData.followers.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">追蹤者</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-2xl font-bold text-foreground">
                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    {creatorData.rating}
                  </div>
                  <div className="text-sm text-muted-foreground">{creatorData.totalReviews} 評價</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">加入於 {creatorData.joinedDate}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="bg-gradient-to-r from-primary to-secondary">
                  <Heart className="mr-2 h-4 w-4" />
                  追蹤創作者
                </Button>

                {/* Super Subscription / Tip Button */}
                {creatorData.superSubscription.enabled ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600">
                        <Crown className="mr-2 h-4 w-4" />
                        超級訂閱
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md border-yellow-500/30 bg-background/95 backdrop-blur-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                          <Crown className="h-6 w-6 text-yellow-500" />
                          超級訂閱 - {creatorData.name}
                        </DialogTitle>
                      </DialogHeader>

                      {!isSubscribed ? (
                        <div className="space-y-6 py-4">
                          {/* Price */}
                          <div className="rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 text-center">
                            <p className="mb-2 text-sm text-muted-foreground">每月訂閱價格</p>
                            <p className="text-4xl font-bold text-yellow-500">
                              NT$ {creatorData.superSubscription.price}
                              <span className="text-lg font-normal text-muted-foreground">/月</span>
                            </p>
                          </div>

                          {/* Benefits */}
                          <div>
                            <h4 className="mb-3 font-bold text-foreground">訂閱福利</h4>
                            <ul className="space-y-3">
                              {creatorData.superSubscription.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center gap-3 text-foreground">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20">
                                    <Sparkles className="h-4 w-4 text-yellow-500" />
                                  </div>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <Button
                            onClick={handleSubscribe}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
                            size="lg"
                          >
                            <Crown className="mr-2 h-4 w-4" />
                            立即訂閱
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-6 py-4 text-center">
                          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                            <Check className="h-10 w-10 text-green-500" />
                          </div>
                          <div>
                            <h3 className="mb-2 text-xl font-bold text-foreground">訂閱成功!</h3>
                            <p className="text-muted-foreground">
                              感謝你成為 {creatorData.name} 的超級粉絲!
                            </p>
                          </div>
                          <div className="rounded-lg bg-white/5 p-4">
                            <p className="mb-2 text-sm text-muted-foreground">你現在可以享受以下福利:</p>
                            <ul className="space-y-1 text-sm">
                              {creatorData.superSubscription.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center gap-2 text-foreground">
                                  <Check className="h-4 w-4 text-green-500" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                ) : (
                  /* Tip Mode - When super subscription is not enabled */
                  <Dialog open={showTipDialog} onOpenChange={setShowTipDialog}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600">
                        <Gift className="mr-2 h-4 w-4" />
                        打賞支持
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md border-pink-500/30 bg-background/95 backdrop-blur-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                          <Gift className="h-6 w-6 text-pink-500" />
                          打賞 - {creatorData.name}
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-6 py-4">
                        <p className="text-center text-muted-foreground">
                          喜歡這位創作者的作品嗎?<br />
                          用打賞來表達你的支持吧!
                        </p>

                        {/* Quick amounts */}
                        <div className="grid grid-cols-4 gap-2">
                          {[50, 100, 200, 500].map((amount) => (
                            <Button
                              key={amount}
                              variant={tipAmount === amount ? "default" : "outline"}
                              onClick={() => setTipAmount(amount)}
                              className={tipAmount === amount ? "bg-pink-500" : "bg-transparent"}
                            >
                              ${amount}
                            </Button>
                          ))}
                        </div>

                        {/* Custom amount */}
                        <div className="flex items-center gap-2">
                          <span className="text-foreground">NT$</span>
                          <Input
                            type="number"
                            value={tipAmount}
                            onChange={(e) => setTipAmount(Number(e.target.value))}
                            className="bg-white/5"
                            min={10}
                          />
                        </div>

                        <Button
                          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                          size="lg"
                        >
                          <Coins className="mr-2 h-4 w-4" />
                          送出 NT$ {tipAmount}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                <Button size="lg" variant="outline" className="bg-transparent">
                  <Share2 className="mr-2 h-4 w-4" />
                  分享
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="container mx-auto px-4 pb-20">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="mb-8 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="products">商品</TabsTrigger>
            <TabsTrigger value="commissions">接案作品</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">所有商品</h2>
              <p className="text-sm text-muted-foreground">{products.length} 件商品</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} creatorId={creatorData.id} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            {/* Commission Request Section */}
            <div className="mb-8 rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm">
              <h3 className="mb-2 text-xl font-bold text-foreground">接受客製化委託</h3>
              <p className="mb-4 text-muted-foreground">
                我們提供各種客製化設計服務，包括品牌設計、插畫繪製、周邊商品設計等。歡迎與我們討論您的需求!
              </p>
              
              {/* Commission Request Dialog */}
              <Dialog open={showCommissionDialog} onOpenChange={setShowCommissionDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-secondary">
                    <Send className="mr-2 h-4 w-4" />
                    立即委託
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-primary/30 bg-background/95 backdrop-blur-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl">
                      委託 {creatorData.name} 客製化設計
                    </DialogTitle>
                  </DialogHeader>

                  {!commissionSubmitted ? (
                    <form onSubmit={handleCommissionSubmit} className="space-y-6 py-4">
                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">
                          電子郵件 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={commissionForm.email}
                          onChange={(e) => setCommissionForm({ ...commissionForm, email: e.target.value })}
                          placeholder="請輸入您的電子郵件，用於接收報價通知"
                          className="bg-white/5"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          創作者接受委託後，報價將發送至此信箱
                        </p>
                      </div>

                      {/* Summary */}
                      <div className="space-y-2">
                        <Label htmlFor="summary" className="text-foreground">
                          需求摘要 <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="summary"
                          value={commissionForm.summary}
                          onChange={(e) => setCommissionForm({ ...commissionForm, summary: e.target.value })}
                          placeholder="請簡述您的設計需求，例如：想要設計一組可愛的貓咪主題貼紙..."
                          className="min-h-[100px] bg-white/5"
                          required
                        />
                      </div>

                      {/* Need Invoice */}
                      <div className="space-y-2">
                        <Label className="text-foreground">
                          是否需要統編 <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={commissionForm.needInvoice}
                          onValueChange={(value) => setCommissionForm({ ...commissionForm, needInvoice: value })}
                        >
                          <SelectTrigger className="bg-white/5">
                            <SelectValue placeholder="請選擇" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">不需要</SelectItem>
                            <SelectItem value="yes">需要</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Company Info - Show if need invoice */}
                      {commissionForm.needInvoice === "yes" && (
                        <div className="space-y-4 rounded-lg border border-border/50 bg-white/5 p-4">
                          <div className="space-y-2">
                            <Label htmlFor="companyName" className="text-foreground">
                              公司名稱 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="companyName"
                              value={commissionForm.companyName}
                              onChange={(e) => setCommissionForm({ ...commissionForm, companyName: e.target.value })}
                              placeholder="請輸入公司名稱"
                              className="bg-white/5"
                              required={commissionForm.needInvoice === "yes"}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="taxId" className="text-foreground">
                              統一編號 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="taxId"
                              value={commissionForm.taxId}
                              onChange={(e) => setCommissionForm({ ...commissionForm, taxId: e.target.value })}
                              placeholder="請輸入統一編號"
                              className="bg-white/5"
                              required={commissionForm.needInvoice === "yes"}
                            />
                          </div>
                        </div>
                      )}

                      {/* Product Type */}
                      <div className="space-y-2">
                        <Label className="text-foreground">
                          想做的產品 <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={commissionForm.productType}
                          onValueChange={(value) => setCommissionForm({ ...commissionForm, productType: value })}
                          required
                        >
                          <SelectTrigger className="bg-white/5">
                            <SelectValue placeholder="請選擇產品類型" />
                          </SelectTrigger>
                          <SelectContent>
                            {productCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Reference Images */}
                      <div className="space-y-2">
                        <Label className="text-foreground">示意圖上傳</Label>
                        <div className="rounded-lg border-2 border-dashed border-border/50 p-4">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                            id="reference-images"
                          />
                          <label
                            htmlFor="reference-images"
                            className="flex cursor-pointer flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
                          >
                            <Upload className="h-8 w-8" />
                            <span>點擊上傳示意圖</span>
                            <span className="text-xs">支援 JPG、PNG 格式</span>
                          </label>
                        </div>
                        
                        {/* Preview uploaded images */}
                        {commissionForm.referenceImages.length > 0 && (
                          <div className="mt-3 grid grid-cols-4 gap-2">
                            {commissionForm.referenceImages.map((file, index) => (
                              <div key={index} className="group relative">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Reference ${index + 1}`}
                                  className="h-20 w-full rounded-lg object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                  x
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Special Requirements */}
                      <div className="space-y-2">
                        <Label htmlFor="specialRequirements" className="text-foreground">
                          特殊需求
                        </Label>
                        <Textarea
                          id="specialRequirements"
                          value={commissionForm.specialRequirements}
                          onChange={(e) => setCommissionForm({ ...commissionForm, specialRequirements: e.target.value })}
                          placeholder="請說明任何其他特殊需求，例如：希望的交期、特定顏色偏好等..."
                          className="min-h-[80px] bg-white/5"
                        />
                      </div>

                      {/* Info Box */}
                      <div className="rounded-lg bg-primary/10 p-4 text-sm">
                        <h4 className="mb-2 font-bold text-primary">委託流程說明</h4>
                        <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
                          <li>送出委託需求後，創作者將於 3-5 個工作天內回覆</li>
                          <li>創作者接受後，會將報價發送至您的電子信箱</li>
                          <li>點擊信件中的連結，前往「我的訂單」完成付款</li>
                          <li>付款完成後，創作者將開始設計製作</li>
                          <li>完成後由我們將產品配送至您手上</li>
                        </ol>
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowCommissionDialog(false)} className="bg-transparent">
                          取消
                        </Button>
                        <Button type="submit" className="bg-gradient-to-r from-primary to-secondary">
                          <Send className="mr-2 h-4 w-4" />
                          送出委託
                        </Button>
                      </DialogFooter>
                    </form>
                  ) : (
                    /* Success State */
                    <div className="space-y-6 py-8 text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                      </div>
                      <div>
                        <h3 className="mb-2 text-xl font-bold text-foreground">委託已送出!</h3>
                        <p className="text-muted-foreground">
                          感謝您的委託! 我們已將需求傳送給 {creatorData.name}。
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/5 p-4 text-left">
                        <h4 className="mb-2 font-bold text-foreground">後續流程</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                            創作者將於 3-5 個工作天內審核您的委託
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                            接受後，報價通知將發送至 {commissionForm.email}
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                            請透過信件連結前往付款，完成交易
                          </li>
                        </ul>
                      </div>
                      <Button onClick={resetCommissionForm} className="bg-gradient-to-r from-primary to-secondary">
                        完成
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            {/* Commission Works Gallery */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">過往作品</h2>
              {commissionWorks.map((work) => (
                <div
                  key={work.id}
                  className="overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm transition-all hover:border-primary/50"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={work.image || "/placeholder.svg"}
                      alt={work.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-bold text-foreground">{work.title}</h3>
                    <p className="mb-2 text-sm text-muted-foreground">客戶: {work.client}</p>
                    <p className="text-muted-foreground">{work.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
