import { ReactNode } from "react";
import { AppSidebar } from "@/components/devpk/AppSidebar";
import { MobileNav } from "@/components/devpk/MobileNav";
import { SearchBar } from "@/components/devpk/SearchBar";
import { NavbarControls } from "@/components/devpk/NavbarControls";
import { Code2 } from "lucide-react";

export function AppLayout({ children, rightSidebar }: { children: ReactNode; rightSidebar?: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 min-w-0 border-r border-border lg:border-r-0 xl:border-r">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 flex items-center gap-2 border-b border-border bg-background/80 px-3 py-2.5 backdrop-blur-sm sm:px-4 sm:py-3 lg:hidden">
          <Code2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="text-base sm:text-lg font-bold">Dev<span className="text-primary">PK</span></span>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <NavbarControls />
            <div className="max-w-[120px] sm:max-w-[160px]">
              <SearchBar compact />
            </div>
          </div>
        </div>
        {children}
        <div className="h-16 lg:hidden" />
      </main>
      {rightSidebar}
      <MobileNav />
    </div>
  );
}
