"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth, type User } from "@/lib/auth-context";
import {
  creatorApplicationOptions, myCreatorApplication, submitCreatorApplication,
  applicationError, applicationCanEdit,
  type CreatorApplicationOptions, type MyCreatorApplication,
} from "@/lib/creator-applications-api";
import { Navigation } from "@/components/navigation";
import { UniverseBackground } from "@/components/universe-background";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  CheckCircle2,
  Sparkles,
  Package,
  Users,
  Megaphone,
  Truck,
  Handshake,
  Home,
  PartyPopper,
} from "lucide-react";
import Link from "next/link";

export default function CreatorApplyPage() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <ApplyNotice><p role="status">確認登入中…</p></ApplyNotice>;
  if (!user) return <ApplyNotice><p>請先登入再提交創作者申請。</p><Button asChild><Link href="/login">前往登入</Link></Button></ApplyNotice>;
  return <CreatorApplyForm key={user.id} user={user} />;
}

function ApplyNotice({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background"><UniverseBackground /><Navigation />
    <main className="container relative z-10 mx-auto px-4 pb-20 pt-32"><div className="mx-auto max-w-3xl space-y-5 rounded-3xl border border-primary/20 bg-card/40 p-8">
      <h1 className="text-3xl font-bold">創作者申請</h1>{children}
    </div></main></div>;
}

function CreatorApplyForm({ user }: { user: User }) {
  const [formData, setFormData] = useState({
    email: user.email,
    realName: user.name,
    brandName: "",
    storePickup: "",
    phone: user.phone ?? "",
    birthday: user.birthday ?? "",
    address: user.address ?? "",
    bankCode: "",
    bankAccount: "",
    selectedCategories: [] as string[],
    creativePhilosophy: "",
    idFrontImage: null as File | null,
    idBackImage: null as File | null,
    agreeToContract: false,
  });
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [receipt, setReceipt] = useState<MyCreatorApplication | null>(null);
  const [options, setOptions] = useState<CreatorApplicationOptions | null>(null);
  const [latest, setLatest] = useState<MyCreatorApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [reload, setReload] = useState(0);
  const pending = useRef<FormData | null>(null);
  const busy = useRef(false);
  const active = useRef(true);

  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setLoadError("");
    void Promise.all([creatorApplicationOptions(controller.signal), myCreatorApplication(controller.signal)])
      .then(([settings, application]) => {
        if (controller.signal.aborted) return;
        setOptions(settings); setLatest(application);
        // Consent must be renewed whenever the displayed contract is refreshed.
        setFormData(previous => ({ ...previous, agreeToContract: false }));
      })
      .catch(err => { if (!controller.signal.aborted) setLoadError(applicationError(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      selectedCategories: checked
        ? [...prev.selectedCategories, category]
        : prev.selectedCategories.filter((c) => c !== category),
    }));
  };

  const handleFileChange = (
    field: "idFrontImage" | "idBackImage",
    file: File | null,
  ) => {
    setError("");
    if (file && options) {
      if (!options.imageTypes.includes(file.type)) {
        setFormData(prev => ({ ...prev, [field]: null }));
        setError("證件僅支援 JPG、PNG、WebP 圖片。");
        return;
      }
      if (file.size > options.maxImageBytes || file.size === 0) {
        setFormData(prev => ({ ...prev, [field]: null }));
        setError("證件圖片不可為空，每張最多 5 MB。");
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const sendApplication = async () => {
    if (busy.current || !options || loading || loadError) return;
    setError("");
    if (!pending.current) {
      if (!formData.agreeToContract || !formData.idFrontImage || !formData.idBackImage) {
        setError("請提供身分證正反面圖片，並閱讀及同意合約。"); return;
      }
      const body = new FormData();
      body.append("requestKey", crypto.randomUUID());
      for (const field of ["email", "realName", "brandName", "storePickup", "phone", "birthday", "address", "bankCode", "bankAccount", "creativePhilosophy"] as const) {
        body.append(field, formData[field].trim());
      }
      body.append("selectedCategories", JSON.stringify(formData.selectedCategories));
      body.append("agreeToContract", "1");
      body.append("contractVersion", options.contractVersion);
      body.append("contractHash", options.contractHash);
      body.append("idFrontImage", formData.idFrontImage);
      body.append("idBackImage", formData.idBackImage);
      // Keep the identical key, fields and files on uncertain retries; memory only.
      pending.current = body;
    }
    busy.current = true; setSaving(true); setFrozen(true);
    try {
      const application = await submitCreatorApplication(pending.current);
      if (!active.current) return;
      setReceipt(application); setLatest(application); setIsSubmitted(true);
      pending.current = null;
      setFormData(previous => ({ ...previous, idFrontImage: null, idBackImage: null, bankAccount: "" }));
    } catch (err) {
      if (!active.current) return;
      setError(applicationError(err));
      if (applicationCanEdit(err)) {
        pending.current = null; setFrozen(false);
        setReload(value => value + 1);
      }
    } finally {
      busy.current = false;
      if (active.current) setSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendApplication();
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <UniverseBackground />
        <Navigation />
        <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-12">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                申請已送出！
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                申請編號：{receipt?.id}。{receipt?.status === "approved" ? "申請已通過。" : receipt?.status === "rejected" ? "申請已退回，請重新載入確認原因。" : "資料已收到，請等待團隊審核。"}
              </p>
              <p className="text-foreground mb-8">
                請私訊{" "}
                <a
                  href="https://www.instagram.com/artniverse_?utm_source=ig_web_button_share_sheet&cplk=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  ARTNIVERSE IG
                </a>{" "}
                討論後續
              </p>
              <Link href="/">
                <Button className="bg-primary hover:bg-primary/90">
                  <Home className="w-4 h-4 mr-2" />
                  返回首頁
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) return <ApplyNotice><p role="status">載入申請狀態與合約中…</p></ApplyNotice>;
  if (loadError || !options) return <ApplyNotice>
    <p role="alert" className="text-destructive">{loadError || "無法載入申請設定。"}</p>
    <Button onClick={() => setReload(value => value + 1)}>重新載入</Button>
    <a href="/login/" target="_blank" rel="noopener noreferrer" className="ml-3 underline">另開分頁登入</a>
  </ApplyNotice>;
  if (user.is_creator || latest?.status === "approved" || latest?.status === "pending") return <ApplyNotice>
    <p>{user.is_creator || latest?.status === "approved" ? "你已具有創作者身分，無需重複申請。" : "你的申請正在審核中，無需重複送出。"}</p>
    {latest && <p className="text-sm text-muted-foreground">申請編號：{latest.id}・申請日期：{latest.date}</p>}
    <Button variant="outline" onClick={() => setReload(value => value + 1)}>更新申請狀態</Button>
    <Button asChild variant="outline"><Link href="/account">返回會員中心</Link></Button>
  </ApplyNotice>;

  return (
    <div className="min-h-screen bg-background">
      <UniverseBackground />
      <Navigation />

      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              加入創作者行列
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              申請成為創作者
            </h1>
          </div>

          {/* Introduction Section */}
          <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 mb-8">
            <div className="space-y-4 text-foreground">
              <p className="text-xl">嗨，親愛的創作者您好！</p>
              <p className="text-muted-foreground leading-relaxed">
                我們正在尋找熱愛畫畫、設計、創作的你。
                無論你是剛起步的原創角色創作者，或是已經有豐富角色故事線的老手，還是想法豐富的藝術家們，我們都想成為你品牌夢想的起點與專屬的品牌營運夥伴
              </p>
              <p className="text-muted-foreground leading-relaxed">
                我們提供製作資源、平台曝光與分潤機制，協助你打造屬於自己的品牌小店與商品形象！
                讓你的作品不再只是興趣，而是真正能被看見、被喜歡，甚至成為收入來源的可能。
              </p>

              {/* What we provide */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  我們提供什麼？
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      icon: Package,
                      text: "幫你將作品製作成實體商品（如服飾、包袋等）",
                    },
                    { icon: Sparkles, text: "規劃不同品牌收益方式" },
                    { icon: Users, text: "建立完整的培訓系統" },
                    { icon: Truck, text: "處理出貨、客服與後勤" },
                    { icon: Handshake, text: "對接各式企業聯名" },
                    {
                      icon: PartyPopper,
                      text: "提供空間與主題聚會結交其他創作者",
                    },
                    {
                      icon: Megaphone,
                      text: "透過空間設計與主題展覽創造品牌識別與知名度",
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary/10 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  填寫完後團隊會以 Email 或 Instagram 與你聯繫
                </p>
                <p className="text-foreground mt-2">
                  這裡，是你藝術事業的跳板。讓你在空閒之餘，用創作讓更多人看見你、支持你，也為你累積一份屬於自己的品牌價值與收入。
                </p>
              </div>

              <p className="text-muted-foreground text-sm mt-4">
                感謝您對 ARTNIVERSE
                的支持與信任！請依序填寫以下資料，協助我們更了解您的創作及合作需求。期待與您一起，將作品推向更多人，打造屬於您的品牌與商品！
              </p>
            </div>
          </div>

          {/* Application Form */}
          {latest?.status === "rejected" && <div role="status" className="mb-6 rounded-xl border border-destructive/40 p-4">
            <p>上次申請未通過，可修正資料後重新申請。</p>
            <p className="mt-2 whitespace-pre-wrap text-sm">退件原因：{latest.rejectReason || "未提供"}</p>
          </div>}
          {error && <p role="alert" className="mb-4 whitespace-pre-wrap text-destructive">{error}</p>}
          {frozen && !saving && <div className="mb-6 space-y-3 rounded-xl border p-4">
            <p>尚未確認送件結果，已保留本次內容。請先查詢狀態，避免重複申請。</p>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => setReload(value => value + 1)}>查詢申請狀態</Button>
              <Button type="button" variant="outline" onClick={() => void sendApplication()}>重試原申請</Button>
              <a href="/login/" target="_blank" rel="noopener noreferrer" className="self-center underline">另開分頁登入</a>
            </div>
          </div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset disabled={saving || frozen} className="min-w-0 space-y-6">
            {/* Basic Info */}
            <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                基本資料
              </h2>
              <div className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    電子郵件 <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="email"
                    maxLength={255}
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="bg-background/50 border-border/50"
                  />
                </div>

                {/* Real Name */}
                <div className="space-y-2">
                  <Label htmlFor="realName" className="text-foreground">
                    真實姓名 <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="realName"
                    maxLength={100}
                    type="text"
                    required
                    placeholder="請輸入真實姓名"
                    value={formData.realName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        realName: e.target.value,
                      }))
                    }
                    className="bg-background/50 border-border/50"
                  />
                </div>

                {/* Brand Name */}
                <div className="space-y-2">
                  <Label htmlFor="brandName" className="text-foreground">
                    品牌名稱 <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="brandName"
                    maxLength={100}
                    type="text"
                    required
                    placeholder="請輸入您的品牌名稱"
                    value={formData.brandName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        brandName: e.target.value,
                      }))
                    }
                    className="bg-background/50 border-border/50"
                  />
                </div>

                {/* Store Pickup */}
                <div className="space-y-2">
                  <Label htmlFor="storePickup" className="text-foreground">
                    店到店收件門市 <span className="text-red-400">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    請填寫完整店名，範例：7-11 復興門市 或 全家大安店
                  </p>
                  <Input
                    id="storePickup"
                    maxLength={255}
                    type="text"
                    required
                    placeholder="7-11 復興門市"
                    value={formData.storePickup}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        storePickup: e.target.value,
                      }))
                    }
                    className="bg-background/50 border-border/50"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">
                    聯絡電話 <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="phone"
                    maxLength={32}
                    type="tel"
                    required
                    placeholder="0912-345-678"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="bg-background/50 border-border/50"
                  />
                </div>

                {/* Birthday */}
                <div className="space-y-2">
                  <Label htmlFor="birthday" className="text-foreground">
                    生日 <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="birthday"
                    type="date"
                    required
                    value={formData.birthday}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        birthday: e.target.value,
                      }))
                    }
                    className="bg-background/50 border-border/50"
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-foreground">
                    地址 <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="address"
                    maxLength={255}
                    type="text"
                    required
                    placeholder="請輸入完整地址"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>
            </div>

            {/* Bank Info */}
            <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                收款資訊
              </h2>
              <div className="space-y-6">
                {/* Bank Code */}
                <div className="space-y-2">
                  <Label htmlFor="bankCode" className="text-foreground">
                    銀行代碼 <span className="text-red-400">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    例：郵局 700，台新銀行 812。請填寫完整：「銀行名稱 + 代碼」
                  </p>
                  <Input
                    id="bankCode"
                    maxLength={100}
                    type="text"
                    required
                    placeholder="郵局 700"
                    value={formData.bankCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bankCode: e.target.value,
                      }))
                    }
                    className="bg-background/50 border-border/50"
                  />
                </div>

                {/* Bank Account */}
                <div className="space-y-2">
                  <Label htmlFor="bankAccount" className="text-foreground">
                    收款帳號 <span className="text-red-400">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    僅用於分潤匯款，請放心填寫。請提供您的銀行或郵局帳號，我們會依此將合作收益匯入。
                  </p>
                  <Input
                    id="bankAccount"
                    inputMode="numeric"
                    pattern="[0-9]{6,32}"
                    maxLength={32}
                    title="請輸入 6 至 32 位數字的收款帳號"
                    type="text"
                    required
                    placeholder="請輸入收款帳號"
                    value={formData.bankAccount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bankAccount: e.target.value,
                      }))
                    }
                    className="bg-background/50 border-border/50"
                  />
                  <p className="text-xs text-primary flex items-center gap-1 mt-2">
                    <span>📌</span>{" "}
                    此資訊僅用於內部結帳用途，不會外洩或用作他途。
                  </p>
                </div>
              </div>
            </div>

            {/* Product Categories */}
            <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-8">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                想合作的產品類別
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                請選擇您有興趣製作的產品類型，選完後歡迎主動與我們聯繫！如果您有其他想法，也非常歡迎和我們討論
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {options.categories.map((category) => (
                  <div key={category} className="flex items-center space-x-3">
                    <Checkbox
                      id={category}
                      disabled={saving || frozen}
                      checked={formData.selectedCategories.includes(category)}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(category, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={category}
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <a
                  href="https://drive.google.com/file/d/12IIxzQ14ds_mnY4dSuYUhuydbHwfWs8O/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  查看完整產品類別說明
                </a>
              </div>
            </div>

            {/* Creative Philosophy */}
            <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-8">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                創作理念
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                請簡短說明您的創作理念。告訴我們你的作品想傳達什麼故事、情感或理念，讓我們更了解你的創作背景。
              </p>
              <Textarea
                maxLength={5000}
                placeholder="分享您的創作故事、靈感來源、想傳達的理念..."
                value={formData.creativePhilosophy}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    creativePhilosophy: e.target.value,
                  }))
                }
                className="bg-background/50 border-border/50 min-h-[150px]"
                required
              />
            </div>

            {/* ID Upload */}
            <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-8">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                身份證明文件
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                身分證正反面照片上傳，核對身分及後續領款手續申報用
                。支援 JPG、PNG、WebP，每張最多 {Math.floor(options.maxImageBytes / 1024 / 1024)} MB。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID Front */}
                <div className="space-y-3">
                  <Label className="text-foreground">
                    身分證正面 <span className="text-red-400">*</span>
                  </Label>
                  <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id="idFront"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        handleFileChange(
                          "idFrontImage",
                          e.target.files?.[0] || null,
                        )
                      }
                    />
                    <label htmlFor="idFront" className="cursor-pointer">
                      {formData.idFrontImage ? (
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm">
                            {formData.idFrontImage.name}
                          </span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            點擊上傳身分證正面
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* ID Back */}
                <div className="space-y-3">
                  <Label className="text-foreground">
                    身分證反面 <span className="text-red-400">*</span>
                  </Label>
                  <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id="idBack"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        handleFileChange(
                          "idBackImage",
                          e.target.files?.[0] || null,
                        )
                      }
                    />
                    <label htmlFor="idBack" className="cursor-pointer">
                      {formData.idBackImage ? (
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm">
                            {formData.idBackImage.name}
                          </span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            點擊上傳身分證反面
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Agreement */}
            <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                合約同意
              </h2>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeToContract"
                  disabled={saving || frozen}
                  checked={formData.agreeToContract}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({
                      ...prev,
                      agreeToContract: checked === true,
                    }));
                    if (checked) {
                      setIsContractOpen(true);
                    }
                  }}
                  required
                />
                <div className="flex-1">
                  <Label
                    htmlFor="agreeToContract"
                    className="text-foreground cursor-pointer"
                  >
                    我已閱讀並同意{" "}
                    <Dialog
                      open={isContractOpen}
                      onOpenChange={setIsContractOpen}
                    >
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="text-primary hover:underline font-medium"
                        >
                          ARTNIVERSE 創作者合約書
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card border-primary/20">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold text-foreground">
                            ARTNIVERSE 創作者合約書
                          </DialogTitle>
                        </DialogHeader>
                        <div className="prose prose-sm prose-invert max-w-none">
                          <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed">
                            {options.contractContent}
                          </pre>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-border/50">
                          <Button
                            type="button"
                            onClick={() => setIsContractOpen(false)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            我已閱讀完畢
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <span className="text-red-400"> *</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    請仔細閱讀合約內容，勾選後即表示您同意合約條款
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-lg rounded-full"
                disabled={saving || frozen || !formData.agreeToContract}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {saving ? "申請送出中…" : "提交申請"}
              </Button>
            </div>
            </fieldset>
          </form>
        </div>
      </main>
    </div>
  );
}
