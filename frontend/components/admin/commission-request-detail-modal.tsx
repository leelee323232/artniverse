"use client"

import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
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
          <Field label="專案標題" value={request.title} />
          <div className="border-b border-border/30 pb-3">
            <span className="text-sm font-medium text-muted-foreground">詳細需求說明</span>
            <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{request.description || "—"}</p>
          </div>
          <Field label="預算範圍" value={BUDGET_LABEL[request.budget] ?? request.budget} />
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
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="bg-transparent text-muted-foreground hover:text-foreground">
            關閉
          </Button>
          {!readOnly && (
            <>
              <Button
                variant="destructive"
                onClick={() => { onReject?.(request.id); onClose() }}
                className="gap-1.5"
              >
                <X className="h-4 w-4" /> 拒絕
              </Button>
              <Button
                onClick={() => { onApprove?.(request.id); onClose() }}
                className="gap-1.5 bg-gradient-to-r from-primary to-secondary text-primary-foreground"
              >
                <Check className="h-4 w-4" /> 通過
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
