import { Navigation } from "@/components/navigation";
import { UniverseBackground } from "@/components/universe-background";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <div className="relative min-h-screen"><UniverseBackground /><Navigation /><main className="container mx-auto max-w-5xl px-4 pt-24 pb-20">{children}</main></div>;
}
