import { Link, useLocation } from "@tanstack/react-router";
import { Home, Users, HelpCircle, Rocket, Settings, User, MessageCircle, Bell } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationCount } from "@/hooks/useNotifications";

export function MobileNav() {
  const location = useLocation();
  const { t } = useLanguage();
  const { profile } = useAuth();
  const unreadCount = useNotificationCount();

  const items = [
    { to: "/feed", icon: Home, label: t("feed") },
    { to: "/communities", icon: Users, label: t("communities") },
    { to: "/questions", icon: HelpCircle, label: t("qa") },
    { to: "/messages", icon: MessageCircle, label: "Chat" },
    { to: "/notifications", icon: Bell, label: t("notifications"), badge: true },
    { to: "/profile", icon: User, label: "Profile" },
    { to: "/settings", icon: Settings, label: t("settings") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background lg:hidden">
      <div className="flex items-center justify-around py-1">
        {items.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-1 py-1 text-[9px] sm:text-xs ${active ? "text-primary" : "text-muted-foreground"}`}
            >
              <div className="relative">
                <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                {item.badge && unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
