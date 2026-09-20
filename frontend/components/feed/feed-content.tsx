"use client";

import { useState, useEffect } from "react";
import { PostCard } from "@/components/feed/post-card";
import { Loader2 } from "lucide-react";

interface Post {
  id: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
    username: string;
  };
  image: string;
  title: string;
  description: string;
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

// Simulated posts data
const followedPosts: Post[] = [
  {
    id: "1",
    creator: {
      id: "1",
      name: "小雨插畫",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      username: "rainydraw",
    },
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800",
    title: "城市漫遊系列 #3",
    description: "今天完成了城市漫遊系列的第三幅作品！靈感來自雨後的台北街頭",
    likes: 234,
    comments: 18,
    timeAgo: "2 小時前",
    isLiked: true,
  },
  {
    id: "2",
    creator: {
      id: "2",
      name: "木子手作",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      username: "muzi_craft",
    },
    image: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800",
    title: "新品預告",
    description:
      "全新木質手機支架即將上架！採用台灣檜木製作，每一個都是獨一無二的紋理",
    likes: 156,
    comments: 24,
    timeAgo: "4 小時前",
  },
  {
    id: "3",
    creator: {
      id: "3",
      name: "織夢工坊",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      username: "dream_weaver",
    },
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    title: "手織圍巾製作過程",
    description: "分享一下這條彩虹漸層圍巾的製作過程，花了整整三天才完成",
    likes: 342,
    comments: 45,
    timeAgo: "6 小時前",
    isSaved: true,
  },
];

const discoverPosts: Post[] = [
  {
    id: "4",
    creator: {
      id: "4",
      name: "土土陶藝",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      username: "tutu_pottery",
    },
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800",
    title: "柴燒茶杯出窯",
    description:
      "經過 72 小時的柴燒，這批茶杯終於出窯了！每一個的落灰效果都不同",
    likes: 521,
    comments: 67,
    timeAgo: "8 小時前",
  },
  {
    id: "5",
    creator: {
      id: "5",
      name: "針線花園",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      username: "stitch_garden",
    },
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800",
    title: "植物刺繡新作",
    description: "新完成的蕨類植物刺繡，用了五種不同的綠色線",
    likes: 287,
    comments: 31,
    timeAgo: "10 小時前",
  },
  {
    id: "6",
    creator: {
      id: "6",
      name: "筆墨軒",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100",
      username: "ink_studio",
    },
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800",
    title: "書法日常",
    description: "每天練字一小時，今天臨摹的是顏真卿的《祭姪文稿》",
    likes: 198,
    comments: 22,
    timeAgo: "12 小時前",
  },
];

export function FeedContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDiscover, setShowDiscover] = useState(false);
  const [activeTab, setActiveTab] = useState<"following" | "discover">(
    "following",
  );

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setPosts(followedPosts);
      setIsLoading(false);
    };
    loadPosts();
  }, []);

  const handleTabChange = (tab: "following" | "discover") => {
    setActiveTab(tab);
    if (tab === "discover" && !showDiscover) {
      setShowDiscover(true);
      setPosts((prev) => [...prev, ...discoverPosts]);
    }
  };

  const loadMorePosts = () => {
    if (!showDiscover) {
      setShowDiscover(true);
      setActiveTab("discover");
      setPosts((prev) => [...prev, ...discoverPosts]);
    }
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

          {/* Load More / Discover Section */}
          {!showDiscover && activeTab === "following" && (
            <div className="text-center py-8 bg-card rounded-xl border border-border/50">
              <p className="text-muted-foreground mb-3">
                你已經看完追蹤創作者的所有貼文
              </p>
              <button
                onClick={loadMorePosts}
                className="text-violet-500 font-medium hover:text-violet-400 transition-colors"
              >
                探索更多創作者
              </button>
            </div>
          )}

          {showDiscover && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                繼續往下滑，探索更多精彩作品
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
