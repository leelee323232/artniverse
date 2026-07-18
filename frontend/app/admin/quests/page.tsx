"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox" 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  Plus, 
  Trash2, 
  Edit, 
  SlidersHorizontal, 
  CheckCircle, 
  Flame, 
  Sparkles, 
  Layers,
  CheckSquare,
  Square
} from "lucide-react"

// 💡 前台代碼中定義的 25 項完整功能清單
const ALL_FEATURES = [
  "創作者基本媒合（一品牌調性配對提案）",
  "基礎貼文文案與Hashtag建議",
  "成效報表（曝光/互動）",
  "合作溝通",
  "成效數據分析（曝光/互動）",
  "合約代管",
  "創作者管理",
  "客製創作者媒合（精準受眾）",
  "基礎專案管理",
  "內容策略與主題規劃",
  "專案管理",
  "品質控管",
  "品牌素材/腳本協助",
  "創作者串聯曝光",
  "內容優化建議",
  "主題企劃（活動/檔期操作）",
  "年度內容排程",
  "跨平台內容策略（IG/Reels/Shorts）",
  "廣告素材產出（不含媒體費）",
  "原創IP角色聯名使用權（期間內）",
  "產品優先排程",
  "專屬長期內容策略顧問",
  "專屬團隊支持",
  "大型活動／快閃活動聯名",
  "專屬創作者池（固定合作班底）"
]

const initialSubscriptionPlans = [
  {
    id: "starter",
    name: "Starter",
    title: "試水營量",
    subtitle: "想測試創作者合作效果的品牌",
    price: "$12,000",
    period: "/月",
    originalPrice: "季繳$32,400（9折）",
    popular: false,
    creatorCount: "1位/月",
    monthlyDesigns: "2款設計",
    sortOrder: 1,
    // 💡 預設開啟前 3 項與第 7 項
    features: ALL_FEATURES.map((f, i) => ({ name: f, included: [0, 1, 2, 6].includes(i) }))
  },
  {
    id: "growth",
    name: "Growth 成長",
    title: "Growth 成長",
    subtitle: "想穩定經營內容與品牌聲量",
    price: "$25,000",
    period: "/月",
    originalPrice: "半年$127,500（85折）",
    popular: true,
    creatorCount: "3位/月",
    monthlyDesigns: "6款設計",
    sortOrder: 2,
    // 💡 預設開啟除了最後 10 項以外的功能
    features: ALL_FEATURES.map((f, i) => ({ name: f, included: i < 15 }))
  },
  {
    id: "scale",
    name: "Scale",
    title: "擴散曝光",
    subtitle: "需要快速提升曝光與討論度",
    price: "$55,000",
    period: "/月",
    originalPrice: "年繳$528,000（8折）",
    popular: false,
    creatorCount: "6位/月",
    monthlyDesigns: "12款設計",
    sortOrder: 3,
    // 💡 預設開啟除了最後 4 項以外的功能
    features: ALL_FEATURES.map((f, i) => ({ name: f, included: i < 21 }))
  }
]

export default function AdminQuestsPage() {
  const [plans, setPlans] = useState(initialSubscriptionPlans)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<typeof initialSubscriptionPlans[0] | null>(null)

  // 表單狀態
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    title: "",
    subtitle: "",
    price: "",
    period: "/月",
    originalPrice: "",
    popular: false,
    creatorCount: "",
    monthlyDesigns: "",
    sortOrder: 1,
    features: ALL_FEATURES.map(f => ({ name: f, included: false })) // 💡 初始化全為 false
  })

  // 打開新增方案
  const handleOpenAdd = () => {
    setSelectedPlan(null)
    setFormData({
      id: `plan_${Date.now().toString().slice(-4)}`,
      name: "",
      title: "",
      subtitle: "",
      price: "$",
      period: "/月",
      originalPrice: "",
      popular: false,
      creatorCount: "",
      monthlyDesigns: "",
      sortOrder: plans.length + 1,
      features: ALL_FEATURES.map(f => ({ name: f, included: false }))
    })
    setIsModalOpen(true)
  }

  // 打開編輯方案
  const handleOpenEdit = (plan: typeof initialSubscriptionPlans[0]) => {
    setSelectedPlan(plan)
    setFormData({ ...plan })
    setIsModalOpen(true)
  }

  // 處理單個 Checkbox 狀態切換
  const handleFeatureToggle = (featureName: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map(f => f.name === featureName ? { ...f, included: checked } : f)
    }))
  }

  // 一鍵全選或全取消
  const handleSelectAllFeatures = (included: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map(f => ({ ...f, included }))
    }))
  }

  // 處理儲存
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.id.trim() || !formData.name.trim() || !formData.title.trim()) return

    if (selectedPlan) {
      setPlans(plans.map(p => p.id === selectedPlan.id ? { ...p, ...formData } : p))
    } else {
      setPlans([...plans, { ...formData }])
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm("確定要刪除這個訂閱合作方案嗎？")) {
      setPlans(plans.filter(p => p.id !== id))
    }
  }

  return (
    <div className="space-y-6 p-6 min-h-screen text-foreground">
      {/* 頂部列 */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">企業委託方案管理</h1>
          <p className="text-sm text-muted-foreground">配置前台顯示的企業長期訂閱方案內容、定價與交付規格。</p>
        </div>
        
        <Button onClick={handleOpenAdd} className="bg-gradient-to-r from-primary to-secondary font-medium">
          <Plus className="mr-1.5 h-4 w-4" />
          新增方案
        </Button>
      </div>

      {/* 數據表格 */}
      <Card className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-white/5 text-sm font-medium text-muted-foreground">
                <th className="px-6 py-3.5 w-16 text-center">排序</th>
                <th className="px-6 py-3.5">方案代稱 / 中文標題</th>
                <th className="px-6 py-3.5 w-40">狀態 (推薦標籤)</th>
                <th className="px-6 py-3.5 w-40">開啟功能數</th>
                <th className="px-6 py-3.5 w-40">售價規格</th>
                <th className="px-6 py-3.5 w-44 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {plans.sort((a, b) => a.sortOrder - b.sortOrder).map((plan) => (
                <tr key={plan.id} className="border-b border-border/30 last:border-none text-sm transition-colors hover:bg-white/5">
                  <td className="px-6 py-4 font-mono text-center text-muted-foreground">{plan.sortOrder}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground/90 text-base">{plan.title}</span>
                        <span className="text-xs text-muted-foreground bg-white/10 px-1.5 py-0.5 rounded font-mono">{plan.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{plan.subtitle}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {plan.popular ? (
                      <Badge className="bg-amber-500/20 text-amber-400 border-none gap-1 py-0.5">
                        <Flame className="h-3 w-3 fill-amber-400" />
                        最熱門
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground/60 border-border/60">標準方案</Badge>
                    )}
                  </td>
                  {/* 💡 額外顯示目前勾選了幾項服務 */}
                  <td className="px-6 py-4 font-medium">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                      已啟動 {plan.features?.filter(f => f.included).length || 0} / 25 項
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="font-mono font-bold text-primary text-base">
                        {plan.price}<span className="text-xs text-muted-foreground font-normal">{plan.period}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground/70">{plan.originalPrice}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(plan)} className="h-8 text-xs gap-1 hover:bg-white/10">
                        <Edit className="h-3.5 w-3.5" />
                        編輯
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(plan.id)} className="h-8 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                        刪除
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 彈出視窗 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-border/60 bg-background/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              {selectedPlan ? "編輯訂閱方案欄位" : "建立新訂閱合作方案"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 py-2">
            {/* 基本屬性設定 */}
            <div className="grid grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <Label htmlFor="planId">方案 ID (代碼名稱) <span className="text-red-500">*</span></Label>
                <Input
                  id="planId"
                  placeholder="例如: starter, growth"
                  className="bg-white/5 border-border/50 font-mono"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  disabled={!!selectedPlan}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sortOrder">後台排序</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  className="bg-white/5 border-border/50"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                  min={1}
                  required
                />
              </div>
              <div className="flex items-center justify-between h-10 px-3 rounded-lg border border-border/50 bg-white/5">
                <Label htmlFor="popular" className="cursor-pointer text-sm font-medium">設為「最熱門」方案</Label>
                <Switch
                  id="popular"
                  checked={formData.popular}
                  onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">方案英文代稱 (name) <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  className="bg-white/5 border-border/50"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="title">方案中文標題 (title) <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  className="bg-white/5 border-border/50"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subtitle">方案副標題 (subtitle)</Label>
              <Input
                id="subtitle"
                className="bg-white/5 border-border/50"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price">方案售價 (price) <span className="text-red-500">*</span></Label>
                <Input
                  id="price"
                  className="bg-white/5 border-border/50 font-bold"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="period">計費週期單位 (period)</Label>
                <Input
                  id="period"
                  className="bg-white/5 border-border/50"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="originalPrice">繳費折數細節說明 (originalPrice)</Label>
                <Input
                  id="originalPrice"
                  className="bg-white/5 border-border/50"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-border/40 bg-white/5">
              <div className="space-y-1.5">
                <Label htmlFor="creatorCount" className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  創作者合作數 (creatorCount)
                </Label>
                <Input
                  id="creatorCount"
                  className="bg-background border-border/50 font-semibold"
                  value={formData.creatorCount}
                  onChange={(e) => setFormData({ ...formData, creatorCount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="monthlyDesigns" className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  每月設計交付款數 (monthlyDesigns)
                </Label>
                <Input
                  id="monthlyDesigns"
                  className="bg-background border-border/50 font-semibold"
                  value={formData.monthlyDesigns}
                  onChange={(e) => setFormData({ ...formData, monthlyDesigns: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* 💡 ✨ 重磅功能：新增「方案提供功能多選清單」區塊 */}
            <div className="space-y-3 p-4 rounded-xl border border-border/40 bg-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/20">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    配置方案支援服務功能明細
                  </Label>
                  <p className="text-xs text-muted-foreground">勾選該方案內包含（`included: true`）的設計服務項目。</p>
                </div>
                {/* 快捷批量操作按鈕 */}
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleSelectAllFeatures(true)} className="h-7 text-[11px] text-primary hover:bg-primary/10">
                    全部勾選
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleSelectAllFeatures(false)} className="h-7 text-[11px] text-muted-foreground hover:bg-white/5">
                    清空已選
                  </Button>
                </div>
              </div>

              {/* 雙列排版的 Checkbox 網格牆 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 max-h-[260px] overflow-y-auto pr-1 pt-1">
                {formData.features.map((feature) => (
                  <div key={feature.name} className="flex items-start gap-2.5 space-y-0 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Checkbox
                      id={`feat-${feature.name}`}
                      checked={feature.included}
                      onCheckedChange={(checked) => handleFeatureToggle(feature.name, !!checked)}
                      className="mt-0.5 border-border/80 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label
                      htmlFor={`feat-${feature.name}`}
                      className="text-xs font-medium leading-normal text-muted-foreground/90 cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[checked=true]:text-foreground"
                      data-checked={feature.included}
                    >
                      {feature.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 底部按鈕 */}
            <DialogFooter className="border-t border-border/20 pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="bg-transparent">
                取消返回
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-primary to-secondary px-6">
                <CheckCircle className="mr-1.5 h-4 w-4" />
                儲存方案與功能細項
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}