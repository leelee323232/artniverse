"use client";

import React, { useState } from "react";
import { Eye, Check, X, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function DateTimePicker({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(value) : undefined;
  const timeStr = value ? value.slice(11, 16) : "00:00";
  const [hourStr, minuteStr] = timeStr.split(":");
  const hour = parseInt(hourStr);
  const minute = parseInt(minuteStr);

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    const y = day.getFullYear();
    const m = String(day.getMonth() + 1).padStart(2, "0");
    const d = String(day.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}T${timeStr}`);
  };

  const handleTimeChange = (h: number, min: number) => {
    const datePart = value ? value.slice(0, 10) : new Date().toISOString().slice(0, 10);
    onChange(`${datePart}T${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="col-span-2 flex items-center gap-2 border border-border rounded px-2 py-1 text-sm text-foreground bg-transparent hover:bg-muted/20 transition-colors text-left w-full">
          <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          {value
            ? value.replace("T", " ")
            : <span className="text-muted-foreground">{placeholder ?? "選擇日期時間"}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={handleDaySelect} />
        <div className="border-t border-border p-3 flex items-center gap-2">
          <span className="text-sm text-muted-foreground shrink-0">時間</span>
          <input
            type="number" min={0} max={23} value={hour}
            onChange={(e) => handleTimeChange(Math.min(23, Math.max(0, Number(e.target.value))), minute)}
            className="w-14 bg-transparent border border-border rounded px-2 py-1 text-sm text-foreground text-center"
          />
          <span className="text-muted-foreground">:</span>
          <input
            type="number" min={0} max={59} value={minute}
            onChange={(e) => handleTimeChange(hour, Math.min(59, Math.max(0, Number(e.target.value))))}
            className="w-14 bg-transparent border border-border rounded px-2 py-1 text-sm text-foreground text-center"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

type DiscountType = "percentage" | "fixed";

interface PromoCode {
  id: string;
  code: string;          // 限英數字
  type: DiscountType;     // 折扣方式
  minSubtotal: number;    // 低消金額
  value: number;          // 折數 或 折扣金額
  startTime: string;      // 啟用時間
  endTime: string;        // 結束時間
  maxUses: number | null; // 最大兌換量 (null 為不限)
  currentUses: number;    // 已兌換數量
}

const initialPromoCodes: PromoCode[] = [
  {
    id: "1",
    code: "ARTNIVERSE88",
    type: "percentage",
    minSubtotal: 1000,
    value: 88,
    startTime: "2026-06-01T00:00",
    endTime: "2026-07-31T23:59",
    maxUses: 100,
    currentUses: 42,
  },
  {
    id: "2",
    code: "SPACE500",
    type: "fixed",
    minSubtotal: 2000,
    value: 500,
    startTime: "2026-06-15T12:00",
    endTime: "2026-06-25T12:00",
    maxUses: null,
    currentUses: 89,
  },
];

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(initialPromoCodes);
  const [selectedPromo, setSelectedPromo] = useState<PromoCode | null>(null);
  const [confirmType, setConfirmType] = useState<"save" | "delete" | null>(null);

  // 表單獨立狀態
  const [code, setCode] = useState("");
  const [type, setType] = useState<DiscountType>("percentage");
  const [minSubtotal, setMinSubtotal] = useState<number>(0);
  const [value, setValue] = useState<number>(0);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxUsesInput, setMaxUsesInput] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  // 用時間判斷狀態的函數
  const getPromoStatus = (start: string, end: string) => {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);

    if (now < startTime) {
      return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">未開始</span>;
    } else if (now > endTime) {
      return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-destructive/10 text-destructive border border-destructive/20">已結束</span>;
    } else {
      return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">進行中</span>;
    }
  };

  // 開啟表單視窗（新增）
  const handleOpenCreate = () => {
    setCode("");
    setType("percentage");
    setMinSubtotal(0);
    setValue(0);
    setStartTime("");
    setEndTime("");
    setMaxUsesInput("");
    setIsEditing(false);
    setSelectedPromo({} as PromoCode);
  };

  // 開啟表單視窗（編輯）
  const handleOpenEdit = (promo: PromoCode) => {
    setCode(promo.code);
    setType(promo.type);
    setMinSubtotal(promo.minSubtotal);
    setValue(promo.value);
    setStartTime(promo.startTime);
    setEndTime(promo.endTime);
    setMaxUsesInput(promo.maxUses === null ? "" : promo.maxUses.toString());
    setIsEditing(true);
    setSelectedPromo(promo);
  };

  // 防呆
  const isFormValid = () => {
    const codeRegex = /^[a-zA-Z0-9]+$/;
    if (!codeRegex.test(code)) return false;
    if (!startTime || !endTime) return false;
    if (new Date(endTime) <= new Date(startTime)) return false; // 結束時間必須晚於啟用時間
    if (value <= 0) return false;
    return true;
  };

  const handleDataAction = () => {
    const parsedMaxUses = maxUsesInput.trim() === "" ? null : parseInt(maxUsesInput);

    if (confirmType === "save") {
      if (isEditing && selectedPromo?.id) {
        setPromoCodes((prev) =>
          prev.map((item) =>
            item.id === selectedPromo.id
              ? { ...item, code: code.toUpperCase(), type, minSubtotal, value, startTime, endTime, maxUses: parsedMaxUses }
              : item
          )
        );
      } else {
        const newPromo: PromoCode = {
          id: Date.now().toString(),
          code: code.toUpperCase(),
          type,
          minSubtotal,
          value,
          startTime,
          endTime,
          maxUses: parsedMaxUses,
          currentUses: 0,
        };
        setPromoCodes((prev) => [newPromo, ...prev]);
      }
    } else if (confirmType === "delete" && selectedPromo?.id) {
      setPromoCodes((prev) => prev.filter((item) => item.id !== selectedPromo.id));
    }

    setConfirmType(null);
    setSelectedPromo(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen text-foreground">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-wide text-foreground">
          優惠碼管理系統
        </h1>
        <Button onClick={handleOpenCreate} className="gap-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          新增優惠碼
        </Button>
      </div>

      {/* 列表表格 */}
      <div className="bg-background/80 backdrop-blur-lg rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/30 border-b border-border/50 text-muted-foreground text-sm font-semibold">
              <th className="p-4">優惠碼</th>
              <th className="p-4">折扣方式</th>
              <th className="p-4">折扣金額 / 折數</th>
              <th className="p-4">狀態</th>
              <th className="p-4">兌換數量</th>
              <th className="p-4 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {promoCodes.map((item) => (
              <tr
                key={item.id}
                onClick={() => handleOpenEdit(item)}
                className="border-b border-border/40 hover:bg-muted/40 cursor-pointer transition-colors text-muted-foreground hover:text-foreground text-sm"
              >
                <td className="p-4 font-medium text-foreground">{item.code}</td>
                <td className="p-4">{item.type === "percentage" ? "整筆訂單打折" : "固定金額折抵"}</td>
                <td className="p-4">{item.type === "percentage" ? `${item.value} 折` : `${item.value} 元`}</td>
                <td className="p-4">{getPromoStatus(item.startTime, item.endTime)}</td>
                <td className="p-4">{item.currentUses} / {item.maxUses ?? "無限制"}</td>
                <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(item)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setSelectedPromo(item); setConfirmType("delete"); }}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*第一層：填寫與編輯視窗*/}
      {selectedPromo && confirmType !== "delete" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-40 p-4 animate-in fade-in duration-150">
          <div className="bg-background border border-border/80 rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-border/50 flex justify-between items-center bg-muted/20">
              <h3 className="text-lg font-bold text-foreground">
                {isEditing ? "編輯優惠碼設定" : "新增優惠碼"}
              </h3>
              <button
                onClick={() => setSelectedPromo(null)}
                className="text-muted-foreground hover:text-foreground text-xl transition-colors"
              >
                &times;
              </button>
            </div>

            {/*Content 表單欄位*/}
            <div className="p-6 space-y-4 overflow-y-auto text-muted-foreground">
              {/*優惠碼限定英數字*/}
              <div className="grid grid-cols-3 border-b border-border/30 pb-2 items-center">
                <span className="font-medium text-muted-foreground">優惠碼</span>
                <input
                  type="text"
                  placeholder="限輸入英數字"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                  className="col-span-2 bg-transparent border border-border rounded px-2 py-1 text-foreground"
                />
              </div>

              {/*折扣方式 Select*/}
              <div className="grid grid-cols-3 border-b border-border/30 pb-2 items-center">
                <span className="font-medium text-muted-foreground">折扣方式</span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as DiscountType)}
                  className="col-span-2 bg-background border border-border rounded px-2 py-1 text-foreground outline-none"
                >
                  <option value="percentage">整筆訂單打折</option>
                  <option value="fixed">固定金額折抵</option>
                </select>
              </div>

              {/*條件式連動展開 Input 區塊*/}
              {type === "percentage" && (
                <>
                  <div className="grid grid-cols-3 border-b border-border/30 pb-2 items-center">
                    <span className="font-medium text-muted-foreground">低消金額</span>
                    <input
                      type="number"
                      value={minSubtotal}
                      onChange={(e) => setMinSubtotal(Number(e.target.value))}
                      className="col-span-2 bg-transparent border border-border rounded px-2 py-1 text-foreground"
                    />
                  </div>
                  <div className="grid grid-cols-3 border-b border-border/30 pb-2 items-center">
                    <span className="font-medium text-muted-foreground">折數</span>
                    <div className="col-span-2 flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="例: 85"
                        value={value || ""}
                        onChange={(e) => setValue(Number(e.target.value))}
                        className="bg-transparent border border-border rounded px-2 py-1 text-foreground w-full"
                      />
                      <span className="text-foreground">折</span>
                    </div>
                  </div>
                </>
              )}

              {type === "fixed" && (
                <>
                  <div className="grid grid-cols-3 border-b border-border/30 pb-2 items-center">
                    <span className="font-medium text-muted-foreground">低消金額</span>
                    <input
                      type="number"
                      value={minSubtotal}
                      onChange={(e) => setMinSubtotal(Number(e.target.value))}
                      className="col-span-2 bg-transparent border border-border rounded px-2 py-1 text-foreground"
                    />
                  </div>
                  <div className="grid grid-cols-3 border-b border-border/30 pb-2 items-center">
                    <span className="font-medium text-muted-foreground">折扣金額</span>
                    <div className="col-span-2 flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="例: 100"
                        value={value || ""}
                        onChange={(e) => setValue(Number(e.target.value))}
                        className="bg-transparent border border-border rounded px-2 py-1 text-foreground w-full"
                      />
                      <span className="text-foreground">元</span>
                    </div>
                  </div>
                </>
              )}

              {/*啟用時間*/}
              <div className="grid grid-cols-3 border-b border-border/30 pb-2 items-center">
                <span className="font-medium text-muted-foreground">啟用時間</span>
                <DateTimePicker value={startTime} onChange={setStartTime} placeholder="選擇啟用時間" />
              </div>

              {/*結束時間*/}
              <div className="grid grid-cols-3 border-b border-border/30 pb-2 items-center">
                <span className="font-medium text-muted-foreground">結束時間</span>
                <DateTimePicker value={endTime} onChange={setEndTime} placeholder="選擇結束時間" />
              </div>

              {/*最大兌換量*/}
              <div className="grid grid-cols-3 border-b border-border/30 pb-2 items-center">
                <span className="font-medium text-muted-foreground">最大兌換量</span>
                <input
                  type="number"
                  placeholder="不設限制"
                  value={maxUsesInput}
                  onChange={(e) => setMaxUsesInput(e.target.value)}
                  className="col-span-2 bg-transparent border border-border rounded px-2 py-1 text-foreground"
                />
              </div>
            </div>

            {/*Footer*/}
            <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedPromo(null)}
                className="bg-transparent text-muted-foreground hover:text-foreground"
              >
                取消
              </Button>
              <Button
                disabled={!isFormValid()}
                onClick={() => setConfirmType("save")}
                className="gap-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground disabled:opacity-30"
              >
                <Check className="h-4 w-4" /> 儲存
              </Button>
            </div>
          </div>
        </div>
      )}

      {/*第二層：二次確認彈窗*/}
      {confirmType && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            {/*儲存確認*/}
            {confirmType === "save" && (
              <>
                <h4 className="text-lg font-bold text-foreground">確認儲存優惠碼</h4>
                <p className="text-sm text-muted-foreground">確定要儲存此優惠碼設定嗎？</p>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setConfirmType(null)} className="bg-transparent text-muted-foreground hover:text-foreground">取消</Button>
                  <Button onClick={handleDataAction} className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">確認</Button>
                </div>
              </>
            )}

            {/*刪除確認*/}
            {confirmType === "delete" && (
              <>
                <h4 className="text-lg font-bold text-foreground">確認刪除優惠碼</h4>
                <p className="text-sm text-muted-foreground">確定要刪除此優惠碼嗎？刪除後將無法復原。</p>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setConfirmType(null)} className="bg-transparent text-muted-foreground hover:text-foreground">取消</Button>
                  <Button onClick={handleDataAction} variant="destructive">確認刪除</Button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}