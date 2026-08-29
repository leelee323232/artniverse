"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  platformProducts,
  type ProductDefinition,
} from "./data/platform-products";
import { ProductMockups } from "./data/product-mockups";
import {
  type DesignImage,
  getEffectivePrintSize,
  getEffectiveScalePercent,
} from "./lib/print-size";

export function useNewProductForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Product selection
  const [selectedProduct, setSelectedProduct] =
    useState<ProductDefinition | null>(null);
  const [customProductRequest, setCustomProductRequest] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // Zone selection
  const [activeZoneId, setActiveZoneId] = useState<string>("");

  // Multiple design uploads - organized by zone
  const [designImages, setDesignImages] = useState<DesignImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Editor state
  const [editorZoom, setEditorZoom] = useState(100);
  const [editorTool, setEditorTool] = useState<"select" | "pan">("select");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
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
    ? platformProducts.filter(
        (product) =>
          product.nameZh.toLowerCase().includes(normalizedProductSearch) ||
          product.name.toLowerCase().includes(normalizedProductSearch),
      )
    : platformProducts;

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
    const stockingCost = Math.round(productionCost * 1.3); // 3. 備貨成本 = (1+2) * 130%

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
      totalPrintWidth: totalPrint.width,
      totalPrintHeight: totalPrint.height,
    };
  }, [selectedProduct, getTotalPrintArea, sellingPrice]);

  const costs = calculateCosts();

  // Handle file upload - support multiple files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !activeZoneId) return;

    Array.from(files).forEach((file) => {
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

  // Handle mouse move for dragging or panning
  const handleEditorMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedImageId && editorTool === "select") {
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
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setShowSuccessDialog(true);
  };

  // Validation - check all zones have at least one image or no zones exceed size
  const hasAnyDesigns = designImages.length > 0;
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
    updateImage,
    commitPrintSize,
    isPrintSizeExceeded,
    costs,
    handleFileUpload,
    deleteImage,
    handleImageMouseDown,
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
