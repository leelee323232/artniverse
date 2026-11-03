"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PostImages({ images, alt = "貼文圖片" }: {
  images: string[];
  alt?: string;
}) {
  const [index, setIndex] = useState(0);
  const current = Math.min(index, Math.max(0, images.length - 1));
  if (!images.length) return null;
  const picture = <img src={images[current]} alt={`${alt}（${current + 1}/${images.length}）`} className="h-full w-full object-cover" />;
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/20" role="region" aria-label="貼文圖片輪播">
      {picture}
      {images.length > 1 && <>
        <button type="button" aria-label="上一張圖片" onClick={() => setIndex((current - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-white"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" aria-label="下一張圖片" onClick={() => setIndex((current + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-white"><ChevronRight className="h-4 w-4" /></button>
        <div className="absolute bottom-3 left-1/2 flex max-w-[80%] -translate-x-1/2 gap-1 overflow-x-auto rounded-full bg-black/40 px-2 py-1">
          {images.map((_, i) => <button key={i} type="button" aria-label={`顯示第 ${i + 1} 張圖片`} aria-pressed={i === current} onClick={() => setIndex(i)} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-white"><span className={`h-1.5 w-1.5 rounded-full bg-white ${i === current ? "opacity-100 scale-125" : "opacity-40"}`} /></button>)}
        </div>
        <span className="sr-only" aria-live="polite">第 {current + 1} 張，共 {images.length} 張</span>
      </>}
    </div>
  );
}
