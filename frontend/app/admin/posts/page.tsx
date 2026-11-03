"use client";

import Link from "next/link";
import { useAdminPosts } from "@/lib/posts/use-admin-posts";

import { useAuth } from "@/lib/auth-context";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { PostCard } from "@/components/posts/PostCard";
import { Plus, Image, Trash2, MessageSquare } from "lucide-react";

export default function AdminPostsPage() {
  const { user, isLoading } = useAuth();
  if (isLoading || !user) return <div className="space-y-3">
    <p>{isLoading ? "確認登入中…" : "請先登入管理員帳號。"}</p>
    {!isLoading && <Link href="/login/" className="underline">前往登入</Link>}
  </div>;
  return <MemberAdminPosts key={user.id} />;
}

function MemberAdminPosts() {
  const { result, page, setPage, loading, allowed, listError, error, notice, saving, pending, refresh,
    isPostModalOpen, setIsPostModalOpen, newPostContent, setNewPostContent, newPostImages, setNewPostImages,
    handleImageUpload, handleCreatePost, handleDelete } = useAdminPosts();
  const posts = result?.data ?? [];
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  useEffect(() => {
    const urls = newPostImages.map(file => URL.createObjectURL(file));
    setPreviewImages(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [newPostImages]);
  return (
    <>
      <div>
        <AdminPageHeader
          title="貼文牆"
          description="發佈官方動態與新品花絮。"
          action={
            <Dialog
              open={isPostModalOpen}
              onOpenChange={setIsPostModalOpen}
            >
              <DialogTrigger asChild>
                <Button disabled={!allowed || saving} className="gap-1.5 bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/20">
                  <Plus className="h-4 w-4" />
                  發佈新貼文
                </Button>
              </DialogTrigger>

              <DialogContent
                showCloseButton={!saving}
                aria-describedby={undefined}
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
                    disabled={saving}
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
                  <DialogTitle className="text-base font-semibold">新貼文</DialogTitle>
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
                      <span className="font-semibold text-white">
                        ARTNIVERSE
                      </span>

                      <Textarea
                        disabled={saving || !!pending}
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
                          已選擇 {newPostImages.length}/10 張圖片，每張最多 5 MB
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
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      disabled={saving || !!pending}
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
                      <div className="mt-2 grid grid-cols-2 gap-2 overflow-hidden">
                        {newPostImages.map((file, index) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="
                          relative
                          aspect-square
                          overflow-hidden
                        "
                          >
                            <img
                              src={previewImages[index]}
                              alt={`預覽 ${index + 1}`}
                              className="h-full w-full object-cover"
                            />

                            {/* 刪除圖片 */}
                            <Button
                              disabled={saving || !!pending}
                              aria-label={`移除第 ${index + 1} 張圖片`}
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

                {error && <p role="alert" className="px-5 text-sm text-red-400">{error}</p>}
                {pending && <p className="px-5 text-sm text-white/60">此篇發佈結果待確認，重試期間會保留相同內容與圖片。</p>}
                <DialogFooter className="justify-end px-5 pb-3">
                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim() || saving || !allowed}
                    className="
                  rounded-full
                  bg-white
                  px-6
                  text-black
                  hover:bg-white/90
                "
                  >
                    {saving ? "處理中…" : pending ? "重試發佈" : "發佈"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
        />

        {notice && <p role="status" className="mb-4">{notice}</p>}
        {!isPostModalOpen && error && <p role="alert" className="mb-4 text-destructive">{error}</p>}
        {listError && <div role="alert" className="mb-4 space-y-2"><p className="text-destructive">{listError}</p><Button variant="outline" disabled={saving} onClick={refresh}>重新載入</Button></div>}
        {loading ? <p role="status">載入貼文中…</p> : posts.length > 0 ? (
          <div className="w-full space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="relative w-full">
                <PostCard post={post} />
                <div className="mt-2 flex justify-end"><Button variant="outline" size="sm" disabled={saving || !allowed} onClick={() => void handleDelete(post)}><Trash2 className="mr-2 h-4 w-4" />刪除貼文</Button></div>
              </div>
            ))}
          </div>
        ) : !listError && (
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
        {result && result.meta.last_page > 1 && <div className="mt-6 flex items-center justify-center gap-4">
          <Button variant="outline" disabled={loading || saving || page <= 1} onClick={() => setPage(value => value - 1)}>上一頁</Button>
          <span>第 {result.meta.current_page} / {result.meta.last_page} 頁</span>
          <Button variant="outline" disabled={loading || saving || page >= result.meta.last_page} onClick={() => setPage(value => value + 1)}>下一頁</Button>
        </div>}
      </div>
    </>
  );
}
