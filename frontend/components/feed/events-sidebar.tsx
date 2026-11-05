"use client";

import { useState } from "react";
import { FeatureUnavailableDialog } from "@/components/common/FeatureUnavailableDialog";
import { Calendar, ChevronRight } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { TheCard } from "@/components/common/TheCard";

interface Event {
  id: string;
  title: string;
  type: "platform";
  date: string;
  isNew?: boolean;
}

const platformEvents: Event[] = [
  {
    id: "1",
    title: "夏日創作祭 - 限時優惠",
    type: "platform",
    date: "6/15 - 6/30",
    isNew: true,
  },
  {
    id: "2",
    title: "新銳創作者招募中",
    type: "platform",
    date: "即日起至 7/15",
  },
  {
    id: "3",
    title: "插畫家聯展徵件",
    type: "platform",
    date: "6/10 截止",
  },
];

export function EventsSidebar({
  layout = "vertical",
}: {
  layout?: "vertical" | "horizontal";
}) {
  const [noticeOpen, setNoticeOpen] = useState(false);

  if (layout === "horizontal") {
    return (
      <div className="space-y-4">
        {/* Platform Events */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold">平台活動</h3>
            <button
              type="button" onClick={() => setNoticeOpen(true)} aria-haspopup="dialog"
              className="text-xs font-medium text-primary hover:text-primary/80"
            >
              查看全部 →
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {platformEvents.map((event) => (
              <button
                key={event.id}
                type="button" onClick={() => setNoticeOpen(true)} aria-haspopup="dialog"
                className="group w-56 shrink-0 text-left"
              >
                <div className="h-full rounded-xl border border-white/10 bg-card/40 p-3 backdrop-blur-sm transition-colors hover:bg-card/60">
                  <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                    {event.title}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {event.date}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <FeatureUnavailableDialog open={noticeOpen} onOpenChange={setNoticeOpen} />
      </div>
    );
  }

  return (
    <aside className="w-72 shrink-0 space-y-4">
      {/* Platform Events */}
      <TheCard title="平台活動" highlightOnHover={false}>
        <CardContent className="space-y-3">
          {platformEvents.map((event) => (
            <button
              key={event.id}
              type="button" onClick={() => setNoticeOpen(true)} aria-haspopup="dialog"
              className="block group w-full text-left"
            >
              <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {event.title}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {event.date}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </button>
          ))}
          <button
            type="button" onClick={() => setNoticeOpen(true)} aria-haspopup="dialog"
            className="block text-sm text-primary hover:text-primary/80 font-medium pt-2"
          >
            查看全部活動 →
          </button>
        </CardContent>
      </TheCard>

      <FeatureUnavailableDialog open={noticeOpen} onOpenChange={setNoticeOpen} />
    </aside>
  );
}
