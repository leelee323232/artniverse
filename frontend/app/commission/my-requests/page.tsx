"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import Link from "next/link"
import { CommissionRequestCard } from "@/components/commission/commission-request-card"
import { CommissionRequestDetailModal } from "@/components/admin/commission-request-detail-modal"
import { mockCommissionRequests, type CommissionRequest } from "@/types/commission-request"

export default function MyRequestsPage() {
  const [requests] = useState<CommissionRequest[]>(mockCommissionRequests)
  const [selectedRequest, setSelectedRequest] = useState<CommissionRequest | null>(null)

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const activeRequests = requests.filter((r) => r.status === "in-progress")
  const completedRequests = requests.filter((r) => r.status === "completed")

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
            <TabsTrigger value="all">全部 ({requests.length})</TabsTrigger>
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
            {requests.map((request) => (
              <CommissionRequestCard key={request.id} request={request} onClick={setSelectedRequest} />
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <CommissionRequestCard key={request.id} request={request} onClick={setSelectedRequest} />
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
                <CommissionRequestCard key={request.id} request={request} onClick={setSelectedRequest} />
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
                <CommissionRequestCard key={request.id} request={request} onClick={setSelectedRequest} />
              ))
            ) : (
              <Card className="border-border/50 bg-card/30 p-12 text-center backdrop-blur-sm">
                <p className="text-muted-foreground">目前沒有已完成的委託</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedRequest && (
        <CommissionRequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          readOnly
        />
      )}
    </div>
  )
}
