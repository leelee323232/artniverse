"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/auth-context"
import { Bell, Lock, Globe, Moon, Smartphone, Mail, Shield, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    orderUpdates: true,
    promotions: false,
    creatorUpdates: true,
  })
  const [isSaving, setIsSaving] = useState(false)

  if (!user) {
    return (
      <div className="relative min-h-screen">
        <UniverseBackground />
        <Navigation />
        <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-16">
          <Card className="border-border/50 bg-card/30 p-8 backdrop-blur-md text-center">
            <p className="mb-4 text-foreground">請先登入以查看設定</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-primary to-secondary">前往登入</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSaving(false)
  }

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 text-3xl font-bold text-foreground">帳號設定</h1>

          {/* Notifications */}
          <Card className="mb-6 border-border/50 bg-card/30 p-6 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">通知設定</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>電子郵件通知</Label>
                  <p className="text-sm text-muted-foreground">接收重要更新和訂單通知</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>推播通知</Label>
                  <p className="text-sm text-muted-foreground">在瀏覽器接收即時通知</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>訂單更新</Label>
                  <p className="text-sm text-muted-foreground">訂單狀態變更時通知我</p>
                </div>
                <Switch
                  checked={notifications.orderUpdates}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, orderUpdates: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>促銷活動</Label>
                  <p className="text-sm text-muted-foreground">接收優惠和活動通知</p>
                </div>
                <Switch
                  checked={notifications.promotions}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, promotions: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>創作者動態</Label>
                  <p className="text-sm text-muted-foreground">追蹤的創作者有新作品時通知我</p>
                </div>
                <Switch
                  checked={notifications.creatorUpdates}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, creatorUpdates: checked })}
                />
              </div>
            </div>
          </Card>

          {/* Security */}
          <Card className="mb-6 border-border/50 bg-card/30 p-6 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">安全設定</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>變更密碼</Label>
                <div className="flex gap-3">
                  <Input type="password" placeholder="輸入目前密碼" className="bg-white/5" />
                  <Input type="password" placeholder="輸入新密碼" className="bg-white/5" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>雙重驗證</Label>
                  <p className="text-sm text-muted-foreground">啟用兩步驟驗證以增加帳號安全性</p>
                </div>
                <Button variant="outline" size="sm" className="bg-transparent">
                  設定
                </Button>
              </div>
            </div>
          </Card>

          {/* Preferences */}
          <Card className="mb-6 border-border/50 bg-card/30 p-6 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">偏好設定</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>深色模式</Label>
                  <p className="text-sm text-muted-foreground">使用深色主題</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>語言</Label>
                <select className="w-full rounded-lg border border-border/50 bg-white/5 px-3 py-2 text-foreground">
                  <option value="zh-TW">繁體中文</option>
                  <option value="zh-CN">简体中文</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Connected Accounts */}
          <Card className="mb-6 border-border/50 bg-card/30 p-6 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">連結帳號</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Google</p>
                    <p className="text-sm text-muted-foreground">尚未連結</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="bg-transparent">
                  連結
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Facebook</p>
                    <p className="text-sm text-muted-foreground">尚未連結</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="bg-transparent">
                  連結
                </Button>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50 bg-destructive/10 p-6 backdrop-blur-md">
            <h2 className="mb-4 text-lg font-bold text-destructive">危險區域</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              刪除帳號將永久移除您的所有資料，此操作無法復原。
            </p>
            <Button variant="destructive">刪除帳號</Button>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  儲存中...
                </>
              ) : (
                "儲存所有變更"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
