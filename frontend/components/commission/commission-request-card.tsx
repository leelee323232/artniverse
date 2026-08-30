"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, Users, Star, UserCheck, Percent } from "lucide-react"
import type React from "react"
import type { CommissionRequest } from "@/types/commission-request"

const TYPE_LABEL: Record<string, string> = {
  brand: "品牌設計",
  illustration: "插畫繪製",
  product: "周邊商品設計",
  packaging: "包裝設計",
  custom: "客製化專案",
}

const BUDGET_LABEL: Record<string, string> = {
  "3000-5000": "NT$ 3,000 - 5,000",
  "5000-10000": "NT$ 5,000 - 10,000",
  "10000-20000": "NT$ 10,000 - 20,000",
  "20000-50000": "NT$ 20,000 - 50,000",
  "50000+": "NT$ 50,000 以上",
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-500",
  "in-progress": "bg-blue-500/20 text-blue-500",
  completed: "bg-green-500/20 text-green-500",
}

const STATUS_LABEL: Record<string, string> = {
  pending: "等待審核",
  "in-progress": "進行中",
  completed: "已完成",
}

const APPLICANT_CONDITION_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  all:         { label: "全部人可參與",     className: "bg-emerald-500/15 text-emerald-500", icon: Users },
  "level-above": { label: "指定等級以上", className: "bg-amber-500/15 text-amber-500",   icon: Star },
  direct:      { label: "直接指明合作",     className: "bg-violet-500/15 text-violet-500", icon: UserCheck },
}

interface CommissionRequestCardProps {
  request: CommissionRequest
  onClick: (request: CommissionRequest) => void
}

export function CommissionRequestCard({ request, onClick }: CommissionRequestCardProps) {
  return (
    <Card
      onClick={() => onClick(request)}
      className="border-border/50 bg-card/30 p-6 backdrop-blur-sm cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-bold text-foreground">{request.title}</h3>
            <Badge className={STATUS_STYLE[request.status]}>
              {STATUS_LABEL[request.status]}
            </Badge>
            {(() => {
              const cfg = APPLICANT_CONDITION_CONFIG[request.applicantCondition]
              if (!cfg) return null
              const Icon = cfg.icon
              return (
                <Badge className={`${cfg.className} gap-1`}>
                  <Icon className="h-3 w-3" />
                  {request.applicantCondition === "direct" && request.targetCreator
                    ? `指定：${request.targetCreator}`
                    : cfg.label}
                </Badge>
              )
            })()}
          </div>
          <p className="text-sm text-muted-foreground">{TYPE_LABEL[request.type] ?? request.type}</p>
          <p className="text-sm text-foreground line-clamp-2">{request.description}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClick(request) }}
          className="shrink-0 text-xs text-primary border border-primary/40 rounded px-2.5 py-1 hover:bg-primary/10 transition-colors"
        >
          查看詳情
        </button>
      </div>

      <div className="mt-4 flex items-center gap-6 border-t border-border/50 pt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-4 w-4" />
          <span>{BUDGET_LABEL[request.budget] ?? request.budget}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Percent className="h-4 w-4" />
          <span>分潤 {request.revenueShare}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          <span>截止 {request.deadline}</span>
        </div>
        <span className="ml-auto">提交於 {request.submittedDate}</span>
      </div>
    </Card>
  )
}
