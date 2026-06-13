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
      <div className="container mx-auto px-4 pt-24 pb-20">
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
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 px-4 py-2 pb-6">
        <div className="flex items-center justify-around">
          <MobileNavItem href="/" icon="home" label="首頁" active />
          <MobileNavItem href="/explore" icon="compass" label="探索" />
          <MobileNavItem href="/events" icon="calendar" label="活動" />
          <MobileNavItem href="/shop" icon="shopping" label="商店" />
        </div>
      </nav>
    </div>
  );
}

function MobileNavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}) {
  const icons: Record<string, React.ReactNode> = {
    home: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    compass: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    calendar: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    shopping: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
  };

  return (
    <a
      href={href}
      className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
        active ? "text-violet-500" : "text-zinc-400 hover:text-white"
      }`}
    >
      {icons[icon]}
      <span className="text-xs">{label}</span>
    </a>
  );
}
