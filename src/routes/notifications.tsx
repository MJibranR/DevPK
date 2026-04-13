import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/devpk/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { formatTimeAgo } from "@/lib/seed-data";
import { Heart, UserPlus, MessageCircle, AtSign, Reply } from "lucide-react";

const iconMap: Record<string, any> = {
  like: Heart,
  follow: UserPlus,
  comment: MessageCircle,
  answer: Reply,
  mention: AtSign,
};

const colorMap: Record<string, string> = {
  like: "bg-red-500/10 text-red-500",
  follow: "bg-blue-500/10 text-blue-500",
  comment: "bg-green-500/10 text-green-500",
  answer: "bg-amber-500/10 text-amber-500",
  mention: "bg-purple-500/10 text-purple-500",
};

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — DevPK" }] }),
  ssr: false,
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      
      // Enrich with profile data
      let enriched = data || [];
      if (data && data.length > 0) {
        const fromIds = [...new Set(data.filter((n: any) => n.from_user_id).map((n: any) => n.from_user_id))];
        if (fromIds.length > 0) {
          const { data: profiles } = await supabase.from("profiles").select("user_id, username, full_name, avatar_url").in("user_id", fromIds);
          const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
          enriched = data.map((n: any) => ({ ...n, from_profile: profileMap.get(n.from_user_id) }));
        }
      }
      setNotifications(enriched);
      setLoading(false);
      await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    };
    load();

    const channel = supabase
      .channel("notifications-page")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
        setNotifications((prev) => [payload.new as any, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const messageMap: Record<string, string> = {
    like: "liked your post",
    follow: "started following you",
    comment: "commented on your post",
    answer: "answered your question",
    mention: "mentioned you in a post",
  };

  const filters = ["all", "like", "follow", "comment", "mention", "answer"];
  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.type === filter);

  if (!user) {
    return <AppLayout><div className="p-8 text-center text-muted-foreground">Please log in to view notifications.</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold text-foreground">Notifications</h1>
      </div>
      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto border-b border-border px-4 py-2">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
            {f}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="p-8 text-center text-sm text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">No notifications</p>
      ) : (
        <div className="divide-y divide-border">
          {filtered.map((n) => {
            const Icon = iconMap[n.type] || Heart;
            const colors = colorMap[n.type] || "bg-primary/10 text-primary";
            const fromProfile = n.from_profile;
            return (
              <div key={n.id} className={`flex items-start gap-3 p-4 transition-colors hover:bg-card/50 ${!n.read ? "bg-primary/5 border-l-2 border-primary" : ""}`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colors}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    {fromProfile ? (
                      <Link to="/u/$username" params={{ username: fromProfile.username }} className="font-semibold hover:text-primary">
                        {fromProfile.full_name || fromProfile.username}
                      </Link>
                    ) : (
                      <span className="font-semibold">Someone</span>
                    )}{" "}
                    <span className="text-muted-foreground">{messageMap[n.type] || n.type}</span>
                  </p>
                  <span className="text-xs text-muted-foreground">{formatTimeAgo(n.created_at)}</span>
                </div>
                {fromProfile?.avatar_url && (
                  <img src={fromProfile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
