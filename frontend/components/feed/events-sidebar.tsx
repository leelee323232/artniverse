"use client";

import Link from "next/link";
import { Calendar, MapPin, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { TheCard } from "@/components/common/TheCard";

interface Event {
  id: string;
  title: string;
  type: "platform" | "creator";
  date: string;
  location?: string;
  creator?: {
    name: string;
    avatar: string;
  };
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

const creatorEvents: Event[] = [
  {
    id: "4",
    title: "小雨插畫展「城市漫遊」",
    type: "creator",
    date: "6/20 - 7/5",
    location: "台北華山",
    creator: {
      name: "小雨",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    },
  },
  {
    id: "5",
    title: "手作工作坊開課",
    type: "creator",
    date: "6/25 14:00",
    location: "線上課程",
    creator: {
      name: "木子手作",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    },
  },
  {
    id: "6",
    title: "新品發表直播",
    type: "creator",
    date: "6/18 20:00",
    location: "Instagram Live",
    creator: {
      name: "織夢工坊",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    },
  },
];

export function EventsSidebar({
  layout = "vertical",
}: {
  layout?: "vertical" | "horizontal";
}) {
  if (layout === "horizontal") {
    return (
      <div className="space-y-4">
        {/* Platform Events */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold">平台活動</h3>
            <Link
              href="/events"
              className="text-xs font-medium text-primary hover:text-primary/80"
            >
              查看全部 →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {platformEvents.map((event) => (
              <Link
                key={event.id}
                href={`/event/${event.id}`}
                className="group w-56 shrink-0"
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
              </Link>
            ))}
          </div>
        </section>

        {/* Creator Events */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold">創作者活動</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {creatorEvents.map((event) => (
              <Link
                key={event.id}
                href={`/event/${event.id}`}
                className="group w-64 shrink-0"
              >
                <div className="h-full rounded-xl border border-white/10 bg-card/40 p-3 backdrop-blur-sm transition-colors hover:bg-card/60">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage
                        src={event.creator?.avatar}
                        alt={event.creator?.name}
                      />
                      <AvatarFallback className="bg-accent/10 text-xs text-accent">
                        {event.creator?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.creator?.name}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {event.date}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <aside className="w-72 shrink-0 space-y-4">
      {/* Platform Events */}
      <TheCard title="平台活動" highlightOnHover={false}>
        <CardContent className="space-y-3">
          {platformEvents.map((event) => (
            <Link
              key={event.id}
              href={`/event/${event.id}`}
              className="block group"
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
            </Link>
          ))}
          <Link
            href="/events"
            className="block text-sm text-primary hover:text-primary/80 font-medium pt-2"
          >
            查看全部活動 →
          </Link>
        </CardContent>
      </TheCard>

      {/* Creator Events */}
      <TheCard title="創作者活動" highlightOnHover={false}>
        <CardContent className="space-y-3">
          {creatorEvents.map((event, index) => (
            <div key={event.id}>
              <Link href={`/event/${event.id}`} className="block group">
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage
                      src={event.creator?.avatar}
                      alt={event.creator?.name}
                    />
                    <AvatarFallback className="text-xs bg-accent/10 text-accent">
                      {event.creator?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {event.creator?.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {event.date}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
              {index < creatorEvents.length - 1 && (
                <Separator className="my-2 bg-border/50" />
              )}
            </div>
          ))}
        </CardContent>
      </TheCard>
    </aside>
  );
}
