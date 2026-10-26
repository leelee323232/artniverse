export type CommissionRequestStatus =
  | "pending"      // 待審核
  | "approved"     // 審核通過／待媒合
  | "contracting"  // 創作者接受／待簽約
  | "in-progress"  // 委託成立／進行中
  | "delivery"     // 待驗收
  | "completed"    // 已完成
  | "rejected"     // 已拒絕

export type ApplicantCondition = "all" | "level-above" | "direct"

export interface CommissionRequest {
  id: string
  title: string
  type: string
  status: CommissionRequestStatus
  sortOrder: number
  budget: string
  deadline: string
  submittedDate: string
  description: string
  style: string
  name: string
  email: string
  phone: string
  notes: string
  attachments: string[]
  applicantCondition: ApplicantCondition
  targetCreator?: string
  revenueShare: number
  proposalFiles: { name: string; size: number; url?: string }[]
}

export const mockCommissionRequests: CommissionRequest[] = [
  {
    id: "REQ-001",
    title: "咖啡廳品牌 Logo 設計",
    type: "brand",
    status: "approved",
    sortOrder: 1,
    budget: "10000-20000",
    deadline: "2026-09-30",
    submittedDate: "2026-08-01",
    description: "需要設計一個溫馨、現代感的咖啡廳 Logo，風格偏向北歐極簡，主色調使用暖褐色系，需包含中英文版本。",
    style: "極簡、北歐風",
    name: "陳小明",
    email: "chen@example.com",
    phone: "0912345678",
    notes: "希望提供 AI 及 PNG 兩種格式",
    attachments: [],
    applicantCondition: "level-above",
    revenueShare: 10,
    proposalFiles: [{ name: "咖啡廳品牌企畫書.pdf", size: 2048000 }],
  },
  {
    id: "REQ-002",
    title: "婚禮邀請卡插畫",
    type: "illustration",
    status: "pending",
    sortOrder: 2,
    budget: "5000-10000",
    deadline: "2026-10-15",
    submittedDate: "2026-08-10",
    description: "客製化婚禮邀請卡插畫設計，風格偏水彩手繪，主題為森林系婚禮。",
    style: "水彩、手繪",
    name: "林美麗",
    email: "lin@example.com",
    phone: "0923456789",
    notes: "",
    attachments: [],
    applicantCondition: "direct",
    targetCreator: "小夢創作室",
    revenueShare: 15,
    proposalFiles: [],
  },
  {
    id: "REQ-003",
    title: "品牌周邊商品設計",
    type: "product",
    status: "completed",
    sortOrder: 3,
    budget: "10000-20000",
    deadline: "2026-07-20",
    submittedDate: "2026-06-15",
    description: "T-shirt 和貼紙設計，需配合品牌現有視覺識別系統，提供 5 款圖案。",
    style: "插畫、可愛",
    name: "王大偉",
    email: "wang@example.com",
    phone: "0934567890",
    notes: "T-shirt 需提供白底和黑底兩版",
    attachments: [],
    applicantCondition: "all",
    revenueShare: 10,
    proposalFiles: [
      { name: "品牌周邊企畫書.pdf", size: 3145728 },
      { name: "設計參考簡報.pptx", size: 5242880 },
    ],
  },
  {
    id: "REQ-004",
    title: "餐飲品牌社群貼文插畫",
    type: "illustration",
    status: "contracting",
    sortOrder: 4,
    budget: "3000-5000",
    deadline: "2026-11-30",
    submittedDate: "2026-10-01",
    description: "需要每月 4 張 IG 貼文插畫，風格清新活潑，配合秋冬新菜色主題。",
    style: "清新、活潑",
    name: "吳佳穎",
    email: "wu@example.com",
    phone: "0945678901",
    notes: "需提供 1080x1080 與 9:16 直式兩種尺寸",
    attachments: [],
    applicantCondition: "all",
    revenueShare: 12,
    proposalFiles: [],
  },
  {
    id: "REQ-005",
    title: "科技新創品牌識別設計",
    type: "brand",
    status: "delivery",
    sortOrder: 5,
    budget: "20000-50000",
    deadline: "2026-12-31",
    submittedDate: "2026-10-15",
    description: "全套品牌識別設計，包含 Logo、名片、公司簡報模板及品牌手冊。",
    style: "科技感、專業",
    name: "張志偉",
    email: "zhang@example.com",
    phone: "0956789012",
    notes: "",
    attachments: [],
    applicantCondition: "level-above",
    revenueShare: 8,
    proposalFiles: [{ name: "新創品牌需求書.pdf", size: 1572864 }],
  },
]
