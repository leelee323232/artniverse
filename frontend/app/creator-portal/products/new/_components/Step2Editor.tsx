"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ImagePlus,
  Package,
  AlertCircle,
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Trash2,
  Plus,
  Layers,
  Hand,
  MousePointer,
} from "lucide-react";
import { getEffectiveScalePercent } from "./lib/print-size";
import { WatermarkOverlay } from "./WatermarkOverlay";
import type { NewProductForm } from "./useNewProductForm";

export function Step2Editor({ form }: { form: NewProductForm }) {
  const {
    isFullscreen,
    setIsFullscreen,
    selectedProduct,
    designImages,
    setDesignImages,
    activeZone,
    activeZoneId,
    setActiveZoneId,
    activeZoneImages,
    fileInputRef,
    handleFileUpload,
    selectedImageId,
    setSelectedImageId,
    deleteImage,
    isPrintSizeExceeded,
    selectedImage,
    currentPrintSize,
    printWidthInput,
    setPrintWidthInput,
    printHeightInput,
    setPrintHeightInput,
    commitPrintSize,
    editorTool,
    setEditorTool,
    editorZoom,
    setEditorZoom,
    resetEditorView,
    editorRef,
    panOffset,
    handleEditorMouseDown,
    handleEditorMouseMove,
    handleEditorMouseUp,
    handleImageMouseDown,
    ActiveMockup,
    effectiveScalePercent,
    updateImage,
    resetImagePosition,
    setCurrentStep,
    canProceedToStep3,
    allDesignsValid,
  } = form;

  return (
    <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
      <Card
        className={`border-border/50 bg-card/30 backdrop-blur-sm ${isFullscreen ? "h-full rounded-none border-0" : "p-6"}`}
      >
        {/* Editor Header */}
        <div
          className={`flex items-center justify-between border-b border-border/50 ${isFullscreen ? "px-4 py-3" : "mb-6 pb-4"}`}
        >
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-foreground">
              步驟 2: 上傳設計並調整位置
            </h2>
            {selectedProduct && (
              <Badge variant="outline">{selectedProduct.nameZh}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="bg-transparent"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div
          className={`grid gap-4 ${isFullscreen ? "h-[calc(100%-80px)] grid-cols-[280px_1fr_280px] p-4" : "lg:grid-cols-[1fr_2fr_1fr]"}`}
        >
          {/* Left Panel: Zone Selection, Upload & Layers */}
          <div className="space-y-4 overflow-y-auto">
            {/* Zone Selection */}
            {selectedProduct && selectedProduct.printZones.length > 1 && (
              <div className="rounded-lg border border-border/50 bg-white/5 p-4">
                <Label className="mb-3 block font-bold text-foreground">
                  選擇印刷區域
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedProduct.printZones.map((zone) => {
                    const zoneImages = designImages.filter(
                      (img) => img.zoneId === zone.id,
                    );
                    return (
                      <button
                        key={zone.id}
                        onClick={() => setActiveZoneId(zone.id)}
                        className={`relative rounded-lg border-2 p-3 text-center transition-all ${
                          activeZoneId === zone.id
                            ? "border-primary bg-primary/10"
                            : "border-border/30 bg-white/5 hover:border-primary/30"
                        }`}
                      >
                        <span className="text-sm font-medium text-foreground">
                          {zone.name}
                        </span>
                        {zoneImages.length > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                            {zoneImages.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="rounded-lg border border-border/50 bg-white/5 p-4">
              <Label className="mb-3 flex items-center gap-2 font-bold text-foreground">
                <ImagePlus className="h-4 w-4" />
                上傳設計圖 {activeZone && `(${activeZone.name})`}
              </Label>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-transparent"
              >
                <Plus className="mr-2 h-4 w-4" />
                新增圖片
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                支援多張 PNG 透明去背圖片
              </p>
            </div>

            {/* Layers Panel */}
            <div className="rounded-lg border border-border/50 bg-white/5 p-4">
              <Label className="mb-3 flex items-center gap-2 font-bold text-foreground">
                <Layers className="h-4 w-4" />
                圖層 - {activeZone?.name || ""} ({activeZoneImages.length})
              </Label>
              <div className="max-h-[300px] space-y-2 overflow-y-auto">
                {activeZoneImages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    尚未上傳圖片
                  </p>
                ) : (
                  activeZoneImages.map((img, index) => (
                    <div
                      key={img.id}
                      onClick={() => setSelectedImageId(img.id)}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-colors ${
                        selectedImageId === img.id
                          ? "border-primary bg-primary/10"
                          : "border-border/30 bg-white/5 hover:border-primary/30"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`Layer ${index + 1}`}
                        className="h-10 w-10 rounded object-contain bg-white/10"
                      />
                      <span className="flex-1 truncate text-sm text-foreground">
                        圖層 {index + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteImage(img.id);
                        }}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Current Print Size - editable by the creator */}
            {activeZone && (
              <div
                className={`rounded-lg border p-4 ${isPrintSizeExceeded ? "border-red-500 bg-red-500/10" : "border-border/50 bg-white/5"}`}
              >
                <Label className="mb-2 block font-bold text-foreground">
                  當前印刷尺寸
                </Label>
                {selectedImage && currentPrintSize ? (
                  <>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <span className="mb-1 block text-xs text-muted-foreground">
                          寬 (cm)
                        </span>
                        <Input
                          type="number"
                          min={0.1}
                          step={0.1}
                          value={printWidthInput}
                          onChange={(e) => {
                            setPrintWidthInput(e.target.value);
                            commitPrintSize(e.target.value, printHeightInput);
                          }}
                          className={`h-9 bg-white/5 ${isPrintSizeExceeded ? "border-red-500 text-red-500" : ""}`}
                        />
                      </div>
                      <span className="pb-2 text-muted-foreground">x</span>
                      <div className="flex-1">
                        <span className="mb-1 block text-xs text-muted-foreground">
                          高 (cm)
                        </span>
                        <Input
                          type="number"
                          min={0.1}
                          step={0.1}
                          value={printHeightInput}
                          onChange={(e) => {
                            setPrintHeightInput(e.target.value);
                            commitPrintSize(printWidthInput, e.target.value);
                          }}
                          className={`h-9 bg-white/5 ${isPrintSizeExceeded ? "border-red-500 text-red-500" : ""}`}
                        />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      可自行輸入尺寸；拖曳「縮放」會重新套用自動尺寸
                    </p>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">請選擇圖層</div>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  最大: {activeZone.width} x {activeZone.height} cm
                </div>
                {isPrintSizeExceeded && (
                  <p className="mt-2 text-sm text-red-500">
                    <AlertCircle className="mr-1 inline h-4 w-4" />
                    印刷尺寸超過上限，請縮小圖片
                  </p>
                )}
                <p className="mt-2 flex items-start gap-1 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                  此模擬圖僅限參考，建議以實際圖片尺寸為主
                </p>
              </div>
            )}
          </div>

          {/* Center: Canvas Editor */}
          <div className="flex flex-col">
            {/* Editor Toolbar */}
            <div className="mb-2 flex items-center justify-between rounded-lg border border-border/50 bg-white/5 px-3 py-2">
              <div className="flex items-center gap-2">
                <Button
                  variant={editorTool === "select" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditorTool("select")}
                  className={editorTool === "select" ? "" : "bg-transparent"}
                >
                  <MousePointer className="h-4 w-4" />
                </Button>
                <Button
                  variant={editorTool === "pan" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditorTool("pan")}
                  className={editorTool === "pan" ? "" : "bg-transparent"}
                >
                  <Hand className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditorZoom(Math.max(25, editorZoom - 25))}
                  className="bg-transparent"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="min-w-[60px] text-center text-sm text-foreground">
                  {editorZoom}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditorZoom(Math.min(200, editorZoom + 25))}
                  className="bg-transparent"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetEditorView}
                  className="bg-transparent"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Canvas Area */}
            <div
              className={`flex flex-1 items-center justify-center overflow-hidden rounded-xl border-2 border-border/50 bg-[#1a1a1a] ${
                editorTool === "pan"
                  ? "cursor-grab active:cursor-grabbing"
                  : ""
              }`}
              style={{ minHeight: isFullscreen ? "auto" : "500px" }}
            >
              <div
                ref={editorRef}
                className="relative"
                style={{
                  width: `${(300 * editorZoom) / 100}px`,
                  height: `${(300 * editorZoom) / 100}px`,
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
                }}
                onMouseDown={handleEditorMouseDown}
                onMouseMove={handleEditorMouseMove}
                onMouseUp={handleEditorMouseUp}
                onMouseLeave={handleEditorMouseUp}
              >
                {/* Product Mockup */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {ActiveMockup ? (
                    <ActiveMockup
                      className="h-full w-full"
                      zoneHighlight="#a855f7"
                    />
                  ) : (
                    <div className="flex h-3/4 w-3/4 items-center justify-center rounded-lg bg-white/10">
                      <Package className="h-24 w-24 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Design Images for active zone */}
                {activeZoneImages.map((img) => (
                  <div
                    key={img.id}
                    className={`absolute cursor-move ${selectedImageId === img.id ? "ring-2 ring-primary" : ""}`}
                    style={{
                      left: `${img.position.x}%`,
                      top: `${img.position.y}%`,
                      transform: `translate(-50%, -50%) scale(${
                        (activeZone
                          ? getEffectiveScalePercent(img, activeZone)
                          : img.scale) / 100
                      }) rotate(${img.rotation}deg)`,
                      maxWidth: "50%",
                      maxHeight: "50%",
                    }}
                    onMouseDown={(e) => handleImageMouseDown(e, img.id)}
                  >
                    <img
                      src={img.url}
                      alt="Design"
                      className="max-h-full max-w-full object-contain drop-shadow-lg"
                      draggable={false}
                    />
                    <WatermarkOverlay />
                    {selectedImageId === img.id && (
                      <>
                        <div className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-primary" />
                        <div className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-primary" />
                        <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full bg-primary" />
                        <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-full bg-primary" />
                      </>
                    )}
                  </div>
                ))}

                {/* Empty state */}
                {activeZoneImages.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-lg bg-black/50 px-4 py-3 text-center">
                      <ImagePlus className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        上傳圖片到「{activeZone?.name || ""}」區域
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Editor Tips */}
            <div className="mt-2 rounded-lg bg-primary/10 px-3 py-2 text-xs text-muted-foreground">
              選擇工具: 拖曳圖片移動位置 | 平移工具: 拖曳畫布移動視角 |
              使用右側面板調整尺寸與旋轉
            </div>
          </div>

          {/* Right Panel: Image Properties */}
          <div className="space-y-4 overflow-y-auto">
            {selectedImage ? (
              <>
                {/* Selected Image Preview */}
                <div className="rounded-lg border border-border/50 bg-white/5 p-4">
                  <Label className="mb-3 block font-bold text-foreground">
                    選中的圖層
                  </Label>
                  <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-white/10">
                    <img
                      src={selectedImage.url}
                      alt="Selected"
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                </div>

                {/* Transform Controls */}
                <div className="rounded-lg border border-border/50 bg-white/5 p-4">
                  <Label className="mb-3 block font-bold text-foreground">
                    調整
                  </Label>

                  {/* Scale */}
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        縮放
                      </span>
                      <span
                        className={`text-sm ${isPrintSizeExceeded ? "text-red-500 font-bold" : "text-foreground"}`}
                      >
                        {effectiveScalePercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={Math.min(
                        200,
                        Math.max(10, effectiveScalePercent),
                      )}
                      onChange={(e) =>
                        updateImage(selectedImage.id, {
                          scale: parseInt(e.target.value),
                          customWidth: undefined,
                          customHeight: undefined,
                        })
                      }
                      className="w-full accent-primary"
                    />
                    {currentPrintSize && (
                      <div
                        className={`mt-1 text-xs ${isPrintSizeExceeded ? "text-red-500" : "text-muted-foreground"}`}
                      >
                        印刷尺寸: {currentPrintSize.width} x{" "}
                        {currentPrintSize.height} cm
                        {isPrintSizeExceeded && " (超過上限!)"}
                      </div>
                    )}
                  </div>

                  {/* Rotation */}
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        旋轉
                      </span>
                      <span className="text-sm text-foreground">
                        {selectedImage.rotation}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={selectedImage.rotation}
                      onChange={(e) =>
                        updateImage(selectedImage.id, {
                          rotation: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-primary"
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetImagePosition}
                    className="w-full bg-transparent"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    重置位置
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-border/50 bg-white/5 p-4">
                <p className="text-center text-sm text-muted-foreground py-8">
                  選擇一個圖層
                  <br />
                  以編輯屬性
                </p>
              </div>
            )}

            {/* All Zones Summary */}
            {selectedProduct && selectedProduct.printZones.length > 1 && (
              <div className="rounded-lg border border-border/50 bg-white/5 p-4">
                <Label className="mb-3 block font-bold text-foreground">
                  各區域設計數量
                </Label>
                <div className="space-y-2">
                  {selectedProduct.printZones.map((zone) => {
                    const zoneImages = designImages.filter(
                      (img) => img.zoneId === zone.id,
                    );
                    return (
                      <div
                        key={zone.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {zone.name}
                        </span>
                        <span
                          className={`${zoneImages.length > 0 ? "text-primary" : "text-muted-foreground"}`}
                        >
                          {zoneImages.length} 張
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="rounded-lg bg-primary/10 p-3 text-sm text-muted-foreground">
              <Info className="mr-1 inline h-4 w-4 text-primary" />
              此為效果示意圖，實際成品可能略有差異。
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div
          className={`flex justify-between border-t border-border/50 ${isFullscreen ? "px-4 py-3" : "mt-6 pt-4"}`}
        >
          <Button
            variant="outline"
            onClick={() => {
              setIsFullscreen(false);
              // 回上一步（重選商品）時，清空已上傳的設計圖與相關選取狀態
              setDesignImages([]);
              setSelectedImageId(null);
              setPrintWidthInput("");
              setPrintHeightInput("");
              setCurrentStep(1);
            }}
            className="bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            上一步
          </Button>
          <Button
            onClick={() => {
              setIsFullscreen(false);
              setCurrentStep(3);
            }}
            disabled={!canProceedToStep3}
            className="bg-gradient-to-r from-primary to-secondary"
          >
            {!allDesignsValid ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                有設計超過尺寸限制
              </>
            ) : (
              "下一步: 設定價格"
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
