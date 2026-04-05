"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import {
  Package,
  ShoppingBag,
  DollarSign,
  Users,
  MessageSquare,
  Plus,
  Eye,
  Edit,
  Trash2,
  Wallet,
  Camera,
  Link as LinkIcon,
  Crown,
  Scroll,
  Coins,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Sparkles,
  Save,
  Loader2,
  Swords,
  Shield,
  Target,
  Zap,
  Send,
} from "lucide-react"
import Link from "next/link"

// Mock data
const stats = {
  totalSales: 45680,
  totalOrders: 234,
  totalProducts: 12,
  totalFollowers: 12500,
  pendingOrders: 8,
  pendingCommissions: 3,
}

const recentOrders = [
  {
    id: "ORD-001",
    customer: "王小明",
    product: "星空筆記本",
    quantity: 2,
    total: 760,
    status: "pending",
    date: "2024-01-15",
  },
  {
    id: "ORD-002",
    customer: "李小華",
    product: "療癒小熊貼紙組",
    quantity: 1,
    total: 120,
    status: "shipped",
    date: "2024-01-14",
  },
  {
    id: "ORD-003",
    customer: "張美玲",
    product: "夢境明信片套組",
    quantity: 3,
    total: 750,
    status: "completed",
    date: "2024-01-13",
  },
]

const products = [
  {
    id: "1",
    name: "星空筆記本",
    price: 380,
    stock: 45,
    sales: 156,
    image: "/cute-notebook-with-stars.jpg",
    status: "active",
  },
  {
    id: "2",
    name: "療癒小熊貼紙組",
    price: 120,
    stock: 120,
    sales: 342,
    image: "/cute-bear-stickers.jpg",
    status: "active",
  },
  {
    id: "3",
    name: "夢境明信片套組",
    price: 250,
    stock: 68,
    sales: 89,
    image: "/dreamy-postcards.jpg",
    status: "active",
  },
]

// Commission requests from individual customers
const commissionRequests = [
  {
    id: "COM-001",
    customer: "甜點工作室",
    email: "bakery@example.com",
    title: "品牌吉祥物設計",
    productType: "T-shirt",
    needInvoice: true,
    companyName: "甜點工作室有限公司",
    taxId: "12345678",
    summary: "需要設計一個可愛的甜點主題吉祥物，用於製作T-shirt",
    specialRequirements: "希望以粉色系為主，風格要可愛療癒",
    status: "pending",
    createdAt: "2024-01-20",
  },
  {
    id: "COM-002",
    customer: "王先生",
    email: "wang@example.com",
    title: "婚禮插畫邀請卡",
    productType: "明信片",
    needInvoice: false,
    summary: "希望繪製婚禮插畫用於製作邀請卡",
    specialRequirements: "預計3月初結婚，希望能在2月中完成",
    status: "quoted",
    quotedPrice: 8500,
    createdAt: "2024-01-18",
  },
  {
    id: "COM-003",
    customer: "李小姐",
    email: "lee@example.com",
    title: "寵物似顏繪",
    productType: "海報",
    needInvoice: false,
    summary: "想要幫我的貓咪畫一幅可愛的似顏繪海報",
    specialRequirements: "貓咪是橘貓，希望背景是星空主題",
    status: "pending",
    createdAt: "2024-01-22",
  },
  {
    id: "COM-004",
    customer: "陳先生",
    email: "chen@example.com",
    title: "咖啡廳馬克杯設計",
    productType: "馬克杯",
    needInvoice: true,
    companyName: "慢時光咖啡",
    taxId: "87654321",
    summary: "設計咖啡廳專屬馬克杯圖案",
    specialRequirements: "需要有咖啡元素和店名Logo",
    status: "paid",
    quotedPrice: 12000,
    createdAt: "2024-01-15",
  },
]

// Special commission quests (like adventure guild board)
const specialQuests = [
  {
    id: "QUEST-001",
    title: "春季聯名企劃 - 飲料品牌包裝設計",
    client: "茶語飲品",
    reward: "NT$ 50,000 - 80,000",
    deadline: "2024-03-01",
    tags: ["包裝設計", "插畫", "療癒風"],
    difficulty: "A",
    description: "為春季限定飲品設計可愛療癒風格的包裝插畫，需要3款不同口味的設計。",
    requirements: [
      "具備商業包裝設計經驗",
      "可提供原始設計檔案",
      "需在2週內完成初稿",
    ],
    applicants: 12,
    status: "open",
  },
  {
    id: "QUEST-002",
    title: "兒童繪本插畫 - 環保主題",
    client: "綠色出版社",
    reward: "NT$ 30,000 - 45,000",
    deadline: "2024-03-15",
    tags: ["繪本", "兒童", "自然"],
    difficulty: "B",
    description: "為環保主題兒童繪本繪製10頁內頁插畫，風格需溫暖可愛。",
    requirements: [
      "有繪本或兒童插畫經驗",
      "可配合修改2-3次",
      "提供手繪或電繪皆可",
    ],
    applicants: 8,
    status: "open",
  },
  {
    id: "QUEST-003",
    title: "遊戲角色設計 - 奇幻風格",
    client: "星際遊戲工作室",
    reward: "NT$ 80,000 - 120,000",
    deadline: "2024-04-01",
    tags: ["角色設計", "遊戲", "奇幻"],
    difficulty: "S",
    description: "為新款手機遊戲設計5個主要角色，包含角色三視圖和表情包。",
    requirements: [
      "精通角色設計",
      "有遊戲美術經驗優先",
      "需簽署保密協議",
      "可長期配合",
    ],
    applicants: 25,
    status: "open",
  },
  {
    id: "QUEST-004",
    title: "品牌吉祥物設計 - 科技公司",
    client: "未來科技",
    reward: "NT$ 25,000 - 35,000",
    deadline: "2024-02-28",
    tags: ["吉祥物", "科技", "現代"],
    difficulty: "B",
    description: "設計一個代表科技創新的吉祥物，需要現代感但親切可愛。",
    requirements: [
      "可提供多個設計方案",
      "需配合品牌色系",
    ],
    applicants: 15,
    status: "applied",
  },
]

export default function CreatorPortalPage() {
  const router = useRouter()
  const { user, updateCreatorProfile } = useAuth()
  
  // Profile editing state
  const [profileData, setProfileData] = useState({
    avatar: user?.creatorProfile?.brandName || "",
    bio: user?.creatorProfile?.bio || "專注於療癒系插畫創作，用溫暖的筆觸描繪生活中的小確幸。",
    links: user?.creatorProfile?.links || [
      { label: "Instagram", url: "https://instagram.com/starryart" },
      { label: "Facebook", url: "https://facebook.com/starryart" },
    ],
  })
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Super subscription state
  const [subscriptionEnabled, setSubscriptionEnabled] = useState(
    user?.creatorProfile?.superSubscription?.enabled || false
  )
  const [subscriptionPrice, setSubscriptionPrice] = useState(
    user?.creatorProfile?.superSubscription?.price || 99
  )
  const [subscriptionBenefits, setSubscriptionBenefits] = useState<string[]>(
    user?.creatorProfile?.superSubscription?.benefits || ["每月獨家桌布", "新品搶先看", "專屬折扣碼"]
  )
  const [newBenefit, setNewBenefit] = useState("")
  const [quoteAmount, setQuoteAmount] = useState(0)

  // Quest dialog state
  const [selectedQuest, setSelectedQuest] = useState<typeof specialQuests[0] | null>(null)

  // Check if user is a creator
  if (!user) {
    router.push("/login")
    return null
  }

  if (!user.isCreator) {
    router.push("/creator-apply")
    return null
  }

  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    updateCreatorProfile({
      bio: profileData.bio,
      links: profileData.links,
      superSubscription: {
        enabled: subscriptionEnabled,
        price: subscriptionPrice,
        benefits: subscriptionBenefits,
      },
    })
    setIsSavingProfile(false)
    setIsEditingProfile(false)
  }

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setSubscriptionBenefits([...subscriptionBenefits, newBenefit.trim()])
      setNewBenefit("")
    }
  }

  const removeBenefit = (index: number) => {
    setSubscriptionBenefits(subscriptionBenefits.filter((_, i) => i !== index))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-500"
      case "shipped":
        return "bg-blue-500/20 text-blue-500"
      case "completed":
        return "bg-green-500/20 text-green-500"
      case "in-progress":
        return "bg-purple-500/20 text-purple-500"
      case "quoted":
        return "bg-blue-500/20 text-blue-500"
      case "paid":
        return "bg-green-500/20 text-green-500"
      case "designing":
        return "bg-purple-500/20 text-purple-500"
      default:
        return "bg-muted"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "待處理"
      case "shipped":
        return "已出貨"
      case "completed":
        return "已完成"
      case "in-progress":
        return "進行中"
      case "quoted":
        return "已報價"
      case "paid":
        return "已付款"
      case "designing":
        return "設計中"
      default:
        return status
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "S":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "A":
        return "bg-purple-500/20 text-purple-400"
      case "B":
        return "bg-blue-500/20 text-blue-400"
      case "C":
        return "bg-green-500/20 text-green-400"
      default:
        return "bg-muted"
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "S":
        return <Zap className="h-4 w-4" />
      case "A":
        return <Swords className="h-4 w-4" />
      case "B":
        return <Shield className="h-4 w-4" />
      case "C":
        return <Target className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">創作者控制台</h1>
            <p className="text-muted-foreground">管理你的商品、訂單與接案</p>
          </div>
          <div className="flex gap-3">
            <Link href="/creator-portal/wallet">
              <Button variant="outline" className="bg-transparent">
                <Wallet className="mr-2 h-4 w-4" />
                錢包
              </Button>
            </Link>
            <Link href="/creator-portal/products/new">
              <Button className="bg-gradient-to-r from-primary to-secondary">
                <Plus className="mr-2 h-4 w-4" />
                新增商品
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">總銷售額</p>
                <p className="text-2xl font-bold text-foreground">NT$ {stats.totalSales.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-primary/20 p-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">總訂單數</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
                {stats.pendingOrders > 0 && <p className="text-xs text-yellow-500">{stats.pendingOrders} 筆待處理</p>}
              </div>
              <div className="rounded-full bg-secondary/20 p-3">
                <ShoppingBag className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </Card>

          <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">商品數量</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalProducts}</p>
              </div>
              <div className="rounded-full bg-accent/20 p-3">
                <Package className="h-6 w-6 text-accent" />
              </div>
            </div>
          </Card>

          <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">追蹤者</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalFollowers.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-primary/20 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs - Order: 商店設定 - 訂單管理 - 商品管理 - 接案請求 - 特殊委託 */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-4xl grid-cols-5">
            <TabsTrigger value="profile">商店設定</TabsTrigger>
            <TabsTrigger value="orders">
              訂單管理
              {stats.pendingOrders > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {stats.pendingOrders}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="products">商品管理</TabsTrigger>
            <TabsTrigger value="commissions">
              接案請求
              {stats.pendingCommissions > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {stats.pendingCommissions}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="quests">
              <Scroll className="mr-1 h-4 w-4" />
              特殊委託
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab with Super Subscription */}
          <TabsContent value="profile" className="space-y-6">
            {/* Shop Info Card */}
            <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">商店資訊編輯</h2>
                {!isEditingProfile ? (
                  <Button onClick={() => setIsEditingProfile(true)} variant="outline" className="bg-transparent">
                    <Edit className="mr-2 h-4 w-4" />
                    編輯
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditingProfile(false)} variant="outline" className="bg-transparent">
                      取消
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="bg-gradient-to-r from-primary to-secondary"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          儲存中...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          儲存
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-primary to-secondary">
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-4xl font-bold text-primary-foreground">
                          {user.creatorProfile?.brandName?.charAt(0) || user.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    {isEditingProfile && (
                      <button className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <Camera className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    {user.creatorProfile?.brandName || user.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">創作者</p>
                </div>

                {/* Bio & Links */}
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <Label>商店簡介</Label>
                    {isEditingProfile ? (
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        className="min-h-[120px] bg-white/5"
                        placeholder="介紹你的創作風格和理念..."
                      />
                    ) : (
                      <p className="rounded-lg bg-white/5 p-4 text-foreground">{profileData.bio}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>社群連結</Label>
                    <div className="space-y-2">
                      {profileData.links.map((link, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4 text-muted-foreground" />
                          {isEditingProfile ? (
                            <>
                              <Input
                                value={link.label}
                                onChange={(e) => {
                                  const newLinks = [...profileData.links]
                                  newLinks[index].label = e.target.value
                                  setProfileData({ ...profileData, links: newLinks })
                                }}
                                className="w-32 bg-white/5"
                                placeholder="名稱"
                              />
                              <Input
                                value={link.url}
                                onChange={(e) => {
                                  const newLinks = [...profileData.links]
                                  newLinks[index].url = e.target.value
                                  setProfileData({ ...profileData, links: newLinks })
                                }}
                                className="flex-1 bg-white/5"
                                placeholder="https://..."
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newLinks = profileData.links.filter((_, i) => i !== index)
                                  setProfileData({ ...profileData, links: newLinks })
                                }}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {link.label}
                            </a>
                          )}
                        </div>
                      ))}
                      {isEditingProfile && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setProfileData({
                              ...profileData,
                              links: [...profileData.links, { label: "", url: "" }],
                            })
                          }}
                          className="bg-transparent"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          新增連結
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Super Subscription Card - Below Shop Info */}
            <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 p-3">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">超級訂閱</h2>
                  <p className="text-sm text-muted-foreground">
                    讓粉絲訂閱你的專屬內容，獲得穩定收入
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
                  <div className="space-y-1">
                    <Label className="text-base">啟用超級訂閱</Label>
                    <p className="text-sm text-muted-foreground">
                      {subscriptionEnabled
                        ? "已啟用，粉絲可以訂閱你的專屬內容"
                        : "未啟用，粉絲可以自由打賞支持你"}
                    </p>
                  </div>
                  <Switch
                    checked={subscriptionEnabled}
                    onCheckedChange={setSubscriptionEnabled}
                  />
                </div>

                {subscriptionEnabled && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label>訂閱金額 (NT$/月)</Label>
                        <span className="text-xs text-muted-foreground">平台將抽取 10% 服務費</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          value={subscriptionPrice}
                          onChange={(e) => setSubscriptionPrice(Number(e.target.value))}
                          className="w-32 bg-white/5"
                          min={30}
                          max={9999}
                        />
                        <div className="flex gap-2">
                          {[49, 99, 199, 299].map((price) => (
                            <Button
                              key={price}
                              variant={subscriptionPrice === price ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSubscriptionPrice(price)}
                              className={subscriptionPrice === price ? "bg-primary" : "bg-transparent"}
                            >
                              ${price}
                            </Button>
                          ))}
                        </div>
                      </div>
                      {subscriptionPrice > 0 && (
                        <div className="mt-2 rounded-lg bg-green-500/10 p-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">設定金額</span>
                            <span className="text-foreground">NT$ {subscriptionPrice}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">平台服務費 (10%)</span>
                            <span className="text-red-400">- NT$ {Math.round(subscriptionPrice * 0.1)}</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between border-t border-border/30 pt-2">
                            <span className="font-medium text-foreground">實際收入</span>
                            <span className="text-lg font-bold text-green-500">NT$ {Math.round(subscriptionPrice * 0.9)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label>訂閱福利</Label>
                      <div className="space-y-2">
                        {subscriptionBenefits.map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2 rounded-lg bg-white/5 p-3">
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                            <span className="flex-1 text-foreground">{benefit}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeBenefit(index)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newBenefit}
                          onChange={(e) => setNewBenefit(e.target.value)}
                          placeholder="新增福利項目..."
                          className="bg-white/5"
                          onKeyDown={(e) => e.key === "Enter" && addBenefit()}
                        />
                        <Button onClick={addBenefit} variant="outline" className="bg-transparent">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {!subscriptionEnabled && (
                  <div className="rounded-lg border border-dashed border-border/50 p-6 text-center">
                    <Coins className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-medium text-foreground">打賞模式</h3>
                    <p className="text-sm text-muted-foreground">
                      未啟用超級訂閱時，粉絲可以自由金額打賞支持你的創作
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    儲存設定
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
              <h2 className="mb-4 text-xl font-bold text-foreground">最近訂單</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">訂單編號</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">顧客</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">商品</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">數量</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">金額</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">狀態</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border/30">
                        <td className="px-4 py-3 text-sm text-foreground">{order.id}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{order.customer}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{order.product}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{order.quantity}</td>
                        <td className="px-4 py-3 text-sm text-foreground">NT$ {order.total}</td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm">
                            <Eye className="mr-1 h-4 w-4" />
                            查看
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id} className="border-border/50 bg-card/30 p-4 backdrop-blur-sm">
                  <div className="mb-3 aspect-square overflow-hidden rounded-lg">
                    <img src={product.image || "/placeholder.svg"} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <h3 className="mb-1 font-bold text-foreground">{product.name}</h3>
                  <p className="mb-2 text-sm text-muted-foreground">NT$ {product.price}</p>
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">庫存: {product.stock}</span>
                    <span className="text-muted-foreground">已售: {product.sales}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Edit className="mr-1 h-4 w-4" />
                      編輯
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Commission Requests Tab */}
          <TabsContent value="commissions" className="space-y-4">
            <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">接案請求</h2>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-yellow-500/30 text-yellow-500">
                    {commissionRequests.filter(r => r.status === "pending").length} 待處理
                  </Badge>
                  <Badge variant="outline" className="border-blue-500/30 text-blue-500">
                    {commissionRequests.filter(r => r.status === "quoted").length} 已報價
                  </Badge>
                  <Badge variant="outline" className="border-green-500/30 text-green-500">
                    {commissionRequests.filter(r => r.status === "paid").length} 已付款
                  </Badge>
                </div>
              </div>
              <div className="space-y-4">
                {commissionRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-lg border border-border/50 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="font-bold text-foreground">{request.title}</h3>
                          <Badge className={getStatusColor(request.status)}>{getStatusText(request.status)}</Badge>
                          <Badge variant="outline" className="text-xs">{request.productType}</Badge>
                        </div>
                        <p className="mb-3 text-sm text-muted-foreground">{request.summary}</p>
                        
                        {request.specialRequirements && (
                          <div className="mb-3 rounded-lg bg-white/5 p-3">
                            <p className="text-xs text-muted-foreground">特殊需求:</p>
                            <p className="text-sm text-foreground">{request.specialRequirements}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span>客戶: {request.customer}</span>
                          <span>Email: {request.email}</span>
                          <span>日期: {request.createdAt}</span>
                          {request.needInvoice && (
                            <span className="text-yellow-500">需要統編: {request.companyName} ({request.taxId})</span>
                          )}
                        </div>

                        {request.status === "quoted" && request.quotedPrice && (
                          <div className="mt-3 flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">已報價:</span>
                            <span className="font-bold text-primary">NT$ {request.quotedPrice.toLocaleString()}</span>
                            <span className="text-muted-foreground">（等待客戶付款）</span>
                          </div>
                        )}

                        {request.status === "paid" && request.quotedPrice && (
                          <div className="mt-3 flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-500">客戶已付款 NT$ {request.quotedPrice.toLocaleString()}</span>
                            <span className="text-muted-foreground">- 請開始設計製作</span>
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex flex-col gap-2">
                        {request.status === "pending" && (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" className="bg-gradient-to-r from-primary to-secondary">
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  接受並報價
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md border-primary/30 bg-background/95 backdrop-blur-md">
                                <DialogHeader>
                                  <DialogTitle>報價給客戶</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="rounded-lg bg-white/5 p-4">
                                    <h4 className="mb-2 font-bold text-foreground">{request.title}</h4>
                                    <p className="mb-2 text-sm text-muted-foreground">{request.summary}</p>
                                    <p className="text-xs text-muted-foreground">產品類型: {request.productType}</p>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Label>報價金額 (NT$)</Label>
                                      <span className="text-xs text-muted-foreground">平台將抽取 10% 服務費</span>
                                    </div>
                                    <Input
                                      type="number"
                                      placeholder="請輸入報價金額"
                                      className="bg-white/5"
                                      min={100}
                                      value={quoteAmount || ""}
                                      onChange={(e) => setQuoteAmount(Number(e.target.value))}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      報價將發送至客戶信箱: {request.email}
                                    </p>
                                    {quoteAmount > 0 && (
                                      <div className="mt-2 rounded-lg bg-green-500/10 p-3">
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="text-muted-foreground">報價金額</span>
                                          <span className="text-foreground">NT$ {quoteAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="text-muted-foreground">平台服務費 (10%)</span>
                                          <span className="text-red-400">- NT$ {Math.round(quoteAmount * 0.1).toLocaleString()}</span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between border-t border-border/30 pt-2">
                                          <span className="font-medium text-foreground">實際收入</span>
                                          <span className="text-lg font-bold text-green-500">NT$ {Math.round(quoteAmount * 0.9).toLocaleString()}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <Label>備註說明（選填）</Label>
                                    <Textarea
                                      placeholder="可說明報價包含的項目、預計製作時間等..."
                                      className="min-h-[80px] bg-white/5"
                                    />
                                  </div>

                                  <div className="rounded-lg bg-primary/10 p-3 text-xs text-muted-foreground">
                                    <p>送出報價後:</p>
                                    <ol className="mt-1 list-inside list-decimal space-y-1">
                                      <li>系統將發送報價通知至客戶信箱</li>
                                      <li>客戶點擊連結前往「我的訂單」付款</li>
                                      <li>付款完成後，您將收到通知開始設計</li>
                                      <li>完成後由 Artniverse 寄送產品給客戶</li>
                                    </ol>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                                    <Send className="mr-2 h-4 w-4" />
                                    送出報價
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" className="bg-transparent text-destructive hover:text-destructive">
                              <XCircle className="mr-1 h-4 w-4" />
                              拒絕
                            </Button>
                          </>
                        )}
                        {request.status === "quoted" && (
                          <Button variant="outline" size="sm" className="bg-transparent">
                            <MessageSquare className="mr-1 h-4 w-4" />
                            聯繫客戶
                          </Button>
                        )}
                        {request.status === "paid" && (
                          <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                            <CheckCircle className="mr-1 h-4 w-4" />
                            標記完成
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Special Quests Tab */}
          <TabsContent value="quests" className="space-y-6">
            {/* Quest Board Header */}
            <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-orange-900/20 p-6 backdrop-blur-sm">
              <div className="absolute right-0 top-0 h-32 w-32 bg-gradient-to-br from-yellow-500/20 to-transparent blur-2xl" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 p-4">
                  <Scroll className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">冒險者公會 - 特殊委託公佈欄</h2>
                  <p className="text-muted-foreground">
                    由 Artniverse 精選的企業合作案，依照你的風格標籤推薦適合的委託
                  </p>
                </div>
              </div>
            </div>

            {/* Quest Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {specialQuests.map((quest) => (
                <Card
                  key={quest.id}
                  className="relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-card/50 to-amber-950/20 backdrop-blur-sm transition-all hover:border-amber-500/50"
                >
                  {/* Difficulty Badge */}
                  <div className="absolute right-4 top-4">
                    <Badge className={`${getDifficultyColor(quest.difficulty)} flex items-center gap-1 px-3 py-1`}>
                      {getDifficultyIcon(quest.difficulty)}
                      <span className="font-bold">{quest.difficulty}級</span>
                    </Badge>
                  </div>

                  <div className="p-6">
                    {/* Quest Header */}
                    <div className="mb-4 pr-16">
                      <h3 className="mb-1 text-lg font-bold text-foreground">{quest.title}</h3>
                      <p className="text-sm text-muted-foreground">委託企業: {quest.client}</p>
                    </div>

                    {/* Tags */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      {quest.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-amber-500/30 text-amber-400">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Quest Info */}
                    <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span>{quest.reward}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>截止: {quest.deadline}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{quest.applicants} 人已申請</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {quest.status === "open" ? (
                          <Badge className="bg-green-500/20 text-green-500">開放申請</Badge>
                        ) : (
                          <Badge className="bg-blue-500/20 text-blue-500">已申請</Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                          onClick={() => setSelectedQuest(quest)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          查看委託詳情
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl border-amber-500/30 bg-background/95 backdrop-blur-md">
                        <DialogHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <DialogTitle className="mb-2 text-xl">{quest.title}</DialogTitle>
                              <p className="text-sm text-muted-foreground">委託企業: {quest.client}</p>
                            </div>
                            <Badge className={`${getDifficultyColor(quest.difficulty)} flex items-center gap-1 px-3 py-1`}>
                              {getDifficultyIcon(quest.difficulty)}
                              <span className="font-bold">{quest.difficulty}級委託</span>
                            </Badge>
                          </div>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                          {/* Reward Banner */}
                          <div className="rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Coins className="h-8 w-8 text-yellow-500" />
                                <div>
                                  <p className="text-sm text-muted-foreground">委託報酬</p>
                                  <p className="text-xl font-bold text-yellow-500">{quest.reward}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">截止日期</p>
                                <p className="font-medium text-foreground">{quest.deadline}</p>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <h4 className="mb-2 font-bold text-foreground">委託說明</h4>
                            <p className="text-muted-foreground">{quest.description}</p>
                          </div>

                          {/* Requirements */}
                          <div>
                            <h4 className="mb-2 font-bold text-foreground">注意事項</h4>
                            <ul className="space-y-2">
                              {quest.requirements.map((req, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <AlertCircle className="mt-0.5 h-4 w-4 text-amber-500" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Tags */}
                          <div>
                            <h4 className="mb-2 font-bold text-foreground">相關標籤</h4>
                            <div className="flex flex-wrap gap-2">
                              {quest.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="border-amber-500/30 text-amber-400">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          {quest.status === "open" ? (
                            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                              <Swords className="mr-2 h-4 w-4" />
                              申請接受委託
                            </Button>
                          ) : (
                            <Button disabled className="w-full">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              已申請此委託
                            </Button>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
