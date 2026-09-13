"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  platformProducts,
  type ProductDefinition,
} from "./data/platform-products";
import { getProductTemplates } from "./data/product-template-store";
import { ProductMockups } from "./data/product-mockups";
import {
  type DesignImage,
  getEffectivePrintSize,
  getEffectiveScalePercent,
} from "./lib/print-size";

type ResizeHandle = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface ResizeState {
  imageId: string;
  handle: ResizeHandle;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
}

export function useNewProductForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const templateFileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Scroll back to the top whenever the step changes so the user doesn't need
  // to manually scroll up after clicking "下一步" / "上一步".
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // Product selection
  const [selectedProduct, setSelectedProduct] =
    useState<ProductDefinition | null>(null);
  const [customProductRequest, setCustomProductRequest] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productTemplates, setProductTemplates] =
    useState<ProductDefinition[]>(platformProducts);

  useEffect(() => {
    setProductTemplates(getProductTemplates());
  }, []);

  // Zone selection
  const [activeZoneId, setActiveZoneId] = useState<string>("");

  // Multiple design uploads - organized by zone
  const [designImages, setDesignImages] = useState<DesignImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [creatorTemplateFile, setCreatorTemplateFile] = useState<{
    name: string;
    size: number;
    url: string;
  } | null>(null);
  const [templateFileUploadError, setTemplateFileUploadError] = useState("");

  // Editor state
  const [editorZoom, setEditorZoom] = useState(100);
  const [editorTool, setEditorTool] = useState<"select" | "pan">("select");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Product type & basic info
  const [productType, setProductType] = useState<
    "general" | "auction" | "presale"
  >("general");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");

  // Auction settings (競標商品)
  const [auctionStartPrice, setAuctionStartPrice] = useState("");
  const [auctionMinIncrement, setAuctionMinIncrement] = useState("");
  const [auctionStartTime, setAuctionStartTime] = useState("");
  const [auctionEndTime, setAuctionEndTime] = useState("");

  // Pre-sale settings (預售商品)
  const [presaleTargetQuantity, setPresaleTargetQuantity] = useState("");
  const [presaleStartDate, setPresaleStartDate] = useState("");
  const [presaleEndDate, setPresaleEndDate] = useState("");

  // Pricing
  const [sellingPrice, setSellingPrice] = useState("");
  const [preOrderQuantity, setPreOrderQuantity] = useState("");
  const [wantPreOrder, setWantPreOrder] = useState(false);

  // Limited edition settings (一般商品限量)
  const [isLimited, setIsLimited] = useState(false);
  const [limitedQuantity, setLimitedQuantity] = useState("");
  const [isTimedSale, setIsTimedSale] = useState(false);
  const [saleStartAt, setSaleStartAt] = useState("");
  const [saleEndAt, setSaleEndAt] = useState("");

  // Note for admin (創作者給管理員的備註)
  const [productNote, setProductNote] = useState("");

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Set default zone when product is selected
  useEffect(() => {
    if (selectedProduct && selectedProduct.printZones.length > 0) {
      setActiveZoneId(selectedProduct.printZones[0].id);
    }
  }, [selectedProduct]);

  // Filter products by search query (matches Chinese or English name); empty query shows all
  const normalizedProductSearch = productSearch.trim().toLowerCase();
  const filteredProducts = normalizedProductSearch
    ? productTemplates.filter(
        (product) =>
          product.nameZh.toLowerCase().includes(normalizedProductSearch) ||
          product.name.toLowerCase().includes(normalizedProductSearch),
      )
    : productTemplates;

  // Get active zone
  const activeZone = selectedProduct?.printZones.find(
    (z) => z.id === activeZoneId,
  );

  // Get images for active zone
  const activeZoneImages = designImages.filter(
    (img) => img.zoneId === activeZoneId,
  );

  // Get selected image
  const selectedImage = designImages.find((img) => img.id === selectedImageId);

  // Calculate current print size (user-defined size takes priority over auto size)
  const currentPrintSize =
    selectedImage && activeZone
      ? getEffectivePrintSize(selectedImage, activeZone)
      : null;

  // Effective uniform scale (%) for the selected image, reflecting any manual size input
  const effectiveScalePercent =
    selectedImage && activeZone
      ? Math.round(getEffectiveScalePercent(selectedImage, activeZone))
      : (selectedImage?.scale ?? 100);

  // Local input state for the editable print size fields (kept as strings for smooth typing)
  const [printWidthInput, setPrintWidthInput] = useState("");
  const [printHeightInput, setPrintHeightInput] = useState("");
  const [rotationInput, setRotationInput] = useState("");

  // Sync the size inputs when the selection, zone, or auto scale changes.
  // (Editing the inputs updates customWidth/customHeight, which are NOT in the deps,
  //  so typing stays smooth; the scale slider clears custom sizes and re-syncs here.)
  useEffect(() => {
    if (selectedImage && activeZone) {
      const size = getEffectivePrintSize(selectedImage, activeZone);
      setPrintWidthInput(String(size.width));
      setPrintHeightInput(String(size.height));
    } else {
      setPrintWidthInput("");
      setPrintHeightInput("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImageId, activeZoneId, selectedImage?.scale]);

  useEffect(() => {
    setRotationInput(selectedImage ? String(selectedImage.rotation) : "");
  }, [selectedImageId, selectedImage?.rotation]);

  // Update image properties
  const updateImage = (id: string, updates: Partial<DesignImage>) => {
    setDesignImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...updates } : img)),
    );
  };

  // Commit a manually-entered print size (in cm) onto the selected image
  const commitPrintSize = (widthStr: string, heightStr: string) => {
    if (!selectedImage || !activeZone) return;
    const w = parseFloat(widthStr);
    const h = parseFloat(heightStr);
    if (Number.isNaN(w) || Number.isNaN(h) || w <= 0 || h <= 0) return;
    updateImage(selectedImage.id, {
      customWidth: Math.round(w * 10) / 10,
      customHeight: Math.round(h * 10) / 10,
    });
  };

  const commitRotation = (rotationStr: string) => {
    if (!selectedImage) return;
    const rotation = Number(rotationStr);
    if (!Number.isFinite(rotation)) return;
    updateImage(selectedImage.id, { rotation });
  };

  // Check if print size exceeds max
  const isPrintSizeExceeded =
    currentPrintSize &&
    activeZone &&
    (currentPrintSize.width > activeZone.width ||
      currentPrintSize.height > activeZone.height);

  // Calculate total print area for cost calculation
  const getTotalPrintArea = useCallback(() => {
    if (!selectedProduct) return { width: 0, height: 0 };

    let maxWidth = 0;
    let maxHeight = 0;

    designImages.forEach((img) => {
      const zone = selectedProduct.printZones.find((z) => z.id === img.zoneId);
      if (zone) {
        const size = getEffectivePrintSize(img, zone);
        maxWidth = Math.max(maxWidth, size.width);
        maxHeight = Math.max(maxHeight, size.height);
      }
    });

    return { width: maxWidth, height: maxHeight };
  }, [designImages, selectedProduct]);

  // Calculate costs with new formula
  const calculateCosts = useCallback(() => {
    if (!selectedProduct) return null;

    const totalPrint = getTotalPrintArea();
    const baseCost = selectedProduct.baseCost; // 1. 產品基本成本
    const printingCost =
      totalPrint.width > 0 && totalPrint.height > 0
        ? Math.round(totalPrint.width * totalPrint.height * 0.5)
        : 0; // 2. 印刷費用

    const productionCost = baseCost + printingCost; // 生產成本 = 1 + 2
    const requestedStock = Number(preOrderQuantity) || 0;
    const stockDiscountPercent = Math.max(
      0,
      ...(selectedProduct.stockDiscountTiers ?? [])
        .filter((tier) => requestedStock >= tier.minQuantity)
        .map((tier) => tier.discountPercent),
    );
    const stockingCost = Math.round(
      productionCost * 1.3 * (1 - stockDiscountPercent / 100),
    ); // 3. 備貨成本 = (1+2) * 130% - 適用的備貨折扣

    const price = sellingPrice ? parseFloat(sellingPrice) : 0;
    // 4. 無備貨的自然流量訂單分潤 = (售價 - 生產成本) * 20%
    const passiveIncome =
      price > productionCost ? Math.round((price - productionCost) * 0.2) : 0;

    // 備貨訂單的利潤
    const stockingProfit = price > stockingCost ? price - stockingCost : 0;

    return {
      baseCost,
      printingCost,
      productionCost,
      stockingCost,
      passiveIncome,
      stockingProfit,
      stockDiscountPercent,
      totalPrintWidth: totalPrint.width,
      totalPrintHeight: totalPrint.height,
    };
  }, [selectedProduct, getTotalPrintArea, sellingPrice, preOrderQuantity]);

  const costs = calculateCosts();

  // Handle file upload - support multiple files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !activeZoneId) return;

    const remainingSlots = Math.max(0, 10 - designImages.length);
    if (remainingSlots === 0) {
      alert("設計圖片最多可上傳 10 張");
      return;
    }
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      alert(`設計圖片最多可上傳 10 張，這次僅加入前 ${remainingSlots} 張`);
    }

    filesToUpload.forEach((file) => {
      if (!file.type.includes("png")) {
        alert("請上傳PNG透明去背圖片");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage: DesignImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: event.target?.result as string,
          file,
          position: { x: 50, y: 50 },
          scale: 100,
          rotation: 0,
          zoneId: activeZoneId,
        };
        setDesignImages((prev) => [...prev, newImage]);
        setSelectedImageId(newImage.id);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTemplateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["png", "ai", "psd", "stl"].includes(extension)) {
      setTemplateFileUploadError("請上傳去背檔、AI、PS 或 STL 格式的刀模檔");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setTemplateFileUploadError("刀模檔案不可超過 20MB");
      return;
    }

    setCreatorTemplateFile({
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
    });
    setTemplateFileUploadError("");
    if (templateFileInputRef.current) templateFileInputRef.current.value = "";
  };

  // Delete image
  const deleteImage = (id: string) => {
    setDesignImages((prev) => prev.filter((img) => img.id !== id));
    if (selectedImageId === id) {
      const remaining = designImages.filter((img) => img.id !== id);
      setSelectedImageId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Handle mouse down on image for dragging
  const handleImageMouseDown = (e: React.MouseEvent, imageId: string) => {
    if (editorTool !== "select") return;
    e.stopPropagation();
    e.preventDefault();

    setSelectedImageId(imageId);
    setIsDragging(true);

    const rect = editorRef.current?.getBoundingClientRect();
    if (!rect) return;

    const image = designImages.find((img) => img.id === imageId);
    if (!image) return;

    setDragStart({
      x: e.clientX - (image.position.x * rect.width) / 100,
      y: e.clientY - (image.position.y * rect.height) / 100,
    });
  };

  const handleResizeStart = (
    e: React.MouseEvent,
    imageId: string,
    handle: ResizeHandle,
  ) => {
    if (editorTool !== "select" || !activeZone) return;
    e.stopPropagation();
    e.preventDefault();

    const rect = editorRef.current?.getBoundingClientRect();
    const image = designImages.find((img) => img.id === imageId);
    if (!rect || !image) return;

    const size = getEffectivePrintSize(image, activeZone);
    setSelectedImageId(imageId);
    setIsDragging(false);
    setResizeState({
      imageId,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    });
  };

  // Handle mouse move for dragging or panning
  const handleEditorMouseMove = (e: React.MouseEvent) => {
    if (resizeState && activeZone && editorTool === "select") {
      const rect = editorRef.current?.getBoundingClientRect();
      if (!rect) return;

      const horizontalDirection = resizeState.handle.includes("left") ? -1 : 1;
      const verticalDirection = resizeState.handle.includes("top") ? -1 : 1;
      const widthDelta =
        ((e.clientX - resizeState.startX) / rect.width) *
        activeZone.width *
        horizontalDirection;
      const heightDelta =
        ((e.clientY - resizeState.startY) / rect.height) *
        activeZone.height *
        verticalDirection;
      const aspectRatio = resizeState.startWidth / resizeState.startHeight;
      const proposedWidth = resizeState.startWidth + widthDelta;
      const proposedHeight = resizeState.startHeight + heightDelta;
      const widthFromHeight = proposedHeight * aspectRatio;
      const useWidth = Math.abs(widthDelta) >= Math.abs(heightDelta);
      const maxWidth = Math.min(activeZone.width, activeZone.height * aspectRatio);
      const width = Math.max(
        0.1,
        Math.min(maxWidth, useWidth ? proposedWidth : widthFromHeight),
      );

      updateImage(resizeState.imageId, {
        customWidth: Math.round(width * 10) / 10,
        customHeight: Math.round((width / aspectRatio) * 10) / 10,
      });
    } else if (isDragging && selectedImageId && editorTool === "select") {
      const rect = editorRef.current?.getBoundingClientRect();
      if (!rect) return;

      const newX = Math.max(
        0,
        Math.min(100, ((e.clientX - dragStart.x) / rect.width) * 100),
      );
      const newY = Math.max(
        0,
        Math.min(100, ((e.clientY - dragStart.y) / rect.height) * 100),
      );

      updateImage(selectedImageId, { position: { x: newX, y: newY } });
    } else if (isPanning && editorTool === "pan") {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      setPanOffset({ x: deltaX, y: deltaY });
    }
  };

  // Handle mouse up
  const handleEditorMouseUp = () => {
    setIsDragging(false);
    setResizeState(null);
    setIsPanning(false);
  };

  // Handle pan start
  const handleEditorMouseDown = (e: React.MouseEvent) => {
    if (editorTool === "pan") {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  // Reset editor view
  const resetEditorView = () => {
    setEditorZoom(100);
    setPanOffset({ x: 0, y: 0 });
  };

  // Reset selected image position
  const resetImagePosition = () => {
    if (selectedImageId) {
      updateImage(selectedImageId, {
        position: { x: 50, y: 50 },
        scale: 100,
        rotation: 0,
        customWidth: undefined,
        customHeight: undefined,
      });
    }
  };

  // Submit application
  const handleSubmit = async () => {
    const designFiles = designImages.map((image) => {
      const zone = selectedProduct?.printZones.find(
        (item) => item.id === image.zoneId,
      );
      const size = zone ? getEffectivePrintSize(image, zone) : null;

      return {
        zoneId: image.zoneId,
        fileName: image.file.name,
        fileType: image.file.type,
        fileSize: image.file.size,
        position: image.position,
        rotation: image.rotation,
        uploadedImageSize: size
          ? { widthCm: size.width, heightCm: size.height }
          : null,
      };
    });

    const payload = {
      productType,
      designSource: selectedProduct?.designSource ?? "image",
      productName: productName.trim(),
      productDescription: productDescription.trim(),
      selectedProductId: selectedProduct?.id ?? null,
      customProductRequest: customProductRequest.trim() || null,
      sellingPrice: sellingPrice ? Number(sellingPrice) : null,
      preOrderQuantity: preOrderQuantity ? Number(preOrderQuantity) : null,
      isTimedSale,
      saleStartAt: isTimedSale ? saleStartAt || null : null,
      saleEndAt: isTimedSale ? saleEndAt || null : null,
      isLimited,
      limitedQuantity: isLimited && limitedQuantity ? Number(limitedQuantity) : null,
      designFiles,
      templateFile: creatorTemplateFile
        ? {
            fileName: creatorTemplateFile.name,
            fileSize: creatorTemplateFile.size,
          }
        : null,
      productNote: productNote.trim() || null,
    };

    console.log("[Product application payload]", payload);
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setShowSuccessDialog(true);
  };

  // Validation - check all zones have at least one image or no zones exceed size
  const hasAnyDesigns = designImages.length > 0 || creatorTemplateFile;
  const allDesignsValid = !designImages.some((img) => {
    const zone = selectedProduct?.printZones.find((z) => z.id === img.zoneId);
    if (!zone) return false;
    const size = getEffectivePrintSize(img, zone);
    return size.width > zone.width || size.height > zone.height;
  });

  const canProceedToStep2 =
    selectedProduct !== null || customProductRequest.trim() !== "";
  const canProceedToStep3 = hasAnyDesigns && allDesignsValid;
  // Type-specific validation — collect every missing requirement so the UI can
  // tell the creator exactly what is still blocking submission.
  const submitBlockers: string[] = [];

  if (productName.trim() === "") {
    submitBlockers.push("請填寫產品名稱");
  }

  if (productType === "auction") {
    if (!auctionStartPrice || parseFloat(auctionStartPrice) <= 0) {
      submitBlockers.push("請設定起標價");
    }
    if (!auctionMinIncrement || parseFloat(auctionMinIncrement) <= 0) {
      submitBlockers.push("請設定每次加價最低金額");
    }
    if (!auctionStartTime) submitBlockers.push("請設定競標開始時間");
    if (!auctionEndTime) submitBlockers.push("請設定競標結束時間");
  } else {
    if (!sellingPrice || parseFloat(sellingPrice) <= 0) {
      submitBlockers.push("請設定售價");
    }
    if (productType === "presale") {
      if (!presaleTargetQuantity || parseInt(presaleTargetQuantity) <= 0) {
        submitBlockers.push("請設定預售達標數量");
      }
      if (!presaleStartDate) submitBlockers.push("請設定預售開始日期");
      if (!presaleEndDate) submitBlockers.push("請設定預售結束日期");
    }
    // 一般商品啟用限量時，限量數量才是必填
    if (productType === "general" && isLimited) {
      if (!limitedQuantity || parseInt(limitedQuantity) <= 0) {
        submitBlockers.push("請設定限量數量");
      }
    }
    if (productType === "general" && isTimedSale) {
      if (!saleStartAt) submitBlockers.push("請設定限時販售開始時間");
      if (!saleEndAt) submitBlockers.push("請設定限時販售結束時間");
      if (saleStartAt && saleEndAt && new Date(saleEndAt) <= new Date(saleStartAt)) {
        submitBlockers.push("限時販售結束時間需晚於開始時間");
      }
    }
  }

  if (selectedProduct?.hasMinQuantity) {
    const quantity = parseInt(preOrderQuantity);
    if (
      !preOrderQuantity ||
      Number.isNaN(quantity) ||
      quantity < (selectedProduct.minOrder || 0)
    ) {
      submitBlockers.push(`預製數量需 ≥ ${selectedProduct.minOrder} 件`);
    }
  }

  const canSubmit = submitBlockers.length === 0;

  // Get product mockup component for active zone
  const getMockupComponent = (productId: string, zoneId: string) => {
    const productMockups = ProductMockups[productId];
    if (!productMockups) return null;
    return productMockups[zoneId] || null;
  };

  const ActiveMockup = selectedProduct
    ? getMockupComponent(selectedProduct.id, activeZoneId)
    : null;

  return {
    router,
    fileInputRef,
    templateFileInputRef,
    editorRef,
    currentStep,
    setCurrentStep,
    selectedProduct,
    setSelectedProduct,
    customProductRequest,
    setCustomProductRequest,
    showCustomInput,
    setShowCustomInput,
    productSearch,
    setProductSearch,
    activeZoneId,
    setActiveZoneId,
    designImages,
    setDesignImages,
    selectedImageId,
    setSelectedImageId,
    creatorTemplateFile,
    setCreatorTemplateFile,
    templateFileUploadError,
    editorZoom,
    setEditorZoom,
    editorTool,
    setEditorTool,
    isFullscreen,
    setIsFullscreen,
    panOffset,
    productType,
    setProductType,
    productName,
    setProductName,
    productDescription,
    setProductDescription,
    auctionStartPrice,
    setAuctionStartPrice,
    auctionMinIncrement,
    setAuctionMinIncrement,
    auctionStartTime,
    setAuctionStartTime,
    auctionEndTime,
    setAuctionEndTime,
    presaleTargetQuantity,
    setPresaleTargetQuantity,
    presaleStartDate,
    setPresaleStartDate,
    presaleEndDate,
    setPresaleEndDate,
    sellingPrice,
    setSellingPrice,
    preOrderQuantity,
    setPreOrderQuantity,
    wantPreOrder,
    setWantPreOrder,
    isLimited,
    setIsLimited,
    limitedQuantity,
    setLimitedQuantity,
    isTimedSale,
    setIsTimedSale,
    saleStartAt,
    setSaleStartAt,
    saleEndAt,
    setSaleEndAt,
    productNote,
    setProductNote,
    isSubmitting,
    showSuccessDialog,
    setShowSuccessDialog,
    normalizedProductSearch,
    filteredProducts,
    activeZone,
    activeZoneImages,
    selectedImage,
    currentPrintSize,
    effectiveScalePercent,
    printWidthInput,
    setPrintWidthInput,
    printHeightInput,
    setPrintHeightInput,
    rotationInput,
    setRotationInput,
    updateImage,
    commitPrintSize,
    commitRotation,
    isPrintSizeExceeded,
    costs,
    handleFileUpload,
    handleTemplateFileUpload,
    deleteImage,
    handleImageMouseDown,
    handleResizeStart,
    handleEditorMouseMove,
    handleEditorMouseUp,
    handleEditorMouseDown,
    resetEditorView,
    resetImagePosition,
    handleSubmit,
    allDesignsValid,
    canProceedToStep2,
    canProceedToStep3,
    canSubmit,
    submitBlockers,
    getMockupComponent,
    ActiveMockup,
  };
}

export type NewProductForm = ReturnType<typeof useNewProductForm>;
