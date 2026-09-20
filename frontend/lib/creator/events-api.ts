export type EventStatus = "approved" | "pending" | "ended" | "cancelled";

/**
 * 與組員活動 JSON 對齊的欄位：title / startTime / endTime
 * 新增欄位：address / boothStartTime / boothEndTime / note
 * 組員已定義但創作者申請表單尚未做：linkUrl / imageUrl / sortOrder / publishStartTime / isActive / publishEndTime
 */
export interface EventApplication {
  id: string;
  title: string;
  address: string;
  startTime: string;
  endTime: string;
  boothStartTime: string;
  boothEndTime: string;
  note: string;
  status: EventStatus;
  createdAt: string;
}

export interface EventApplicationInput {
  title: string;
  address: string;
  startTime: string;
  endTime: string;
  boothStartTime: string;
  boothEndTime: string;
  note: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const EVENTS_ENDPOINT = `${API_BASE}/api/creator/events`;

// 取得目前創作者的所有活動申請
export async function getEvents(): Promise<EventApplication[]> {
  const res = await fetch(EVENTS_ENDPOINT, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`取得活動列表失敗（${res.status}）`);
  }

  return (await res.json()) as EventApplication[];
}

// 送出新的活動申請（可一次送出多筆），送出後由後端建立審核中的紀錄
export async function createEvents(
  events: EventApplicationInput[],
): Promise<EventApplication[]> {
  const res = await fetch(EVENTS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events }),
  });

  if (!res.ok) {
    throw new Error(`送出活動申請失敗（${res.status}）`);
  }

  return (await res.json()) as EventApplication[];
}
