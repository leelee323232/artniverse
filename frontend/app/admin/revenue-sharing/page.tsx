"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable, type AdminTableColumn } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCreators } from "@/mocks/admin/creators";
import type { Creator } from "@/types/admin";
import { mockCommissionRequests, type CommissionRequestStatus } from "@/types/commission-request";

const STORAGE_KEY = "admin_revenue_sharing_v1";
const DEFAULT_RATE = 20;
type Rates = Record<string, number>;
type ShareRow = { id: string; name: string; detail: string; status: string };
const QUEST_STATUS_LABELS: Record<CommissionRequestStatus, string> = {
  pending: "待審核",
  approved: "待媒合",
  contracting: "待簽約",
  "in-progress": "進行中",
  delivery: "待驗收",
  completed: "已完成",
  rejected: "已拒絕",
};

function readRates(value: unknown): Rates {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([, rate]) =>
    typeof rate === "number" && Number.isInteger(rate) && rate >= 0 && rate <= 100,
  ));
}

export default function RevenueSharingPage() {
  const [creators, setCreators] = useState<Creator[]>(mockCreators);
  const [rates, setRates] = useState<Rates>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      setRates(readRates(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")));
      const savedCreators: unknown = JSON.parse(localStorage.getItem("admin_creators_data") || "null");
      if (Array.isArray(savedCreators) && savedCreators.every((item) =>
        item && typeof item.id === "string" && typeof item.name === "string",
      )) setCreators(savedCreators);
    } catch {
      setMessage("無法讀取本機設定，目前顯示預設值。");
    }
    setReady(true);
  }, []);

  const save = (id: string) => {
    const value = drafts[id] ?? String(rates[id] ?? DEFAULT_RATE);
    const rate = Number(value);
    if (!/^\d+$/.test(value) || !Number.isInteger(rate) || rate < 0 || rate > 100) {
      setMessage("請輸入 0～100 之間的整數分潤百分比。");
      return;
    }
    const next = { ...rates, [id]: rate };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setRates(next);
      setDrafts((previous) => { const copy = { ...previous }; delete copy[id]; return copy; });
      setMessage("分潤設定已儲存至此瀏覽器。");
    } catch {
      setMessage("儲存失敗，請確認瀏覽器允許本機儲存後重試。");
    }
  };

  const columns: AdminTableColumn<ShareRow>[] = [
    { key: "name", header: "名稱 / 基本資訊", render: (item) => (
      <div className="min-w-48 space-y-1 py-2">
        <p className="font-medium">{item.name}</p>
        <p className="text-xs text-muted-foreground">{item.detail}</p>
      </div>
    ) },
    { key: "status", header: "狀態", render: (item) => <Badge variant="secondary">{item.status}</Badge> },
    { key: "rate", header: "平台分潤", render: (item) => (
      <div className="flex items-center gap-2">
        <Input
          aria-label={`${item.name}的平台分潤百分比`}
          type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3}
          className="w-24" disabled={!ready}
          value={drafts[item.id] ?? String(rates[item.id] ?? DEFAULT_RATE)}
          onChange={(event) => {
            if (!/^\d*$/.test(event.target.value)) return;
            setDrafts({ ...drafts, [item.id]: event.target.value });
            setMessage("");
          }}
        />
        <span className="text-muted-foreground">%</span>
      </div>
    ) },
    { key: "actions", header: "操作", headClassName: "text-right", render: (item) => (
      <div className="flex justify-end gap-2 whitespace-nowrap">
        <Button variant="ghost" size="sm" disabled={!ready || (drafts[item.id] ?? String(rates[item.id] ?? DEFAULT_RATE)) === "20"}
          onClick={() => { setDrafts({ ...drafts, [item.id]: "20" }); setMessage("已填入預設 20%，請按儲存套用。"); }}>重設 20%</Button>
        <Button size="sm" disabled={!ready || drafts[item.id] === undefined || drafts[item.id] === String(rates[item.id] ?? DEFAULT_RATE)}
          onClick={() => save(item.id)}>儲存</Button>
      </div>
    ) },
  ];

  const creatorRows: ShareRow[] = creators.map((creator) => ({
    id: `creator:${creator.id}`, name: creator.name,
    detail: creator.specialty || "尚未填寫專長",
    status: creator.isActive ? "啟用中" : "已停用",
  }));
  const questRows: ShareRow[] = mockCommissionRequests.map((quest) => ({
    id: `quest:${quest.id}`, name: quest.title,
    detail: `${quest.id} · 預算 NT$ ${quest.budget} · 截止 ${quest.deadline}`,
    status: QUEST_STATUS_LABELS[quest.status],
  }));
  const filter = (items: ShareRow[]) => items.filter((item) =>
    `${item.name} ${item.detail}`.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <AdminPageHeader title="分潤管理" description="管理一般創作者與企業委託案的平台分潤比例。" />
      <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
        預設平台分潤 <strong className="text-primary">20%</strong>，其餘 80% 歸創作者。可針對各創作者或委託案個別調整。
        <p className="mt-1 text-xs text-muted-foreground">MVP 示範：設定僅儲存於此瀏覽器，尚未串接實際結算。</p>
      </div>
      <Tabs defaultValue="creators" onValueChange={() => { setQuery(""); setSearchQuery(""); setMessage(""); }}>
        <TabsList aria-label="分潤管理類別">
          <TabsTrigger value="creators">一般創作者</TabsTrigger>
          <TabsTrigger value="quests">企業委託案</TabsTrigger>
        </TabsList>
        <form className="my-4 flex max-w-md gap-2" role="search" onSubmit={(event) => { event.preventDefault(); setSearchQuery(query); }}>
          <Input aria-label="搜尋名稱或編號" placeholder="搜尋名稱或編號…" value={query} onChange={(event) => setQuery(event.target.value)} />
          <Button type="submit" className="shrink-0">查詢</Button>
        </form>
        <p role="status" className="mb-3 text-sm text-muted-foreground">{message || "修改比例後，請按該列的「儲存」。"}</p>
        <TabsContent value="creators"><AdminTable columns={columns} items={filter(creatorRows)} loading={!ready} emptyText="找不到符合條件的創作者" /></TabsContent>
        <TabsContent value="quests"><AdminTable columns={columns} items={filter(questRows)} loading={!ready} emptyText="找不到符合條件的企業委託案" /></TabsContent>
      </Tabs>
    </div>
  );
}
