import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/devpk/AppLayout";
import { PostCard } from "@/components/devpk/PostCard";
import { PostComposer } from "@/components/devpk/PostComposer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { formatCount } from "@/lib/seed-data";

export const Route = createFileRoute("/c/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — DevPK` }],
  }),
  ssr: false,
  component: CommunityPage,
});

function CommunityPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: c } = await supabase.from("communities").select("*").eq("slug", slug).single();
      if (c) {
        setCommunity(c);
        const { data: p } = await supabase.from("posts").select("*").eq("community_id", c.id).order("created_at", { ascending: false });
        setPosts(p || []);
        if (user) {
          const { data: m } = await supabase.from("community_members").select("id").eq("user_id", user.id).eq("community_id", c.id).maybeSingle();
          setJoined(!!m);
        }
      }
      setLoading(false);
    };
    load();
  }, [slug, user?.id]);

  const handleJoin = async () => {
    if (!user || !community) return;
    if (joined) {
      await supabase.from("community_members").delete().eq("user_id", user.id).eq("community_id", community.id);
      setJoined(false);
    } else {
      await supabase.from("community_members").insert({ user_id: user.id, community_id: community.id });
      setJoined(true);
    }
  };

  const handleNewPost = (post: any) => {
    setPosts([post, ...posts]);
  };

  if (loading) return <AppLayout><p className="p-12 text-center text-muted-foreground">Loading...</p></AppLayout>;
  if (!community) return <AppLayout><p className="p-12 text-center text-muted-foreground">Community not found</p></AppLayout>;

  return (
    <AppLayout>
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{community.icon}</span>
            <div>
              <h1 className="text-lg font-bold text-foreground">{community.name}</h1>
              <p className="text-sm text-muted-foreground">{formatCount(community.member_count || 0)} members</p>
            </div>
          </div>
          {user && (
            <Button size="sm" variant={joined ? "secondary" : "default"} onClick={handleJoin}>
              {joined ? "Joined" : "Join"}
            </Button>
          )}
        </div>
        {community.description && <p className="mt-2 text-sm text-muted-foreground">{community.description}</p>}
      </div>

      {user && joined && (
        <PostComposer onPost={handleNewPost} communityId={community.id} />
      )}

      {!joined && user && (
        <p className="p-4 text-center text-sm text-muted-foreground">Join this community to post</p>
      )}

      {posts.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">No posts in this community yet</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </AppLayout>
  );
}
