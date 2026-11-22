"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download, FileText, X } from "lucide-react";
import type { NewProductForm } from "./useNewProductForm";

export function Step2Editor({ form }: { form: NewProductForm }) {
  const {
    selectedProduct,
    creatorTemplateFile,
    setCreatorTemplateFile,
    handleTemplateFileUpload,
    templateFileUploadError,
    setCurrentStep,
    canProceedToStep3,
  } = form;
  return (
    <Card className="space-y-6 border-border/50 bg-card/30 p-6 backdrop-blur-sm">
      <div>
        <h2 className="text-xl font-bold text-foreground">
          步驟 2：上傳刀模檔案
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          請上傳完成設計的刀模檔案，供平台審核。
        </p>
      </div>
      {selectedProduct?.templateFile && (
        <Button asChild variant="outline" className="bg-transparent">
          <a
            href={selectedProduct.templateFile.url}
            download={selectedProduct.templateFile.name}
          >
            <Download className="mr-2 h-4 w-4" />
            下載平台提供的刀模
          </a>
        </Button>
      )}
      <div className="space-y-3">
        <Label htmlFor="creator-template-file">刀模檔案（必填）</Label>
        <Input
          id="creator-template-file"
          type="file"
          accept=".png,.ai,.psd,.stl"
          onChange={handleTemplateFileUpload}
          aria-describedby="template-file-help template-file-error"
          aria-invalid={!!templateFileUploadError}
        />
        <p id="template-file-help" className="text-sm text-muted-foreground">
          支援 PNG、AI、PSD、STL；單檔上限 20MB。
        </p>
        <p
          id="template-file-error"
          role="alert"
          className="text-sm text-destructive"
        >
          {templateFileUploadError}
        </p>
        {creatorTemplateFile && (
          <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
            <FileText
              aria-hidden="true"
              className="h-5 w-5 shrink-0 text-primary"
            />
            <div className="min-w-0 flex-1">
              <p className="break-all text-sm text-foreground">
                {creatorTemplateFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(creatorTemplateFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button asChild variant="ghost" size="icon">
              <a
                href={creatorTemplateFile.url}
                download={creatorTemplateFile.name}
                aria-label="下載已上傳的刀模檔案"
              >
                <Download className="h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="移除刀模檔案"
              onClick={() => setCreatorTemplateFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="flex justify-between gap-3 border-t border-border/50 pt-5">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          上一步
        </Button>
        <Button disabled={!canProceedToStep3} onClick={() => setCurrentStep(3)}>
          下一步：設定價格
        </Button>
      </div>
    </Card>
  );
}
