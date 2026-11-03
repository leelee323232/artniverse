"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function CollapsiblePostContent({ content, children }: {
  content: string;
  children?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const textId = useId();

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;
    const measure = () => {
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
      setOverflows(element.scrollHeight > lineHeight * 3 + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [content]);

  return (
    <div>
      <p ref={textRef} id={textId} className={`whitespace-pre-wrap break-words text-sm leading-5 ${expanded ? "" : "line-clamp-3"}`}>
        {children}<span className="text-foreground/90">{content}</span>
      </p>
      {overflows && (
        <button type="button" aria-expanded={expanded} aria-controls={textId} onClick={() => setExpanded((value) => !value)} className="mt-1 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary">
          {expanded ? "收起" : "顯示更多"}
        </button>
      )}
    </div>
  );
}
