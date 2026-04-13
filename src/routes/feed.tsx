import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/devpk/AppLayout";
import { RightSidebar } from "@/components/devpk/RightSidebar";
import { PostComposer } from "@/components/devpk/PostComposer";
import { PostCard } from "@/components/devpk/PostCard";
import { Repeat2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

type FeedSearch = {
  hashtag?: string;
};

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [{ title: "Feed — DevPK" }],
  }),
  component: FeedPage,
  ssr: false,
  validateSearch: (search: Record<string, unknown>): FeedSearch => ({
    hashtag: typeof search.hashtag === "string" ? search.hashtag : undefined,
  }),
  errorComponent: ({ error, reset }) => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error?.message || "An unexpected error occurred."}</p>
        <button onClick={reset} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
          Try again
        </button>
      </div>
    </div>
  ),
});

function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { hashtag } = Route.useSearch();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const loadFeed = async () => {
      let query = supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (hashtag) {
        query = query.contains("hashtags", [hashtag]);
      }

      const { data: feedPosts } = await query;
      
      // Also fetch reposted posts
      if (!hashtag) {
        const { data: reposts } = await supabase
          .from("reposts")
          .select("post_id, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (reposts && reposts.length > 0) {
          const repostIds = reposts.map((r: any) => r.post_id);
          const existingIds = new Set((feedPosts || []).map((p: any) => p.id));
          const missingIds = repostIds.filter((id: string) => !existingIds.has(id));
          
          if (missingIds.length > 0) {
            const { data: repostedPosts } = await supabase
              .from("posts")
              .select("*")
              .in("id", missingIds);
            
            if (repostedPosts) {
              const repostTimeMap = new Map(reposts.map((r: any) => [r.post_id, r.created_at]));
              const tagged = repostedPosts.map((p: any) => ({
                ...p,
                _reposted: true,
                _repost_time: repostTimeMap.get(p.id),
              }));
              const all = [...(feedPosts || []), ...tagged];
              all.sort((a: any, b: any) => {
                const timeA = a._repost_time || a.created_at;
                const timeB = b._repost_time || b.created_at;
                return new Date(timeB).getTime() - new Date(timeA).getTime();
              });
              setPosts(all);
              setLoading(false);
              return;
            }
          }
        }
      }
      
      setPosts(feedPosts || []);
      setLoading(false);
    };

    loadFeed();
  }, [user, hashtag]);

  const handleNewPost = (post: any) => {
    setPosts([post, ...posts]);
  };

  const clearHashtag = () => {
    navigate({ to: "/feed", search: {} });
  };

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Loading...</div>;
  if (!user) return null;

  return (
    <AppLayout rightSidebar={<RightSidebar />}>
      <div className="hidden border-b border-border px-4 py-3 lg:block">
        <h1 className="text-lg font-semibold text-foreground">{t("feed")}</h1>
      </div>

      {hashtag && (
        <div className="flex items-center gap-2 border-b border-border bg-primary/5 px-4 py-2">
          <span className="text-sm text-foreground">
            Showing posts with <span className="font-semibold text-primary">#{hashtag}</span>
          </span>
          <button onClick={clearHashtag} className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <PostComposer onPost={handleNewPost} />
      {loading ? (
        <p className="p-8 text-center text-sm text-muted-foreground">{t("loadingPosts")}</p>
      ) : posts.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">{hashtag ? `No posts with #${hashtag} yet` : t("noPostsYet")}</p>
      ) : (
        posts.map((post) => (
          <div key={post.id}>
            {post._reposted && (
              <div className="flex items-center gap-1.5 px-4 pt-2 text-xs text-muted-foreground">
                <Repeat2 className="h-3 w-3" /> You reposted
              </div>
            )}
            <PostCard post={post} />
          </div>
        ))
      )}
    </AppLayout>
  );
}
