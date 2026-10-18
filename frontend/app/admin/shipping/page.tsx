"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Truck, MapPin, Gift, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  DEFAULT_SHIPPING_RULES, SHIPPING_STORAGE_KEY, SHIPPING_ZONES, SHIPPING_METHODS,
  parseShippingRules, quoteShipping, validateShippingRule,
  type ShippingRule, type ShippingZone, type ShippingMethod, type FreeShipping,
} from "@/lib/commerce/shipping";

const money = (value: number) => `NT$ ${value.toLocaleString("zh-TW")}`;
const selectClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground";
type RuleDraft = { id?: string; name: string; zone: ShippingZone; method: ShippingMethod; fee: string; freeShipping: FreeShipping; threshold: string; enabled: boolean };
const freshDraft = (): RuleDraft => ({ name: "", zone: "mainland", method: "home", fee: "80", freeShipping: "threshold", threshold: "1000", enabled: false });
const freeLabel = (rule: ShippingRule) => rule.freeShipping === "always" ? "無條件免運" : rule.freeShipping === "threshold" ? `滿 ${money(rule.threshold!)} 免運` : "不免運";

export default function ShippingManagementPage() {
  const [rules, setRules] = useState<ShippingRule[]>(DEFAULT_SHIPPING_RULES);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState<RuleDraft | null>(null);
  const [formError, setFormError] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [testZone, setTestZone] = useState<ShippingZone>("mainland");
  const [testMethod, setTestMethod] = useState<ShippingMethod>("home");
  const [testSubtotal, setTestSubtotal] = useState("800");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SHIPPING_STORAGE_KEY);
      if (raw !== null) setRules(parseShippingRules(raw));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "無法讀取運費設定。");
    } finally { setReady(true); }
  }, []);

  function persist(next: ShippingRule[]) {
    try {
      localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(next));
      setRules(next);
      return true;
    } catch {
      setNotice("儲存失敗，請確認瀏覽器允許儲存後再試。設定尚未變更。");
      return false;
    }
  }

  function edit(rule?: ShippingRule) {
    setFormError(""); setNotice("");
    setDraft(rule ? { id: rule.id, name: rule.name, zone: rule.zone, method: rule.method, fee: String(rule.fee), freeShipping: rule.freeShipping, threshold: String(rule.threshold ?? 1000), enabled: rule.enabled } : freshDraft());
  }

  function save() {
    if (!draft || !ready || loadError) return;
    const current = rules.find(rule => rule.id === draft.id);
    const next: ShippingRule = {
      id: draft.id ?? crypto.randomUUID(), name: draft.name.trim(), country: "TW", currency: "TWD",
      zone: draft.zone, method: draft.method,
      fee: draft.freeShipping === "always" ? 0 : draft.fee.trim() ? Number(draft.fee) : NaN,
      freeShipping: draft.freeShipping, threshold: draft.freeShipping === "threshold" ? (draft.threshold.trim() ? Number(draft.threshold) : NaN) : null,
      enabled: draft.enabled, version: (current?.version ?? 0) + 1,
    };
    const issue = validateShippingRule(next, rules);
    if (issue) { setFormError(issue); return; }
    if (persist(current ? rules.map(rule => rule.id === current.id ? next : rule) : [...rules, next])) {
      setDraft(null); setNotice(`已儲存「${next.name}」。`);
    }
  }

  function toggle(rule: ShippingRule) {
    const next = { ...rule, enabled: !rule.enabled, version: rule.version + 1 };
    const issue = validateShippingRule(next, rules);
    if (issue) { setNotice(issue); return; }
    if (persist(rules.map(item => item.id === rule.id ? next : item))) setNotice(`已${next.enabled ? "啟用" : "停用"}「${rule.name}」。`);
  }

  const active = rules.filter(rule => rule.enabled);
  const visible = rules.filter(rule => (zoneFilter === "all" || rule.zone === zoneFilter) && (statusFilter === "all" || rule.enabled === (statusFilter === "enabled")));
  const quote = quoteShipping(rules, testZone, testMethod, testSubtotal.trim() ? Number(testSubtotal) : NaN);
  const blocked = !ready || Boolean(loadError);

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-foreground">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><div className="mb-2 flex items-center gap-2"><Badge variant="outline">台灣配送</Badge><span className="text-xs text-muted-foreground">TWD · 新台幣</span></div><h1 className="text-2xl font-bold">運費管理</h1><p className="mt-2 text-sm text-muted-foreground">依配送區域與方式設定運費，管理每筆訂單的免運條件。</p></div>
        <Button disabled={blocked} onClick={() => edit()} className="gap-2 bg-gradient-to-r from-primary to-secondary"><Plus className="h-4 w-4" />新增運費規則</Button>
      </div>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-muted-foreground">目前為管理頁預覽，設定儲存在此瀏覽器，尚未套用至購物車與結帳。超商與離島費率為範例，確認後可自行啟用。</div>
      {loadError && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{loadError} 為避免覆蓋原資料，目前暫停編輯與試算。</p>}
      {notice && <p role="status" className="rounded-lg border border-border bg-card p-3 text-sm">{notice}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        {[{ label: "啟用規則", value: `${active.length} 筆`, icon: Truck }, { label: "開放配送區域", value: `${new Set(active.map(rule => rule.zone)).size} / 2`, icon: MapPin }, { label: "提供免運的規則", value: `${active.filter(rule => rule.freeShipping !== "none").length} 筆`, icon: Gift }].map(({ label, value, icon: Icon }) => <Card key={label} className="flex items-center gap-4 bg-card/60 p-5"><div className="rounded-xl bg-primary/10 p-3"><Icon className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold">{blocked ? "—" : value}</p></div></Card>)}
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0 overflow-hidden bg-card/60">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5"><h2 className="font-semibold">配送規則</h2><div className="flex flex-wrap gap-2"><select aria-label="篩選配送區域" className={`${selectClass} w-auto`} value={zoneFilter} onChange={e => setZoneFilter(e.target.value)}><option value="all">全部區域</option>{Object.entries(SHIPPING_ZONES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><select aria-label="篩選規則狀態" className={`${selectClass} w-auto`} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">全部狀態</option><option value="enabled">已啟用</option><option value="disabled">已停用</option></select></div></div>
          {!ready ? <p className="p-8 text-center text-sm text-muted-foreground">載入設定中…</p> : loadError ? <p className="p-8 text-center text-sm text-muted-foreground">無法載入設定</p> : <div className="overflow-x-auto"><table className="w-full whitespace-nowrap text-left text-sm"><thead className="bg-muted/30 text-muted-foreground"><tr>{["規則 / 區域", "配送方式", "基本運費", "免運條件", "狀態", "操作"].map(label => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead><tbody>{visible.map(rule => <tr key={rule.id} className="border-t border-border/50 hover:bg-muted/20"><td className="px-4 py-4"><p className="max-w-48 truncate font-medium" title={rule.name}>{rule.name}</p><p className="mt-1 text-xs text-muted-foreground">{SHIPPING_ZONES[rule.zone]}</p></td><td className="px-4 py-4">{SHIPPING_METHODS[rule.method]}</td><td className="px-4 py-4">{money(rule.fee)}</td><td className="px-4 py-4">{freeLabel(rule)}</td><td className="px-4 py-4"><Badge variant="outline" className={rule.enabled ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : "text-muted-foreground"}>{rule.enabled ? "已啟用" : "已停用"}</Badge></td><td className="px-4 py-4"><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => edit(rule)} aria-label={`編輯${rule.name}`}><Pencil className="mr-1 h-3.5 w-3.5" />編輯</Button><Button variant="ghost" size="sm" onClick={() => toggle(rule)} aria-label={`${rule.enabled ? "停用" : "啟用"}${rule.name}`}>{rule.enabled ? "停用" : "啟用"}</Button></div></td></tr>)}</tbody></table>{!visible.length && <p className="p-10 text-center text-sm text-muted-foreground">沒有符合篩選條件的規則。</p>}</div>}
          <div className="border-t border-border p-4 text-xs leading-relaxed text-muted-foreground">同一區域與配送方式只能啟用一筆規則。未啟用的組合視為暫不配送；本島與離島各自計價。</div>
        </Card>
        <Card className="space-y-4 bg-card/60 p-5">
          <h2 className="flex items-center gap-2 font-semibold"><Calculator className="h-4 w-4 text-primary" />運費試算</h2><p className="text-xs leading-relaxed text-muted-foreground">以一筆訂單的折扣後商品小計試算，不含運費。</p>
          <fieldset disabled={blocked} className="space-y-4"><div className="space-y-2"><Label htmlFor="test-zone">配送區域</Label><select id="test-zone" className={selectClass} value={testZone} onChange={e => setTestZone(e.target.value as ShippingZone)}>{Object.entries(SHIPPING_ZONES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div><div className="space-y-2"><Label htmlFor="test-method">配送方式</Label><select id="test-method" className={selectClass} value={testMethod} onChange={e => setTestMethod(e.target.value as ShippingMethod)}>{Object.entries(SHIPPING_METHODS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div><div className="space-y-2"><Label htmlFor="test-subtotal">商品小計（NT$）</Label><Input id="test-subtotal" type="number" min="0" step="1" value={testSubtotal} onChange={e => setTestSubtotal(e.target.value)} /></div></fieldset>
          <div aria-live="polite" className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">{blocked ? <p className="text-sm text-muted-foreground">設定載入完成後即可試算。</p> : quote.available ? <><p className="text-xs text-muted-foreground">套用：{quote.rule.name}</p><div className="flex justify-between text-sm"><span>運費</span><span className="font-semibold">{quote.fee === 0 ? "免運" : money(quote.fee)}</span></div><div className="flex justify-between border-t border-border pt-3 font-semibold"><span>應付總額</span><span>{money(quote.total)}</span></div><p className="text-xs text-primary">{quote.reason}</p>{quote.remaining !== null && quote.remaining > 0 && <p className="text-xs text-muted-foreground">再購買 {money(quote.remaining)} 可享免運</p>}</> : <p className="text-sm text-muted-foreground">{quote.reason}</p>}</div>
        </Card>
      </div>
      <Card className="bg-card/40 p-5"><h2 className="mb-2 text-sm font-semibold">計價原則</h2><p className="text-sm leading-relaxed text-muted-foreground">免運門檻按每筆訂單計算，不合併不同創作者或拆分訂單的金額。本版僅管理台灣配送運費；稅金設定與海外配送留待後續擴充。</p></Card>
      <AdminModal open={draft !== null} title={draft?.id ? "編輯運費規則" : "新增運費規則"} onClose={() => setDraft(null)} onSubmit={save}>
        {draft && <>
          <p className="text-sm text-muted-foreground">適用台灣配送，金額以新台幣計算。</p>
          <div className="space-y-2"><Label htmlFor="rule-name">規則名稱</Label><Input id="rule-name" required maxLength={60} value={draft.name} placeholder="例如：本島宅配滿額免運" onChange={e => setDraft({ ...draft, name: e.target.value })} /></div>
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="rule-zone">配送區域</Label><select id="rule-zone" className={selectClass} value={draft.zone} onChange={e => setDraft({ ...draft, zone: e.target.value as ShippingZone })}>{Object.entries(SHIPPING_ZONES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div><div className="space-y-2"><Label htmlFor="rule-method">配送方式</Label><select id="rule-method" className={selectClass} value={draft.method} onChange={e => setDraft({ ...draft, method: e.target.value as ShippingMethod })}>{Object.entries(SHIPPING_METHODS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div></div>
          <div className="space-y-2"><Label htmlFor="rule-free">免運條件</Label><select id="rule-free" className={selectClass} value={draft.freeShipping} onChange={e => setDraft({ ...draft, freeShipping: e.target.value as FreeShipping })}><option value="none">不免運</option><option value="threshold">滿額免運</option><option value="always">無條件免運</option></select></div>
          {draft.freeShipping !== "always" && <div className="space-y-2"><Label htmlFor="rule-fee">基本運費（NT$）</Label><Input id="rule-fee" type="number" required min="0" step="1" value={draft.fee} onChange={e => setDraft({ ...draft, fee: e.target.value })} /></div>}
          {draft.freeShipping === "threshold" && <div className="space-y-2"><Label htmlFor="rule-threshold">免運門檻（NT$）</Label><Input id="rule-threshold" type="number" required min="1" step="1" value={draft.threshold} onChange={e => setDraft({ ...draft, threshold: e.target.value })} /><p className="text-xs text-muted-foreground">折扣後商品小計達此金額即免運，不含運費。</p></div>}
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm"><input type="checkbox" checked={draft.enabled} onChange={e => setDraft({ ...draft, enabled: e.target.checked })} />啟用此配送規則</label>
          <p className="text-xs text-muted-foreground">如相同區域與方式已有啟用規則，請先停用原規則再啟用此規則。</p>
          {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
        </>}
      </AdminModal>
    </div>
  );
}
