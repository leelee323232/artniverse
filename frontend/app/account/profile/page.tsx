"use client"

import { useState, useRef, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth, normalizeUser, type User } from "@/lib/auth-context"
import { saveProfile, uploadAvatar, profileError } from "@/lib/profile-api"
import { Camera, Save, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) return (
    <div className="relative min-h-screen">
      <UniverseBackground /><Navigation />
      <main className="container mx-auto px-4 pt-24" role="status">載入個人資料中…</main>
    </div>
  )

  if (!user) {
    return (
      <div className="relative min-h-screen">
        <UniverseBackground />
        <Navigation />
        <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-16">
          <Card className="border-border/50 bg-card/30 p-8 backdrop-blur-md text-center">
            <p className="mb-4 text-foreground">請先登入以查看個人資料</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-primary to-secondary">前往登入</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return <ProfileForm key={user.id} user={user} />
}

function profileFields(user: User) {
  return { name: user.name, email: user.email, phone: user.phone ?? "",
    birthday: user.birthday ?? "", address: user.address ?? "", bio: user.bio ?? "" }
}

function ProfileForm({ user }: { user: User }) {
  const { updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const busy = useRef(false)
  const active = useRef(true)
  const [formData, setFormData] = useState(() => profileFields(user))
  useEffect(() => { active.current = true; return () => { active.current = false } }, [])
  useEffect(() => {
    if (!isEditing) setFormData(profileFields(user))
  }, [user, isEditing])

  const handleSave = async () => {
    if (busy.current) return
    busy.current = true
    setIsSaving(true); setError(""); setMessage("")
    try {
      const saved = normalizeUser(await saveProfile({
        name: formData.name.trim(), phone: formData.phone.trim() || null,
        birthday: formData.birthday || null, address: formData.address.trim() || null,
        bio: formData.bio.trim() || null,
      }))
      if (!active.current || saved.id !== String(user.id)) return
      updateUser(saved)
      setFormData(profileFields(saved)); setIsEditing(false); setMessage("個人資料已儲存。")
    } catch (err) {
      if (active.current) setError(profileError(err))
    } finally {
      busy.current = false
      if (active.current) setIsSaving(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (busy.current) return
    setError(""); setMessage("")

    // 驗證檔案類型
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      setError("只支援 JPG、PNG、WEBP、GIF 格式的圖片")
      return
    }

    // 驗證檔案大小（上限 5MB）
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError("圖片大小不可超過 5MB")
      return
    }

    busy.current = true
    setIsUploadingAvatar(true)

    try {
      const saved = normalizeUser(await uploadAvatar(file))
      if (!active.current || saved.id !== String(user.id)) return
      updateUser(saved)
      setMessage("頭像已更新。")
    } catch (err) {
      if (active.current) setError(profileError(err))
    } finally {
      busy.current = false
      if (active.current) setIsUploadingAvatar(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 text-3xl font-bold text-foreground">個人資料</h1>

          <Card className="border-border/50 bg-card/30 p-8 backdrop-blur-md">
            {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}
            {message && <p role="status" className="mb-4 text-sm text-primary">{message}</p>}
            {/* Avatar Section */}
            <div className="mb-8 flex items-center gap-6">
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                    <span className="text-3xl font-bold text-primary-foreground">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar || isSaving}
                  aria-label="更換頭像"
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.is_creator && (
                  <span className="mt-2 inline-block rounded-full bg-primary/20 px-3 py-1 text-xs text-primary">
                    認證創作者
                  </span>
                )}
              </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    maxLength={40}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing || isSaving}
                    className="bg-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">電子郵件</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-white/5 opacity-50"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">聯絡電話</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing || isSaving}
                    placeholder="0912-345-678"
                    className="bg-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthday">生日</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    disabled={!isEditing || isSaving}
                    className="bg-white/5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">地址</Label>
                <Input
                  id="address"
                    maxLength={200}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing || isSaving}
                  placeholder="請輸入收件地址"
                  className="bg-white/5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">個人簡介</Label>
                <Textarea
                  id="bio"
                  maxLength={2000}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing || isSaving}
                  placeholder="介紹一下自己..."
                  className="min-h-[100px] bg-white/5"
                />
              </div>

              <div className="flex justify-end gap-3">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => { setFormData(profileFields(user)); setIsEditing(false); setError(""); setMessage("") }}
                      disabled={isSaving || isUploadingAvatar}
                      className="bg-transparent"
                    >
                      取消
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || isUploadingAvatar}
                      className="bg-gradient-to-r from-primary to-secondary"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          儲存中...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          儲存變更
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => { setIsEditing(true); setError(""); setMessage("") }} disabled={isUploadingAvatar} variant="outline" className="bg-transparent">
                    編輯資料
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
