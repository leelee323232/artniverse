"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PostCard, type Post } from "@/components/posts/PostCard";
import { Plus, Image, Trash2, MessageSquare } from "lucide-react";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImages, setNewPostImages] = useState<File[]>([]);

  // 選擇圖片
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    setNewPostImages((prev) => {
      const combined = [...prev, ...files];
      return combined.slice(0, 10);
    });
  };

  // 發佈貼文
  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: `POST-${Date.now()}`,
      authorName: "管理員",
      authorAvatar: "",
      isVerified: true,
      content: newPostContent,
      images: newPostImages.map((file) => URL.createObjectURL(file)),
      likes: 0,
      isLiked: false,
      comments: [],
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    setPosts((prev) => [newPost, ...prev]);

    // 清空表單
    setNewPostContent("");
    setNewPostImages([]);

    // 關閉 Dialog
    setIsPostModalOpen(false);
  };

  // 刪除貼文
  const handleDelete = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  return (
    <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        {/* 左側標題 */}
        <div>
          <h1 className="text-xl font-bold text-foreground">過往貼文牆</h1>

          <p className="text-sm text-muted-foreground">
            發佈創作動態、新品花絮，與追蹤粉絲進行零距離留言互動。
          </p>
        </div>

        <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" />
              發佈新貼文
            </Button>
          </DialogTrigger>

          <DialogContent
            className="
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              bg-[#101010]
              p-0
              text-white
              shadow-2xl
              sm:max-w-xl
            "
          >
            {/* Header */}
            <div className="flex h-14 items-center justify-between border-b border-white/10 px-5">
              <Button
                variant="ghost"
                onClick={() => setIsPostModalOpen(false)}
                className="
                  h-auto
                  p-0
                  text-sm
                  font-medium
                  text-white/70
                  hover:bg-transparent
                  hover:text-white
                "
              >
                取消
              </Button>
              <h2 className="text-base font-semibold">新貼文</h2>
              <div className="w-8" />
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto py-2">
              <div className="flex gap-4 px-5 pt-2">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div
                    className="
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                    "
                  >
                    <img
                      src="/images/logos/logo_sm_white.png"
                      alt="ARTNIVERSE"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* 右側內容 */}
                <div className="flex-1">
                  <span className="font-semibold text-white">ARTNIVERSE</span>

                  <Textarea
                    placeholder="有什麼新鮮事？"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    maxLength={500}
                    className="
                      mt-3
                      min-h-[100px]
                      resize-none
                      border-0
                      bg-transparent
                      p-0
                      text-lg
                      leading-7
                      text-white
                      shadow-none
                      placeholder:text-white/35
                      focus-visible:ring-0
                    "
                  />

                  {/* 字數 */}
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs text-white/35">
                      {newPostImages.length}/10 張圖片
                    </span>

                    <span
                      className={`text-xs ${
                        newPostContent.length > 450
                          ? "text-yellow-400"
                          : "text-white/30"
                      }`}
                    >
                      {newPostContent.length}/500
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 px-5">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <label
                  htmlFor="image-upload"
                  className="
                    flex
                    h-9
                    w-9
                    cursor-pointer
                    items-center
                    justify-center
                    rounded-full
                    text-white/70
                    transition
                    hover:bg-white/10
                    hover:text-white
                  "
                >
                  <Image className="h-5 w-5" />
                </label>

                {newPostImages.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2 overflow-hidden rounded-xl">
                    {newPostImages.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="
                          relative
                          aspect-square
                          overflow-hidden
                          rounded-xl
                        "
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`預覽 ${index + 1}`}
                          className="h-full w-full object-cover"
                        />

                        {/* 刪除圖片 */}
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="
                            absolute
                            right-2
                            top-2
                            h-7
                            w-7
                            rounded-full
                          "
                          onClick={() => {
                            setNewPostImages((prev) =>
                              prev.filter((_, i) => i !== index),
                            );
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="justify-end px-5 pb-3">
              <Button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim()}
                className="
                  rounded-full
                  bg-white
                  px-6
                  text-black
                  hover:bg-white/90
                "
              >
                發佈
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {posts.length > 0 ? (
        <div className="w-full space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="relative w-full">
              <PostCard post={post} />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="
            rounded-lg
            border
            border-dashed
            border-border/50
            py-16
            text-center
          "
        >
          <MessageSquare
            className="
              mx-auto
              mb-3
              h-12
              w-12
              text-muted-foreground
            "
          />

          <p className="text-sm text-muted-foreground">
            還沒有任何貼文，發佈第一則吧！
          </p>
        </div>
      )}
    </Card>
  );
}
