"use client";

import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { UniverseBackground } from "@/components/universe-background";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, Check } from "lucide-react";
import { useNewProductForm } from "./_components/useNewProductForm";
import { Step1SelectProduct } from "./_components/Step1SelectProduct";
import { Step2Editor } from "./_components/Step2Editor";
import { Step3Pricing } from "./_components/Step3Pricing";

export default function NewProductPage() {
  const form = useNewProductForm();
  const { currentStep, showSuccessDialog, setShowSuccessDialog, router } = form;

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/creator-portal"
            className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回創作者控制台
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-foreground">新增商品</h1>
          <p className="text-muted-foreground">
            選擇產品、上傳設計、設定價格，申請產品開發
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[
              { step: 1, label: "選擇產品" },
              { step: 2, label: "上傳設計" },
              { step: 3, label: "設定價格" },
            ].map(({ step, label }) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    currentStep >= step
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-transparent text-muted-foreground"
                  }`}
                >
                  {currentStep > step ? <Check className="h-5 w-5" /> : step}
                </div>
                <span
                  className={`ml-2 text-sm ${currentStep >= step ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {label}
                </span>
                {step < 3 && (
                  <div
                    className={`mx-4 h-0.5 w-16 ${currentStep > step ? "bg-primary" : "bg-border"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Product Selection */}
        {currentStep === 1 && <Step1SelectProduct form={form} />}

        {/* Step 2: Upload Design - Canva-like Editor */}
        {currentStep === 2 && <Step2Editor form={form} />}

        {/* Step 3: Pricing */}
        {currentStep === 3 && <Step3Pricing form={form} />}
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md border-green-500/30 bg-background/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-500">
              <Check className="h-6 w-6" />
              申請已提交
            </DialogTitle>
            <DialogDescription>
              您的產品開發申請已成功提交！我們會在 1-3 個工作天內審核您的申請。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted/20 p-4">
              <h4 className="mb-2 font-bold text-foreground">接下來的步驟：</h4>
              <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                <li>我們會審核您的設計和產品設定</li>
                <li>審核通過後，您會收到通知</li>
                <li>您可以在「商品管理」編輯商品詳情</li>
                <li>設定完成後，商品即可上架販售</li>
              </ol>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => router.push("/creator-portal")}
              className="w-full bg-gradient-to-r from-primary to-secondary"
            >
              返回創作者控制台
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
