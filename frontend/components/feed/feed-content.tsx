"use client";

import { useState, useEffect } from "react";
import { PostCard } from "@/components/feed/post-card";
import { Loader2 } from "lucide-react";

import type { Post } from "@/lib/posts/types";
import { brandPosts } from "@/lib/posts/brand-posts";

export function FeedContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"following" | "discover">(
    "following",
  );

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setPosts(brandPosts);
      setIsLoading(false);
    };
    loadPosts();
  }, []);

  const handleTabChange = (tab: "following" | "discover") => {
    setActiveTab(tab);
    // 展示階段兩個分頁使用同一組品牌資料，避免混入其他假貼文或重複追加。
    setPosts(brandPosts);
  };

  return (
    <main className="flex-1 max-w-xl w-full mx-auto">
      {/* Feed Section Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="font-semibold text-lg text-foreground">動態牆</h2>
        <div className="flex gap-2">
          <button
            className={`text-sm px-4 py-1.5 rounded-full transition-colors font-medium ${
              activeTab === "following"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={() => handleTabChange("following")}
          >
            追蹤中
          </button>
          <button
            className={`text-sm px-4 py-1.5 rounded-full transition-colors font-medium ${
              activeTab === "discover"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={() => handleTabChange("discover")}
          >
            探索
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
