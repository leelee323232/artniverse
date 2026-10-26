"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Users, Star, UserCheck, FileText, ArrowRight, Paperclip, Download, Loader2 } from "lucide-react"
import type { CommissionRequest, CommissionRequestStatus } from "@/types/commission-request"

const REJECTABLE: CommissionRequestStatus[] = ["pending", "approved"]

const TYPE_LABEL: Record<string, string> = {
  brand: "品牌設計",
  illustration: "插畫繪製",
  product: "周邊商品設計",
  packaging: "包裝設計",
  custom: "客製化專案",
}

const STATUS_LABEL: Record<CommissionRequestStatus, string> = {
  pending:       "待審核",
  approved:      "待媒合",
  contracting:   "待簽約",
  "in-progress": "進行中",
  delivery:      "待驗收",
  completed:     "已完成",
  rejected:      "已拒絕",
}

const NEXT_ACTION_LABEL: Partial<Record<CommissionRequestStatus, string>> = {
  pending:       "審核通過",
  approved:      "確認媒合，進入簽約",
  contracting:   "合約確認，委託成立",
  "in-progress": "提交驗收",
  delivery:      "驗收通過，標記完成",
}

const APPLICANT_CONDITION_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  all:           { label: "全部人皆可參與",   className: "bg-emerald-500/15 text-emerald-500", icon: Users },
  "level-above": { label: "指定等級以上的人", className: "bg-amber-500/15 text-amber-500",   icon: Star },
  direct:        { label: "直接指明合作",     className: "bg-violet-500/15 text-violet-500", icon: UserCheck },
}

const BUDGET_LABEL: Record<string, string> = {
  "3000-5000": "NT$ 3,000 - 5,000",
  "5000-10000": "NT$ 5,000 - 10,000",
  "10000-20000": "NT$ 10,000 - 20,000",
  "20000-50000": "NT$ 20,000 - 50,000",
  "50000+": "NT$ 50,000 以上",
}

interface Props {
  request: CommissionRequest
  onClose: () => void
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  readOnly?: boolean
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 border-b border-border/30 pb-3 items-start gap-2">
      <span className="text-sm font-medium text-muted-foreground pt-0.5">{label}</span>
      <span className="col-span-2 text-sm text-foreground">{value || "—"}</span>
    </div>
  )
}

export function CommissionRequestDetailModal({ request, onClose, onApprove, onReject, readOnly = false }: Props) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)

  const handleApprove = () => {
    if (loading) return
    setLoading("approve")
    onApprove?.(request.id)
    onClose()
  }

  const handleReject = () => {
    if (loading) return
    setLoading("reject")
    onReject?.(request.id)
    onClose()
  }

  const canReject = REJECTABLE.includes(request.status)
  const nextLabel = NEXT_ACTION_LABEL[request.status]
  const isTerminal = request.status === "completed" || request.status === "rejected"

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-40 p-4 animate-in fade-in duration-150">
      <div className="bg-background border border-border/80 rounded-xl shadow-xl max-w-lg w-full flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-border/50 flex justify-between items-center bg-muted/20">
          <div>
            <h3 className="text-lg font-bold text-foreground">{request.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">#{request.id} · 提交於 {request.submittedDate}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl transition-colors">&times;</button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3 overflow-y-auto">
          <Field label="委託類型" value={TYPE_LABEL[request.type] ?? request.type} />
          <div className="grid grid-cols-3 border-b border-border/30 pb-3 items-start gap-2">
            <span className="text-sm font-medium text-muted-foreground pt-0.5">接案人條件</span>
            <div className="col-span-2 flex flex-col gap-1.5">
              {(() => {
                const cfg = APPLICANT_CONDITION_CONFIG[request.applicantCondition]
                if (!cfg) return <span className="text-sm text-foreground">—</span>
                const Icon = cfg.icon
                return (
                  <Badge className={`${cfg.className} gap-1.5 w-fit`}>
                    <Icon className="h-3.5 w-3.5" />
                    {cfg.label}
                  </Badge>
                )
              })()}
              {request.applicantCondition === "direct" && request.targetCreator && (
                <span className="text-sm text-foreground">指定創作者：<span className="font-medium">{request.targetCreator}</span></span>
              )}
            </div>
          </div>
          <Field label="專案標題" value={request.title} />
          <div className="border-b border-border/30 pb-3">
            <span className="text-sm font-medium text-muted-foreground">詳細需求說明</span>
            <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{request.description || "—"}</p>
          </div>
          <Field label="預算範圍" value={BUDGET_LABEL[request.budget] ?? request.budget} />
          <Field label="分潤%數" value={`${request.revenueShare}%`} />
          <Field label="希望完成日期" value={request.deadline} />
          <Field label="風格偏好" value={request.style} />
          <div className="border-b border-border/30 pb-3">
            <span className="text-sm font-medium text-muted-foreground">聯絡資訊</span>
            <div className="mt-1 space-y-0.5 text-sm text-foreground">
              <p>{request.name}</p>
              <p>{request.email}</p>
              {request.phone && <p>{request.phone}</p>}
            </div>
          </div>
          <Field label="其他備註" value={request.notes} />
          <div className="grid grid-cols-3 items-start gap-2 border-b border-border/30 pb-3">
            <span className="text-sm font-medium text-muted-foreground pt-0.5">參考附件</span>
            <div className="col-span-2">
              {request.attachments.length === 0 ? (
                <span className="text-sm text-foreground">—</span>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {request.attachments.map((url, index) => (
                    <a key={index} href={url} target="_blank" rel="noreferrer" className="group relative block aspect-square overflow-hidden rounded-lg border border-border/40 bg-muted/20 hover:border-primary/50 transition-colors">
                      <img
                        src={url}
                        alt={`附件 ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                          e.currentTarget.nextElementSibling?.classList.remove("hidden")
                        }}
                      />
                      <div className="hidden h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                        <Paperclip className="h-5 w-5" />
                        <span className="text-[10px]">附件 {index + 1}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 items-start gap-2 pb-3">
            <span className="text-sm font-medium text-muted-foreground pt-0.5">企畫書</span>
            <div className="col-span-2">
              {request.proposalFiles.length === 0 ? (
                <span className="text-sm text-foreground">—</span>
              ) : (
                <ul className="space-y-2">
                  {request.proposalFiles.map((file, index) => (
                    <li key={index} className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2">
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate text-sm text-foreground">{file.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                      {file.url ? (
                        <a
                          href={file.url}
                          download={file.name}
                          onClick={(e) => e.stopPropagation()}
                          className="ml-auto shrink-0 p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="下載"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground/50">無法下載</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-muted/10 flex items-center gap-3">
          <span className="text-xs text-muted-foreground mr-auto">
            目前狀態：<span className="font-medium text-foreground">{STATUS_LABEL[request.status]}</span>
          </span>
          <Button variant="outline" onClick={onClose} className="bg-transparent text-muted-foreground hover:text-foreground">
            關閉
          </Button>
          {!readOnly && !isTerminal && (
            <>
              {canReject && (
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!!loading}
                  className="gap-1.5"
                >
                  {loading === "reject"
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <X className="h-4 w-4" />}
                  拒絕
                </Button>
              )}
              {nextLabel && (
                <Button
                  onClick={handleApprove}
                  disabled={!!loading}
                  className="gap-1.5 bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                >
                  {loading === "approve"
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <ArrowRight className="h-4 w-4" />}
                  {nextLabel}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
