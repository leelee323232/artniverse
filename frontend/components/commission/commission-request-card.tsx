"use client"

import { Badge } from "@/components/ui/badge"
import { Users, Star, UserCheck, ChevronUp, ChevronDown, Eye } from "lucide-react"
import type React from "react"
import type { CommissionRequest } from "@/types/commission-request"

export const TYPE_LABEL: Record<string, string> = {
  brand: "品牌設計",
  illustration: "插畫繪製",
  product: "周邊商品設計",
  packaging: "包裝設計",
  custom: "客製化專案",
}

export const BUDGET_LABEL: Record<string, string> = {
  "3000-5000": "NT$ 3,000 - 5,000",
  "5000-10000": "NT$ 5,000 - 10,000",
  "10000-20000": "NT$ 10,000 - 20,000",
  "20000-50000": "NT$ 20,000 - 50,000",
  "50000+": "NT$ 50,000 以上",
}

export const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:       { label: "待審核",       className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  approved:      { label: "待媒合",       className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  contracting:   { label: "待簽約",       className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  "in-progress": { label: "進行中",       className: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
  delivery:      { label: "待驗收",       className: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  completed:     { label: "已完成",       className: "bg-green-500/20 text-green-400 border-green-500/30" },
  rejected:      { label: "已拒絕",       className: "bg-red-500/20 text-red-400 border-red-500/30" },
}

export const APPLICANT_CONDITION_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  all:           { label: "全部人可參與",   className: "bg-emerald-500/15 text-emerald-500", icon: Users },
  "level-above": { label: "指定等級以上", className: "bg-amber-500/15 text-amber-500",   icon: Star },
  direct:        { label: "直接指明合作", className: "bg-violet-500/15 text-violet-500", icon: UserCheck },
}

// ── 前台用：卡片格式 ────────────────────────────────────────────
interface CommissionRequestCardProps {
  request: CommissionRequest
  onClick: (request: CommissionRequest) => void
}

export function CommissionRequestCard({ request, onClick }: CommissionRequestCardProps) {
  const status = STATUS_CONFIG[request.status]
  const applicant = APPLICANT_CONDITION_CONFIG[request.applicantCondition]
  const ApplicantIcon = applicant?.icon

  return (
    <div
      onClick={() => onClick(request)}
      className="border border-border/50 bg-card/30 p-6 rounded-xl backdrop-blur-sm cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-bold text-foreground">{request.title}</h3>
            {status && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${status.className}`}>
                {status.label}
              </span>
            )}
            {applicant && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${applicant.className}`}>
                <ApplicantIcon className="h-3 w-3" />
                {request.applicantCondition === "direct" && request.targetCreator
                  ? `指定：${request.targetCreator}`
                  : applicant.label}
              </span>
            )}
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
        <span>{BUDGET_LABEL[request.budget] ?? request.budget}</span>
        <span>截止 {request.deadline}</span>
        <span className="ml-auto">提交於 {request.submittedDate}</span>
      </div>
    </div>
  )
}

// ── 後台用：表格列格式 ───────────────────────────────────────────
interface CommissionRequestRowProps {
  request: CommissionRequest
  isFirst: boolean
  isLast: boolean
  onClick: (request: CommissionRequest) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
}

export function CommissionRequestRow({ request, isFirst, isLast, onClick, onMoveUp, onMoveDown }: CommissionRequestRowProps) {
  const status = STATUS_CONFIG[request.status]
  const applicant = APPLICANT_CONDITION_CONFIG[request.applicantCondition]
  const ApplicantIcon = applicant?.icon

  return (
    <tr className="border-b border-border/30 last:border-none text-sm transition-colors hover:bg-white/5">

      {/* 委託標題：唯一允許彈性寬度的欄 */}
      <td className="px-6 py-3 max-w-[220px]">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground/90 truncate">{request.title}</span>
          <span className="text-xs text-muted-foreground font-mono">{request.id}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{TYPE_LABEL[request.type] ?? request.type}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        {status && (
          <Badge className={`${status.className} border text-xs whitespace-nowrap`}>
            {status.label}
          </Badge>
        )}
      </td>
      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{BUDGET_LABEL[request.budget] ?? request.budget}</td>
      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{request.deadline}</td>
      {/* 推薦排序 */}
      <td className="px-4 py-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onMoveUp(request.id)}
            disabled={isFirst}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onMoveDown(request.id)}
            disabled={isLast}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
      {/* 操作 */}
      <td className="px-4 py-3 text-center whitespace-nowrap">
        <button
          onClick={(e) => { e.stopPropagation(); onClick(request) }}
          className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          title="查看詳情"
        >
          <Eye className="h-4 w-4" />
        </button>
      </td>
    </tr>
  )
}
