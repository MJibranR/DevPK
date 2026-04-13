import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useNotificationCount } from "@/hooks/useNotifications";
import { NavbarControls } from "@/components/devpk/NavbarControls";
import { getInitials } from "@/lib/seed-data";
import {
  Home, Users, HelpCircle, Briefcase, Rocket, Bell, Settings, Code2, LogOut, MessageCircle, User,
} from "lucide-react";

export function AppSidebar() {
  const location = useLocation();
  const { user, profile, loading, signOut } = useAuth();
  const unreadCount = useNotificationCount();
  const { t } = useLanguage();

  const navItems = [
    { label: t("feed"), to: "/feed", icon: Home },
    { label: t("communities"), to: "/communities", icon: Users },
    { label: t("qa"), to: "/questions", icon: HelpCircle },
    { label: t("jobs"), to: "/jobs", icon: Briefcase },
    { label: t("showcase"), to: "/showcase", icon: Rocket },
    { label: "Messages", to: "/messages", icon: MessageCircle },
    { label: t("notifications"), to: "/notifications", icon: Bell, badge: true },
    { label: "Profile", to: "/profile", icon: User },
    { label: t("settings"), to: "/settings", icon: Settings },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border lg:flex lg:flex-col">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <Code2 className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground">
            Dev<span className="text-primary">PK</span>
          </span>
        </div>
        <NavbarControls />
      </div>

      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <div className="relative">
                    <item.icon className="h-5 w-5" />
                    {item.badge && unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-4">
        {loading ? (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="h-9 w-9 rounded-full bg-muted" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-2.5 w-16 rounded bg-muted" />
            </div>
          </div>
        ) : profile ? (
          <div className="flex items-center gap-3">
            <Link to="/u/$username" params={{ username: profile.username }} className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  getInitials(profile.full_name || profile.username || "U")
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{profile.full_name || "User"}</p>
                <p className="truncate text-xs text-muted-foreground">@{profile.username}</p>
              </div>
            </Link>
            <button onClick={signOut} className="shrink-0 text-muted-foreground hover:text-foreground" title={t("signOut")}>
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : user ? (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {(user.email?.charAt(0) || "U").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Signed in</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <button onClick={signOut} className="shrink-0 text-muted-foreground hover:text-foreground" title={t("signOut")}>
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground">?</div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Not signed in</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
