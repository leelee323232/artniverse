"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { UniverseBackground } from "@/components/universe-background";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PostCard, type Post, type Comment } from "@/components/posts/PostCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import {
  // getEvents, // 等接後端 API 時再啟用
  // createEvents, // 等接後端 API 時再啟用
  type EventApplication,
} from "@/lib/creator/events-api";
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
  Image,
  Calendar,
  MapPin,
  CalendarPlus,
} from "lucide-react";
import Link from "next/link";

// Mock data
const stats = {
  totalSales: 45680,
  totalOrders: 234,
  totalProducts: 12,
  totalFollowers: 12500,
  pendingOrders: 8,
  pendingCommissions: 3,
};

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
];

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
];

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
];

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
    description:
      "為春季限定飲品設計可愛療癒風格的包裝插畫，需要3款不同口味的設計。",
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
    requirements: ["可提供多個設計方案", "需配合品牌色系"],
    applicants: 15,
    status: "applied",
  },
];

interface EventFormRow {
  name: string;
  time: string;
  address: string;
}

export default function CreatorPortalPage() {
  const router = useRouter();
  const { user, updateCreatorProfile } = useAuth();

  // Profile editing state
  const [profileData, setProfileData] = useState({
    avatar: user?.creatorProfile?.brandName || "",
    bio:
      user?.creatorProfile?.bio ||
      "專注於療癒系插畫創作，用溫暖的筆觸描繪生活中的小確幸。",
    links: user?.creatorProfile?.links || [
      { label: "Instagram", url: "https://instagram.com/starryart" },
      { label: "Facebook", url: "https://facebook.com/starryart" },
    ],
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Super subscription state
  const [subscriptionEnabled, setSubscriptionEnabled] = useState(
    user?.creatorProfile?.superSubscription?.enabled || false,
  );
  const [subscriptionPrice, setSubscriptionPrice] = useState(
    user?.creatorProfile?.superSubscription?.price || 99,
  );
  const [subscriptionBenefits, setSubscriptionBenefits] = useState<string[]>(
    user?.creatorProfile?.superSubscription?.benefits || [
      "每月獨家桌布",
      "新品搶先看",
      "專屬折扣碼",
    ],
  );
  const [newBenefit, setNewBenefit] = useState("");
  const [quoteAmount, setQuoteAmount] = useState(0);

  // Commission request status filter ("all" | "pending" | "quoted" | "paid")
  const [commissionFilter, setCommissionFilter] = useState<
    "all" | "pending" | "quoted" | "paid"
  >("all");

  const filteredCommissionRequests = commissionRequests
    .filter((r) => commissionFilter === "all" || r.status === commissionFilter)
    .slice()
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  // Quest dialog state
  const [selectedQuest, setSelectedQuest] = useState<
    (typeof specialQuests)[0] | null
  >(null);

  const [posts, setPosts] = useState<Post[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("creator_posts_data");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return [];
        }
      }
    }
    // 預設提供一筆 Threads 風格的模擬動態
    return [
      {
        id: "POST-001",
        authorName:
          user?.creatorProfile?.brandName || user?.name || "星空創作者",
        authorAvatar: "",
        isVerified: true,
        content:
          "好高興今天把「貼文牆」功能做出來了！✨\n完美的 Threads 串文排版，還能動態增加最多 10 張圖片網址！\n大家如果覺得排版不錯，歡迎在下面留言分享看法喔！🚀",
        images: ["/cute-notebook-with-stars.jpg", "/dreamy-postcards.jpg"],
        likes: 88,
        isLiked: false,
        comments: [
          {
            id: "C-01",
            userName: "開發小幫手",
            content: "這顆貼文牆元件寫得很精美，給過！",
            createdAt: "2026-07-14 15:40",
          },
        ],
        createdAt: "2026-07-14 12:00",
      },
    ];
  });

  // 當貼文陣列發生改變，自動同步至 LocalStorage
  useEffect(() => {
    localStorage.setItem("creator_posts_data", JSON.stringify(posts));
  }, [posts]);

  // 活動管理 state（目前為本地端暫存，之後再接後端 API）
  const [events, setEvents] = useState<EventApplication[]>([
    {
      id: "EVT-001",
      name: "星空市集擺攤",
      time: "2026-08-20 10:00",
      address: "台北市信義區松壽路 12 號",
      status: "approved",
      createdAt: "2026-07-10",
    },
    {
      id: "EVT-002",
      name: "療癒插畫粉絲見面會",
      time: "2026-09-05 14:00",
      address: "台中市西區美術館路 2 號",
      status: "pending",
      createdAt: "2026-07-18",
    },
  ]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [isSubmittingEvents, setIsSubmittingEvents] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // 載入時向後端 GET 取得活動申請列表（等有 API 時再啟用）
  // const loadEvents = async () => {
  //   setEventsLoading(true);
  //   try {
  //     const data = await getEvents();
  //     setEvents(data);
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setEventsLoading(false);
  //   }
  // };
  //
  // useEffect(() => {
  //   loadEvents();
  // }, []);

  const [eventForms, setEventForms] = useState<EventFormRow[]>([
    { name: "", time: "", address: "" },
  ]);

  const addEventForm = () => {
    setEventForms((prev) => [...prev, { name: "", time: "", address: "" }]);
  };

  const removeEventForm = (index: number) => {
    setEventForms((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index),
    );
  };

  const updateEventForm = (
    index: number,
    field: keyof EventFormRow,
    value: string,
  ) => {
    setEventForms((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  // 送出申請：目前先直接加入本地列表，狀態為「申請中」。
  // 之後接上後端時，改為呼叫 createEvents() 並重新 loadEvents()，並在此處理錯誤邏輯。
  const handleSubmitEvents = async () => {
    const validRows = eventForms
      .filter((row) => row.name.trim() && row.time.trim() && row.address.trim())
      .map((row) => ({
        name: row.name.trim(),
        time: row.time.trim(),
        address: row.address.trim(),
      }));
    if (validRows.length === 0) return;

    setIsSubmittingEvents(true);

    // === 本地端暫存版本 ===
    const now = Date.now();
    const newEvents: EventApplication[] = validRows.map((row, i) => ({
      id: `EVT-${now}-${i}`,
      name: row.name,
      time: row.time,
      address: row.address,
      status: "pending",
      createdAt: new Date().toISOString().substring(0, 10),
    }));
    setEvents((prev) => [...newEvents, ...prev]);

    // === 之後接後端 API 時改用以下邏輯 ===
    // try {
    //   await createEvents(validRows);
    //   await loadEvents();
    // } catch (err) {
    //   console.error(err);
    // }

    setEventForms([{ name: "", time: "", address: "" }]);
    setIsEventModalOpen(false);
    setIsSubmittingEvents(false);
  };

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImages, setNewPostImages] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    // 最多 10 張
    setNewPostImages(files.slice(0, 10));
  };

  const handleRemoveImage = (index: number) => {
    setNewPostImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    // 將 File 轉成可顯示的圖片網址（目前前端暫存）
    const validImages = newPostImages.map((file) => URL.createObjectURL(file));

    const newPost: Post = {
      id: `POST-${Date.now()}`,
      authorName: user?.creatorProfile?.brandName || user?.name || "未知創作者",
      authorAvatar: "",
      isVerified: true,
      content: newPostContent,
      images: validImages,
      likes: 0,
      isLiked: false,
      comments: [],
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    setPosts((prev) => [newPost, ...prev]);

    setNewPostContent("");
    setNewPostImages([]);
    setIsPostModalOpen(false);
  };

  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
            }
          : p,
      ),
    );
  };

  const handleAddCommentToPost = (postId: string, content: string) => {
    const newComment: Comment = {
      id: `C-${Date.now()}`,
      userName: user?.name || "訪客粉絲",
      content,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p,
      ),
    );
  };

  // Check if user is a creator
  if (!user) {
    router.push("/login");
    return null;
  }

  if (!user.isCreator) {
    router.push("/creator-apply");
    return null;
  }

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    updateCreatorProfile({
      bio: profileData.bio,
      links: profileData.links,
      superSubscription: {
        enabled: subscriptionEnabled,
        price: subscriptionPrice,
        benefits: subscriptionBenefits,
      },
    });
    setIsSavingProfile(false);
    setIsEditingProfile(false);
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setSubscriptionBenefits([...subscriptionBenefits, newBenefit.trim()]);
      setNewBenefit("");
    }
  };

  const removeBenefit = (index: number) => {
    setSubscriptionBenefits(subscriptionBenefits.filter((_, i) => i !== index));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-500";
      case "shipped":
        return "bg-blue-500/20 text-blue-500";
      case "completed":
        return "bg-green-500/20 text-green-500";
      case "in-progress":
        return "bg-purple-500/20 text-purple-500";
      case "quoted":
        return "bg-blue-500/20 text-blue-500";
      case "paid":
        return "bg-green-500/20 text-green-500";
      case "designing":
        return "bg-purple-500/20 text-purple-500";
      default:
        return "bg-muted";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "待處理";
      case "shipped":
        return "已出貨";
      case "completed":
        return "已完成";
      case "in-progress":
        return "進行中";
      case "quoted":
        return "已報價";
      case "paid":
        return "已付款";
      case "designing":
        return "設計中";
      default:
        return status;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "S":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
      case "A":
        return "bg-purple-500/20 text-purple-400";
      case "B":
        return "bg-blue-500/20 text-blue-400";
      case "C":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-muted";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "S":
        return <Zap className="h-4 w-4" />;
      case "A":
        return <Swords className="h-4 w-4" />;
      case "B":
        return <Shield className="h-4 w-4" />;
      case "C":
        return <Target className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-500";
      case "pending":
        return "bg-yellow-500/20 text-yellow-500";
      case "ended":
        return "bg-muted text-muted-foreground";
      case "cancelled":
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-muted";
    }
  };

  const getEventStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "已通過";
      case "pending":
        return "申請中";
      case "ended":
        return "已結束";
      case "cancelled":
        return "已取消";
      default:
        return status;
    }
  };

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">
              創作者控制台
            </h1>
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
                <p className="text-sm text-muted-foreground">本月銷售額</p>
                <p className="text-2xl font-bold text-foreground">
                  NT$ {stats.totalSales.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-primary/20 p-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">本月訂單數</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalOrders}
                </p>
                {stats.pendingOrders > 0 && (
                  <p className="text-xs text-yellow-500">
                    {stats.pendingOrders} 筆待處理
                  </p>
                )}
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
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalProducts}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalFollowers.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-primary/20 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs - Order: 商店設定 - 訂單管理 - 商品管理 - 接案請求 - 企業委託 */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-5xl grid-cols-7">
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
              企業委託
            </TabsTrigger>
            <TabsTrigger value="events">
              <Calendar className="mr-1 h-4 w-4" />
              活動管理
            </TabsTrigger>
            <TabsTrigger value="posts">上傳貼文</TabsTrigger>
          </TabsList>

          {/* Profile Tab with Super Subscription */}
          <TabsContent value="profile" className="space-y-6">
            {/* Shop Info Card */}
            <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">
                  商店資訊編輯
                </h2>
                {!isEditingProfile ? (
                  <Button
                    onClick={() => setIsEditingProfile(true)}
                    variant="outline"
                    className="bg-transparent"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    編輯
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsEditingProfile(false)}
                      variant="outline"
                      className="bg-transparent"
                    >
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
                          {user.creatorProfile?.brandName?.charAt(0) ||
                            user.name.charAt(0)}
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
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            bio: e.target.value,
                          })
                        }
                        className="min-h-[120px] bg-white/5"
                        placeholder="介紹你的創作風格和理念..."
                      />
                    ) : (
                      <p className="rounded-lg bg-white/5 p-4 text-foreground">
                        {profileData.bio}
                      </p>
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
                                  const newLinks = [...profileData.links];
                                  newLinks[index].label = e.target.value;
                                  setProfileData({
                                    ...profileData,
                                    links: newLinks,
                                  });
                                }}
                                className="w-32 bg-white/5"
                                placeholder="名稱"
                              />
                              <Input
                                value={link.url}
                                onChange={(e) => {
                                  const newLinks = [...profileData.links];
                                  newLinks[index].url = e.target.value;
                                  setProfileData({
                                    ...profileData,
                                    links: newLinks,
                                  });
                                }}
                                className="flex-1 bg-white/5"
                                placeholder="https://..."
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newLinks = profileData.links.filter(
                                    (_, i) => i !== index,
                                  );
                                  setProfileData({
                                    ...profileData,
                                    links: newLinks,
                                  });
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
                              links: [
                                ...profileData.links,
                                { label: "", url: "" },
                              ],
                            });
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
                  <h2 className="text-xl font-bold text-foreground">
                    超級訂閱
                  </h2>
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
                        <span className="text-xs text-muted-foreground">
                          平台將抽取 10% 服務費
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          value={subscriptionPrice}
                          onChange={(e) =>
                            setSubscriptionPrice(Number(e.target.value))
                          }
                          className="w-32 bg-white/5"
                          min={30}
                          max={9999}
                        />
                        <div className="flex gap-2">
                          {[49, 99, 199, 299].map((price) => (
                            <Button
                              key={price}
                              variant={
                                subscriptionPrice === price
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => setSubscriptionPrice(price)}
                              className={
                                subscriptionPrice === price
                                  ? "bg-primary"
                                  : "bg-transparent"
                              }
                            >
                              ${price}
                            </Button>
                          ))}
                        </div>
                      </div>
                      {subscriptionPrice > 0 && (
                        <div className="mt-2 rounded-lg bg-green-500/10 p-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              設定金額
                            </span>
                            <span className="text-foreground">
                              NT$ {subscriptionPrice}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              平台服務費 (10%)
                            </span>
                            <span className="text-red-400">
                              - NT$ {Math.round(subscriptionPrice * 0.1)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between border-t border-border/30 pt-2">
                            <span className="font-medium text-foreground">
                              實際收入
                            </span>
                            <span className="text-lg font-bold text-green-500">
                              NT$ {Math.round(subscriptionPrice * 0.9)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label>訂閱福利</Label>
                      <div className="space-y-2">
                        {subscriptionBenefits.map((benefit, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 rounded-lg bg-white/5 p-3"
                          >
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                            <span className="flex-1 text-foreground">
                              {benefit}
                            </span>
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
                        <Button
                          onClick={addBenefit}
                          variant="outline"
                          className="bg-transparent"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {!subscriptionEnabled && (
                  <div className="rounded-lg border border-dashed border-border/50 p-6 text-center">
                    <Coins className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-medium text-foreground">
                      打賞模式
                    </h3>
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
              <h2 className="mb-4 text-xl font-bold text-foreground">
                最近訂單
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        訂單編號
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        顧客
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        商品
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        數量
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        金額
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        狀態
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border/30">
                        <td className="px-4 py-3 text-sm text-foreground">
                          {order.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {order.customer}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {order.product}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {order.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          NT$ {order.total}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
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
                <Card
                  key={product.id}
                  className="border-border/50 bg-card/30 p-4 backdrop-blur-sm"
                >
                  <div className="mb-3 aspect-square overflow-hidden rounded-lg">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="mb-1 font-bold text-foreground">
                    {product.name}
                  </h3>
                  <p className="mb-2 text-sm text-muted-foreground">
                    NT$ {product.price}
                  </p>
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      庫存: {product.stock}
                    </span>
                    <span className="text-muted-foreground">
                      已售: {product.sales}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      編輯
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent text-destructive hover:text-destructive"
                    >
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
                  <Badge
                    variant="outline"
                    onClick={() =>
                      setCommissionFilter((prev) =>
                        prev === "pending" ? "all" : "pending",
                      )
                    }
                    className={`cursor-pointer border-yellow-500/30 text-yellow-500 transition-colors hover:bg-yellow-500/10 ${
                      commissionFilter === "pending"
                        ? "bg-yellow-500/20 ring-1 ring-yellow-500/50"
                        : ""
                    }`}
                  >
                    {
                      commissionRequests.filter((r) => r.status === "pending")
                        .length
                    }{" "}
                    待處理
                  </Badge>
                  <Badge
                    variant="outline"
                    onClick={() =>
                      setCommissionFilter((prev) =>
                        prev === "quoted" ? "all" : "quoted",
                      )
                    }
                    className={`cursor-pointer border-blue-500/30 text-blue-500 transition-colors hover:bg-blue-500/10 ${
                      commissionFilter === "quoted"
                        ? "bg-blue-500/20 ring-1 ring-blue-500/50"
                        : ""
                    }`}
                  >
                    {
                      commissionRequests.filter((r) => r.status === "quoted")
                        .length
                    }{" "}
                    已報價
                  </Badge>
                  <Badge
                    variant="outline"
                    onClick={() =>
                      setCommissionFilter((prev) =>
                        prev === "paid" ? "all" : "paid",
                      )
                    }
                    className={`cursor-pointer border-green-500/30 text-green-500 transition-colors hover:bg-green-500/10 ${
                      commissionFilter === "paid"
                        ? "bg-green-500/20 ring-1 ring-green-500/50"
                        : ""
                    }`}
                  >
                    {
                      commissionRequests.filter((r) => r.status === "paid")
                        .length
                    }{" "}
                    已付款
                  </Badge>
                </div>
              </div>
              <div className="space-y-4">
                {filteredCommissionRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-lg border border-border/50 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="font-bold text-foreground">
                            {request.title}
                          </h3>
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusText(request.status)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {request.productType}
                          </Badge>
                        </div>
                        <p className="mb-3 text-sm text-muted-foreground">
                          {request.summary}
                        </p>

                        {request.specialRequirements && (
                          <div className="mb-3 rounded-lg bg-white/5 p-3">
                            <p className="text-xs text-muted-foreground">
                              特殊需求:
                            </p>
                            <p className="text-sm text-foreground">
                              {request.specialRequirements}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span>客戶: {request.customer}</span>
                          <span>Email: {request.email}</span>
                          <span>日期: {request.createdAt}</span>
                          {request.needInvoice && (
                            <span className="text-yellow-500">
                              需要統編: {request.companyName} ({request.taxId})
                            </span>
                          )}
                        </div>

                        {request.status === "quoted" && request.quotedPrice && (
                          <div className="mt-3 flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">
                              已報價:
                            </span>
                            <span className="font-bold text-primary">
                              NT$ {request.quotedPrice.toLocaleString()}
                            </span>
                            <span className="text-muted-foreground">
                              （等待客戶付款）
                            </span>
                          </div>
                        )}

                        {request.status === "paid" && request.quotedPrice && (
                          <div className="mt-3 flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-500">
                              客戶已付款 NT${" "}
                              {request.quotedPrice.toLocaleString()}
                            </span>
                            <span className="text-muted-foreground">
                              - 請開始設計製作
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex flex-col gap-2">
                        {request.status === "pending" && (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-primary to-secondary"
                                >
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
                                    <h4 className="mb-2 font-bold text-foreground">
                                      {request.title}
                                    </h4>
                                    <p className="mb-2 text-sm text-muted-foreground">
                                      {request.summary}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      產品類型: {request.productType}
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Label>報價金額 (NT$)</Label>
                                      <span className="text-xs text-muted-foreground">
                                        平台將抽取 10% 服務費
                                      </span>
                                    </div>
                                    <Input
                                      type="number"
                                      placeholder="請輸入報價金額"
                                      className="bg-white/5"
                                      min={100}
                                      value={quoteAmount || ""}
                                      onChange={(e) =>
                                        setQuoteAmount(Number(e.target.value))
                                      }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      報價將發送至客戶信箱: {request.email}
                                    </p>
                                    {quoteAmount > 0 && (
                                      <div className="mt-2 rounded-lg bg-green-500/10 p-3">
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="text-muted-foreground">
                                            報價金額
                                          </span>
                                          <span className="text-foreground">
                                            NT$ {quoteAmount.toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="text-muted-foreground">
                                            平台服務費 (10%)
                                          </span>
                                          <span className="text-red-400">
                                            - NT${" "}
                                            {Math.round(
                                              quoteAmount * 0.1,
                                            ).toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between border-t border-border/30 pt-2">
                                          <span className="font-medium text-foreground">
                                            實際收入
                                          </span>
                                          <span className="text-lg font-bold text-green-500">
                                            NT${" "}
                                            {Math.round(
                                              quoteAmount * 0.9,
                                            ).toLocaleString()}
                                          </span>
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
                                      <li>
                                        完成後由 ARTNIVERSE 寄送產品給客戶
                                      </li>
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
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent text-destructive hover:text-destructive"
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              拒絕
                            </Button>
                          </>
                        )}
                        {request.status === "quoted" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent"
                          >
                            <MessageSquare className="mr-1 h-4 w-4" />
                            聯繫客戶
                          </Button>
                        )}
                        {request.status === "paid" && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                          >
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
                  <h2 className="text-2xl font-bold text-foreground">
                    冒險者公會 - 企業委託公佈欄
                  </h2>
                  <p className="text-muted-foreground">
                    由 ARTNIVERSE
                    精選的企業合作案，依照你的風格標籤推薦適合的委託
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
                    <Badge
                      className={`${getDifficultyColor(quest.difficulty)} flex items-center gap-1 px-3 py-1`}
                    >
                      {getDifficultyIcon(quest.difficulty)}
                      <span className="font-bold">{quest.difficulty}級</span>
                    </Badge>
                  </div>

                  <div className="p-6">
                    {/* Quest Header */}
                    <div className="mb-4 pr-16">
                      <h3 className="mb-1 text-lg font-bold text-foreground">
                        {quest.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        委託企業: {quest.client}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      {quest.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="border-amber-500/30 text-amber-400"
                        >
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
                          <Badge className="bg-green-500/20 text-green-500">
                            開放申請
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-500/20 text-blue-500">
                            已申請
                          </Badge>
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
                              <DialogTitle className="mb-2 text-xl">
                                {quest.title}
                              </DialogTitle>
                              <p className="text-sm text-muted-foreground">
                                委託企業: {quest.client}
                              </p>
                            </div>
                            <Badge
                              className={`${getDifficultyColor(quest.difficulty)} flex items-center gap-1 px-3 py-1`}
                            >
                              {getDifficultyIcon(quest.difficulty)}
                              <span className="font-bold">
                                {quest.difficulty}級委託
                              </span>
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
                                  <p className="text-sm text-muted-foreground">
                                    委託報酬
                                  </p>
                                  <p className="text-xl font-bold text-yellow-500">
                                    {quest.reward}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">
                                  截止日期
                                </p>
                                <p className="font-medium text-foreground">
                                  {quest.deadline}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <h4 className="mb-2 font-bold text-foreground">
                              委託說明
                            </h4>
                            <p className="text-muted-foreground">
                              {quest.description}
                            </p>
                          </div>

                          {/* Requirements */}
                          <div>
                            <h4 className="mb-2 font-bold text-foreground">
                              注意事項
                            </h4>
                            <ul className="space-y-2">
                              {quest.requirements.map((req, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <AlertCircle className="mt-0.5 h-4 w-4 text-amber-500" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Tags */}
                          <div>
                            <h4 className="mb-2 font-bold text-foreground">
                              相關標籤
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {quest.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="border-amber-500/30 text-amber-400"
                                >
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

          {/* 活動管理 Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    活動管理
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    提出活動資訊申請，送出後將交由管理員審核，並在下方追蹤審核狀態。
                  </p>
                </div>

                {/* 彈出式新增活動視窗 */}
                <Dialog
                  open={isEventModalOpen}
                  onOpenChange={setIsEventModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="gap-1.5 bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/20">
                      <Plus className="h-4 w-4" />
                      新增活動申請
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-h-[85vh] overflow-y-auto border-primary/30 bg-background/95 backdrop-blur-md sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <CalendarPlus className="h-5 w-5 text-primary" />
                        提出活動資訊申請
                      </DialogTitle>
                    </DialogHeader>

                    <p className="text-sm text-muted-foreground">
                      條列式填寫活動資訊，送出後將交由管理員審核。
                    </p>

                    <div className="space-y-4 py-2">
                      {eventForms.map((form, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-border/50 bg-white/5 p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              活動 {index + 1}
                            </span>
                            {eventForms.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeEventForm(index)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label>活動名稱</Label>
                              <Input
                                value={form.name}
                                onChange={(e) =>
                                  updateEventForm(index, "name", e.target.value)
                                }
                                placeholder="例如：星空市集擺攤"
                                className="bg-white/5"
                              />
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>時間</Label>
                                <Input
                                  type="datetime-local"
                                  value={form.time}
                                  onChange={(e) =>
                                    updateEventForm(
                                      index,
                                      "time",
                                      e.target.value,
                                    )
                                  }
                                  className="bg-white/5"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>地址</Label>
                                <Input
                                  value={form.address}
                                  onChange={(e) =>
                                    updateEventForm(
                                      index,
                                      "address",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="例如：台北市信義區松壽路 12 號"
                                  className="bg-white/5"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <DialogFooter>
                      <Button
                        onClick={handleSubmitEvents}
                        disabled={isSubmittingEvents}
                        className="bg-gradient-to-r from-primary to-secondary"
                      >
                        {isSubmittingEvents ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            送出中...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            送出申請
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* 狀態統計 */}
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="border-green-500/30 text-green-500"
                >
                  {events.filter((e) => e.status === "approved").length} 已通過
                </Badge>
                <Badge
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-500"
                >
                  {events.filter((e) => e.status === "pending").length} 申請中
                </Badge>
                <Badge
                  variant="outline"
                  className="border-border/50 text-muted-foreground"
                >
                  {events.filter((e) => e.status === "ended").length} 已結束
                </Badge>
                <Badge
                  variant="outline"
                  className="border-red-500/30 text-red-500"
                >
                  {events.filter((e) => e.status === "cancelled").length} 已取消
                </Badge>
              </div>

              {eventsLoading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  載入活動申請中...
                </div>
              ) : events.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          活動名稱
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          時間
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          地址
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          申請日期
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          審核狀態
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((evt) => (
                        <tr key={evt.id} className="border-b border-border/30">
                          <td className="px-4 py-3 text-sm font-medium text-foreground">
                            {evt.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {evt.time}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {evt.address}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {evt.createdAt}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={getEventStatusColor(evt.status)}>
                              {getEventStatusText(evt.status)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border/50 py-16 text-center">
                  <Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium text-foreground">
                    尚無活動申請
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    點擊「新增活動申請」填寫活動資訊並送出，即可在此追蹤審核狀態。
                  </p>
                  <Button
                    onClick={() => setIsEventModalOpen(true)}
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    新增活動申請
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    貼文牆
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    發佈創作動態、新品花絮，與追蹤粉絲進行零距離留言互動。
                  </p>
                </div>

                {/* 彈出式新貼文發佈視窗 */}
                <Dialog
                  open={isPostModalOpen}
                  onOpenChange={setIsPostModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-primary to-secondary gap-1.5 shadow-lg shadow-primary/20">
                      <Plus className="h-4 w-4" />
                      發佈新貼文
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="overflow-hidden rounded-2xl border border-white/10 bg-[#101010] p-0 text-white shadow-2xl sm:max-w-xl">
                    {/* Threads Header */}
                    <div className="flex h-14 items-center justify-between border-b border-white/10 px-5">
                      <Button
                        variant="ghost"
                        onClick={() => setIsPostModalOpen(false)}
                        className="h-auto p-0 text-sm font-medium text-white/70 hover:bg-transparent hover:text-white"
                      >
                        取消
                      </Button>

                      <h2 className="text-base font-semibold tracking-tight">
                        新貼文
                      </h2>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                      ></Button>
                    </div>

                    <div className="space-y-1 max-h-[60vh] overflow-y-auto px-0 py-2">
                      {/* 創作者資訊 + 發文輸入 */}
                      <div className="flex gap-4 px-5 pt-2">
                        {/* 頭像 */}
                        <div className="flex-shrink-0">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-base font-bold text-white shadow-md">
                            {user?.creatorProfile?.brandName
                              ? user.creatorProfile.brandName.substring(0, 1)
                              : user?.name
                                ? user.name.substring(0, 1)
                                : "創"}
                          </div>
                        </div>

                        {/* 右側內容 */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                              {user?.creatorProfile?.brandName ||
                                user?.name ||
                                "創作者"}
                            </span>

                            <button
                              type="button"
                              className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80 transition hover:bg-white/20"
                            ></button>
                          </div>

                          <Textarea
                            id="post-content"
                            placeholder="有什麼新鮮事？"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            maxLength={500}
                            className="mt-3 min-h-[80px] resize-none border-0 bg-transparent p-0 text-lg leading-7 text-white shadow-none placeholder:text-white/35 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />

                          <div className="mt-3 flex items-center gap-3">
                            <span className="text-xs text-white/35">
                              {newPostImages.length}/10 張圖片
                            </span>

                            <span
                              className={`text-xs ${
                                newPostContent.length > 450
                                  ? "text-yellow-400"
                                  : "text-white/30"
                              }`}
                            >
                              {newPostContent.length}/500
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 圖片連結清單 */}
                      <div className="space-y-1 px-5">
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />

                        <label
                          htmlFor="image-upload"
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                        >
                          <Image className="h-5 w-5" />
                        </label>

                        {/* 圖片預覽 */}
                        {newPostImages.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-xl">
                            {newPostImages.map((file, index) => (
                              <div
                                key={index}
                                className="relative aspect-square overflow-hidden rounded-xl"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`預覽 ${index + 1}`}
                                  className="h-full w-full object-cover"
                                />

                                <Button
                                  type="button"
                                  size="icon"
                                  variant="destructive"
                                  className="absolute right-2 top-2 h-7 w-7 rounded-full"
                                  onClick={() =>
                                    setNewPostImages(
                                      newPostImages.filter(
                                        (_, i) => i !== index,
                                      ),
                                    )
                                  }
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter className="justify-end px-5 pb-2">
                      <Button
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim()}
                        className="rounded-full bg-white px-6 text-black hover:bg-white/90"
                      >
                        發佈
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* 串文串流清單牆 */}
              {posts.length > 0 ? (
                <div className="mx-auto max-w-2xl space-y-4">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={handleLikePost}
                      onAddComment={handleAddCommentToPost}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border/50 py-16 text-center">
                  <MessageSquare className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium text-foreground">
                    這裡空空如也
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    發佈你的第一串日常，開啟與太空粉絲的交流吧！
                  </p>

                  <Button
                    onClick={() => setIsPostModalOpen(true)}
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    發佈貼文
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
