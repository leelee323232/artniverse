// Repeating watermark overlaid on top of uploaded design previews.
// The mockup is for reference only, so previews are always watermarked.
const WATERMARK_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><text x="10" y="82" fill="rgba(255,255,255,0.32)" font-size="15" font-weight="bold" font-family="Arial, sans-serif" transform="rotate(-30 75 75)">ARTNIVERSE</text></svg>`,
);

export function WatermarkOverlay({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-10 ${className || ""}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,${WATERMARK_SVG}")`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}
