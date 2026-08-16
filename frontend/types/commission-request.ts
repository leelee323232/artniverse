export type CommissionRequestStatus = "pending" | "in-progress" | "completed"

export interface CommissionRequest {
  id: string
  title: string
  type: string
  status: CommissionRequestStatus
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
}

export const mockCommissionRequests: CommissionRequest[] = [
  {
    id: "REQ-001",
    title: "咖啡廳品牌 Logo 設計",
    type: "brand",
    status: "in-progress",
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
  },
  {
    id: "REQ-002",
    title: "婚禮邀請卡插畫",
    type: "illustration",
    status: "pending",
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
  },
  {
    id: "REQ-003",
    title: "品牌周邊商品設計",
    type: "product",
    status: "completed",
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
  },
]
