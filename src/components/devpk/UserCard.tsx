import { getInitials } from "@/lib/seed-data";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserCardProps {
  user: {
    id: string;
    user_id?: string;
    username: string;
    full_name: string;
    avatar_url?: string | null;
    role?: string;
    stack?: string[];
  };
  compact?: boolean;
  onFollowed?: () => void;
}

export function UserCard({ user, compact = false, onFollowed }: UserCardProps) {
  const { user: authUser } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const targetUserId = user.user_id || user.id;
  const isSelf = authUser?.id === targetUserId;

  useEffect(() => {
    if (!authUser || isSelf) return;
    supabase
      .from("follows")
      .select("id")
      .eq("follower_id", authUser.id)
      .eq("following_id", targetUserId)
      .maybeSingle()
      .then(({ data }) => setFollowing(!!data));
  }, [authUser?.id, targetUserId, isSelf]);

  const toggleFollow = async () => {
    if (!authUser || isSelf || loading) return;
    setLoading(true);
    if (following) {
      await supabase.from("follows").delete().eq("follower_id", authUser.id).eq("following_id", targetUserId);
      setFollowing(false);
    } else {
      await supabase.from("follows").insert({ follower_id: authUser.id, following_id: targetUserId });
      setFollowing(true);
      onFollowed?.();
      // Send notification
      await supabase.from("notifications").insert({
        user_id: targetUserId,
        type: "follow",
        from_user_id: authUser.id,
      });
    }
    setLoading(false);
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between py-2">
        <Link to="/u/$username" params={{ username: user.username }} className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              getInitials(user.full_name)
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground hover:underline">{user.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </Link>
        {!isSelf && (
          <Button
            size="sm"
            variant={following ? "secondary" : "default"}
            className="shrink-0 text-xs h-7 px-3"
            onClick={toggleFollow}
            disabled={loading}
          >
            {following ? t("following") : t("follow")}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <Link to="/u/$username" params={{ username: user.username }} className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              getInitials(user.full_name)
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground hover:underline">{user.full_name}</p>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            {user.role && <p className="text-sm text-muted-foreground">{user.role}</p>}
          </div>
        </Link>
        {!isSelf && (
          <Button
            size="sm"
            variant={following ? "secondary" : "default"}
            onClick={toggleFollow}
            disabled={loading}
          >
            {following ? t("following") : t("follow")}
          </Button>
        )}
      </div>
      {user.stack && user.stack.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {user.stack.slice(0, 4).map((tech) => (
            <span key={tech} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
              {tech}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
