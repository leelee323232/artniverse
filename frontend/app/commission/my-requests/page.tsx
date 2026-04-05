"use client"

import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Calendar, DollarSign, User, Plus } from "lucide-react"
import Link from "next/link"

const myRequests = [
  {
    id: "REQ-001",
    title: "咖啡廳品牌 Logo 設計",
    type: "品牌設計",
    status: "in-progress",
    creator: "小夢創作室",
    creatorId: "1",
    budget: "15,000",
    deadline: "2024-02-28",
    submittedDate: "2024-01-10",
    description: "需要設計一個溫馨、現代感的咖啡廳 Logo",
    progress: 60,
  },
  {
    id: "REQ-002",
    title: "婚禮邀請卡插畫",
    type: "插畫繪製",
    status: "pending",
    creator: null,
    creatorId: null,
    budget: "8,000",
    deadline: "2024-03-15",
    submittedDate: "2024-01-15",
    description: "客製化婚禮邀請卡插畫設計",
    progress: 0,
  },
  {
    id: "REQ-003",
    title: "品牌周邊商品設計",
    type: "周邊商品設計",
    status: "completed",
    creator: "Minimal Studio",
    creatorId: "2",
    budget: "12,000",
    deadline: "2024-01-20",
    submittedDate: "2023-12-15",
    description: "T-shirt 和貼紙設計",
    progress: 100,
  },
]

export default function MyRequestsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-500"
      case "in-progress":
        return "bg-blue-500/20 text-blue-500"
      case "completed":
        return "bg-green-500/20 text-green-500"
      case "cancelled":
        return "bg-red-500/20 text-red-500"
      default:
        return "bg-muted"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "等待媒合"
      case "in-progress":
        return "進行中"
      case "completed":
        return "已完成"
      case "cancelled":
        return "已取消"
      default:
        return status
    }
  }

  const pendingRequests = myRequests.filter((r) => r.status === "pending")
  const activeRequests = myRequests.filter((r) => r.status === "in-progress")
  const completedRequests = myRequests.filter((r) => r.status === "completed")

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">我的委託</h1>
            <p className="text-muted-foreground">追蹤你的設計委託進度</p>
          </div>
          <Link href="/commission/request">
            <Button className="bg-gradient-to-r from-primary to-secondary">
              <Plus className="mr-2 h-4 w-4" />
              新增委託
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">{pendingRequests.length}</div>
              <div className="text-sm text-muted-foreground">等待媒合</div>
            </div>
          </Card>
          <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">{activeRequests.length}</div>
              <div className="text-sm text-muted-foreground">進行中</div>
            </div>
          </Card>
          <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">{completedRequests.length}</div>
              <div className="text-sm text-muted-foreground">已完成</div>
            </div>
          </Card>
        </div>

        {/* Requests List */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="all">全部 ({myRequests.length})</TabsTrigger>
            <TabsTrigger value="pending">
              等待中
              {pendingRequests.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">進行中 ({activeRequests.length})</TabsTrigger>
            <TabsTrigger value="completed">已完成 ({completedRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {myRequests.map((request) => (
              <Card key={request.id} className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-foreground">{request.title}</h3>
                        <Badge className={getStatusColor(request.status)}>{getStatusText(request.status)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{request.type}</p>
                      <p className="text-sm text-foreground">{request.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      查看詳情
                    </Button>
                  </div>

                  {request.status === "in-progress" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">進度</span>
                        <span className="font-bold text-foreground">{request.progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted/30">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                          style={{ width: `${request.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 border-t border-border/50 pt-4 md:grid-cols-4">
                    {request.creator && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">創作者</p>
                          <Link
                            href={`/creator/${request.creatorId}`}
                            className="text-sm font-bold text-foreground hover:text-primary"
                          >
                            {request.creator}
                          </Link>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">預算</p>
                        <p className="text-sm font-bold text-foreground">NT$ {request.budget}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">截止日期</p>
                        <p className="text-sm font-bold text-foreground">{request.deadline}</p>
                      </div>
                    </div>
                    {request.creator && (
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          聯絡創作者
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <Card key={request.id} className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-foreground">{request.title}</h3>
                          <Badge className={getStatusColor(request.status)}>{getStatusText(request.status)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{request.type}</p>
                        <p className="text-sm text-foreground">{request.description}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        查看詳情
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 border-t border-border/50 pt-4 text-sm text-muted-foreground">
                      <span>提交於 {request.submittedDate}</span>
                      <span>•</span>
                      <span>預算 NT$ {request.budget}</span>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="border-border/50 bg-card/30 p-12 text-center backdrop-blur-sm">
                <p className="text-muted-foreground">目前沒有等待中的委託</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeRequests.length > 0 ? (
              activeRequests.map((request) => (
                <Card key={request.id} className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-foreground">{request.title}</h3>
                          <Badge className={getStatusColor(request.status)}>{getStatusText(request.status)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{request.type}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        查看詳情
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">進度</span>
                        <span className="font-bold text-foreground">{request.progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted/30">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                          style={{ width: `${request.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/50 pt-4">
                      <Link
                        href={`/creator/${request.creatorId}`}
                        className="text-sm font-bold text-foreground hover:text-primary"
                      >
                        創作者：{request.creator}
                      </Link>
                      <Button size="sm" variant="outline" className="bg-transparent">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        聯絡創作者
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="border-border/50 bg-card/30 p-12 text-center backdrop-blur-sm">
                <p className="text-muted-foreground">目前沒有進行中的委託</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedRequests.length > 0 ? (
              completedRequests.map((request) => (
                <Card key={request.id} className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-foreground">{request.title}</h3>
                          <Badge className={getStatusColor(request.status)}>{getStatusText(request.status)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{request.type}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        查看成果
                      </Button>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/50 pt-4">
                      <Link
                        href={`/creator/${request.creatorId}`}
                        className="text-sm font-bold text-foreground hover:text-primary"
                      >
                        創作者：{request.creator}
                      </Link>
                      <Button size="sm" className="bg-gradient-to-r from-primary to-secondary">
                        再次委託
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="border-border/50 bg-card/30 p-12 text-center backdrop-blur-sm">
                <p className="text-muted-foreground">目前沒有已完成的委託</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
