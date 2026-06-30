import Link from "next/link";
import { cn } from "@/lib/utils";

interface IOSNavBarProps {
  title: string;
  backHref?: string;
  backLabel?: string;
  right?: React.ReactNode;
  large?: boolean;
}

export function IOSNavBar({
  title,
  backHref,
  backLabel = "返回",
  right,
  large = true,
}: IOSNavBarProps) {
  return (
    <header className="ios-blur sticky top-0 z-50 border-b border-ios-separator safe-top">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between h-11">
          <div className="w-20">
            {backHref && (
              <Link
                href={backHref}
                className="text-ios-blue text-base flex items-center gap-0.5 -ml-1"
              >
                <svg
                  width="10"
                  height="16"
                  viewBox="0 0 10 16"
                  fill="none"
                  className="mt-0.5"
                >
                  <path
                    d="M9 1L2 8L9 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {backLabel}
              </Link>
            )}
          </div>
          {!large && (
            <h1 className="text-base font-semibold absolute left-1/2 -translate-x-1/2">
              {title}
            </h1>
          )}
          <div className="w-20 flex justify-end">{right}</div>
        </div>
        {large && (
          <h1 className="text-3xl font-bold pb-3 tracking-tight">{title}</h1>
        )}
      </div>
    </header>
  );
}

interface IOSTabItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface IOSTabBarProps {
  items: IOSTabItem[];
  activeHref: string;
}

export function IOSTabBar({ items, activeHref }: IOSTabBarProps) {
  return (
    <nav className="ios-blur fixed bottom-0 left-0 right-0 border-t border-ios-separator safe-bottom z-50">
      <div className="max-w-3xl mx-auto flex">
        {items.map((item) => {
          const active = activeHref.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors",
                active ? "text-ios-blue" : "text-ios-gray"
              )}
            >
              <span className="w-6 h-6">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

interface IOSPageProps {
  children: React.ReactNode;
  className?: string;
  withTabBar?: boolean;
}

export function IOSPage({ children, className, withTabBar }: IOSPageProps) {
  return (
    <main
      className={cn(
        "min-h-screen bg-ios-bg",
        withTabBar && "pb-20",
        className
      )}
    >
      {children}
    </main>
  );
}
