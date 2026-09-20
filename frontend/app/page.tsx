import { EventsSidebar } from "@/components/feed/events-sidebar";
import { FeedContent } from "@/components/feed/feed-content";
import { ProductsSidebar } from "@/components/feed/products-sidebar";
import { Navigation } from "@/components/navigation";
import { UniverseBackground } from "@/components/universe-background";

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Mobile - Events (horizontal scroll) */}
        <div className="mb-6 lg:hidden">
          <EventsSidebar layout="horizontal" />
        </div>

        <div className="flex gap-6">
          {/* Left Sidebar - Events */}
          <div className="hidden lg:block">
            <EventsSidebar />
          </div>

          {/* Center - Feed */}
          <FeedContent />

          {/* Right Sidebar - Products */}
          <div className="hidden lg:block">
            <ProductsSidebar />
          </div>
        </div>

        {/* Mobile - Products (horizontal scroll) */}
        <div className="mt-6 lg:hidden">
          <ProductsSidebar layout="horizontal" />
        </div>
      </div>
    </div>
  );
}
