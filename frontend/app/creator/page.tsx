import { Suspense } from "react";
import CreatorDetail from "./creator-detail";

// A static entry point supports any API creator ID without build-time database access.
export default function CreatorPage() {
  return <Suspense fallback={<main className="container mx-auto px-4 pt-24">創作者載入中…</main>}><CreatorDetail /></Suspense>;
}
