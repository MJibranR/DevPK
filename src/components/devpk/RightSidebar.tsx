import { supabase } from "@/integrations/supabase/client";
import { UserCard } from "./UserCard";
import { SearchBar } from "./SearchBar";
import { TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";

export function RightSidebar() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [trendingTags, setTrendingTags] = useState<{ tag: string; count: number }[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("posts").select("hashtags").order("created_at", { ascending: false }).limit(100).then(({ data }) => {
      const tagCounts: Record<string, number> = {};
      data?.forEach((p) => {
        p.hashtags?.forEach((t: string) => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
      });
      const sorted = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag, count]) => ({ tag, count }));
      setTrendingTags(sorted);
    });
  }, []);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (!user) {
        const { data } = await supabase.from("profiles").select("id, user_id, username, full_name, avatar_url, role, stack").limit(5);
        setSuggestedUsers(data || []);
        return;
      }

      // Get IDs the user already follows
      const { data: follows } = await supabase.from("follows").select("following_id").eq("follower_id", user.id);
      const followedIds = new Set(follows?.map((f: any) => f.following_id) || []);
      followedIds.add(user.id); // Exclude self

      const { data: allUsers } = await supabase
        .from("profiles")
        .select("id, user_id, username, full_name, avatar_url, role, stack")
        .limit(20);

      const filtered = (allUsers || []).filter((u: any) => !followedIds.has(u.user_id)).slice(0, 5);
      setSuggestedUsers(filtered);
    };
    loadSuggestions();
  }, [user?.id]);

  const handleFollowed = (userId: string) => {
    setSuggestedUsers((prev) => prev.filter((u) => u.user_id !== userId));
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 overflow-y-auto border-l border-border xl:block">
      <div className="p-4 space-y-4">
        <SearchBar />

        {trendingTags.length > 0 && (
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">{t("trending")}</h3>
            </div>
            <div className="divide-y divide-border">
              {trendingTags.map((item) => (
                <Link
                  key={item.tag}
                  to="/feed"
                  search={{ hashtag: item.tag }}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-secondary"
                >
                  <span className="text-sm font-medium text-primary">#{item.tag}</span>
                  <span className="text-xs text-muted-foreground">{item.count} {t("posts").toLowerCase()}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {suggestedUsers.length > 0 && (
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">{t("whoToFollow")}</h3>
            </div>
            <div className="px-4 py-1 divide-y divide-border">
              {suggestedUsers.map((u) => (
                <UserCard key={u.id} user={u} compact onFollowed={() => handleFollowed(u.user_id)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
