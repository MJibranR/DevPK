import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { getInitials, formatCount } from "@/lib/seed-data";
import { PostCard } from "@/components/devpk/PostCard";
import { AppLayout } from "@/components/devpk/AppLayout";
import { Button } from "@/components/ui/button";
import { MapPin, GraduationCap, Github, Linkedin, Edit, MessageCircle, UserPlus, UserCheck, Users } from "lucide-react";

export const Route = createFileRoute("/u/$username")({
  head: ({ params }) => ({
    meta: [{ title: `${params.username} — DevPK` }],
  }),
  ssr: false,
  component: ProfilePage,
});

function ProfilePage() {
  const { username } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [mutualFollowers, setMutualFollowers] = useState<any[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);

  const isOwnProfile = user && profile && user.id === profile.user_id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: p } = await supabase.from("profiles").select("*").eq("username", username).single();
      if (!p) { setLoading(false); return; }
      
      setProfile(p);

      // Get real follower/following counts from follows table
      const [{ count: realFollowers }, { count: realFollowing }, { data: userPosts }] = await Promise.all([
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", p.user_id),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", p.user_id),
        supabase.from("posts").select("*").eq("user_id", p.user_id).order("created_at", { ascending: false }),
      ]);

      setFollowersCount(realFollowers || 0);
      setFollowingCount(realFollowing || 0);
      setPosts(userPosts || []);

      // Update profile counts if they're stale
      if ((realFollowers || 0) !== (p.followers_count || 0) || (realFollowing || 0) !== (p.following_count || 0)) {
        supabase.from("profiles").update({ followers_count: realFollowers || 0, following_count: realFollowing || 0 }).eq("user_id", p.user_id).then(() => {});
      }

      if (user && user.id !== p.user_id) {
        // Check if following
        const { data: f } = await supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", p.user_id).maybeSingle();
        setIsFollowing(!!f);

        // Get mutual followers: people who follow this profile AND I follow them
        const { data: theirFollowers } = await supabase.from("follows").select("follower_id").eq("following_id", p.user_id);
        const { data: myFollowing } = await supabase.from("follows").select("following_id").eq("follower_id", user.id);
        
        if (theirFollowers && myFollowing) {
          const myFollowingSet = new Set(myFollowing.map((f: any) => f.following_id));
          const mutualIds = theirFollowers.map((f: any) => f.follower_id).filter((id: string) => myFollowingSet.has(id) && id !== user.id);
          
          if (mutualIds.length > 0) {
            const { data: mutualProfiles } = await supabase.from("profiles").select("user_id, username, full_name, avatar_url").in("user_id", mutualIds.slice(0, 5));
            setMutualFollowers(mutualProfiles || []);
          }
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [username, user?.id]);

  const handleFollow = async () => {
    if (!user || !profile) return;
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profile.user_id);
      setIsFollowing(false);
      setFollowersCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: profile.user_id });
      await supabase.from("notifications").insert({ user_id: profile.user_id, type: "follow", from_user_id: user.id });
      setIsFollowing(true);
      setFollowersCount((c) => c + 1);
    }
  };

  const handleMessage = async () => {
    if (!user || !profile) return;
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${profile.user_id}),and(user1_id.eq.${profile.user_id},user2_id.eq.${user.id})`)
      .maybeSingle();
    if (!existing) {
      await supabase.from("conversations").insert({ user1_id: user.id, user2_id: profile.user_id });
    }
    navigate({ to: "/messages" });
  };

  const loadFollowers = async () => {
    if (!profile) return;
    const { data: follows } = await supabase.from("follows").select("follower_id").eq("following_id", profile.user_id);
    if (follows && follows.length > 0) {
      const ids = follows.map((f: any) => f.follower_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, username, full_name, avatar_url").in("user_id", ids);
      setFollowersList(profiles || []);
    }
    setShowFollowers(true);
    setShowFollowing(false);
  };

  const loadFollowing = async () => {
    if (!profile) return;
    const { data: follows } = await supabase.from("follows").select("following_id").eq("follower_id", profile.user_id);
    if (follows && follows.length > 0) {
      const ids = follows.map((f: any) => f.following_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, username, full_name, avatar_url").in("user_id", ids);
      setFollowingList(profiles || []);
    }
    setShowFollowing(true);
    setShowFollowers(false);
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center p-12 text-muted-foreground">Loading...</div></AppLayout>;
  }
  if (!profile) {
    return <AppLayout><div className="flex items-center justify-center p-12 text-muted-foreground">User not found</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="border-b border-border px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover" />
              ) : (
                getInitials(profile.full_name || profile.username)
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{profile.full_name}</h1>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              {profile.role && <p className="mt-0.5 text-sm text-primary">{profile.role}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            {isOwnProfile ? (
              <Link to="/settings"><Button variant="outline" size="sm" className="gap-1.5"><Edit className="h-3.5 w-3.5" /> Edit profile</Button></Link>
            ) : user ? (
              <>
                <Button size="sm" variant={isFollowing ? "secondary" : "default"} onClick={handleFollow} className="gap-1.5">
                  {isFollowing ? <><UserCheck className="h-3.5 w-3.5" /> Following</> : <><UserPlus className="h-3.5 w-3.5" /> Connect</>}
                </Button>
                <Button size="sm" variant="outline" onClick={handleMessage} className="gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" /> Message
                </Button>
              </>
            ) : null}
          </div>
        </div>

        {profile.bio && <p className="mt-3 text-sm text-foreground">{profile.bio}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {profile.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.location}</span>}
          {profile.university && <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {profile.university}</span>}
          {profile.github_url && <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary"><Github className="h-4 w-4" /></a>}
          {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary"><Linkedin className="h-4 w-4" /></a>}
        </div>

        {profile.stack && profile.stack.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.stack.map((tech: string) => (
              <span key={tech} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">{tech}</span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-4 text-sm">
          <button onClick={loadFollowing} className="hover:underline">
            <strong className="text-foreground">{formatCount(followingCount)}</strong> <span className="text-muted-foreground">following</span>
          </button>
          <button onClick={loadFollowers} className="hover:underline">
            <strong className="text-foreground">{formatCount(followersCount)}</strong> <span className="text-muted-foreground">followers</span>
          </button>
        </div>

        {/* Mutual followers */}
        {mutualFollowers.length > 0 && !isOwnProfile && (
          <div className="mt-3 flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="flex -space-x-1.5">
              {mutualFollowers.slice(0, 3).map((m) => (
                <div key={m.user_id} className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[8px] font-bold text-primary border border-background overflow-hidden">
                  {m.avatar_url ? <img src={m.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" /> : getInitials(m.full_name || "U")}
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              Followed by {mutualFollowers.slice(0, 2).map((m) => m.full_name).join(", ")}
              {mutualFollowers.length > 2 && ` and ${mutualFollowers.length - 2} more you follow`}
            </span>
          </div>
        )}
      </div>

      {/* Followers/Following lists */}
      {(showFollowers || showFollowing) && (
        <div className="border-b border-border">
          <div className="flex items-center justify-between px-4 py-2.5 bg-card/50">
            <h2 className="text-sm font-semibold text-foreground">{showFollowers ? "Followers" : "Following"}</h2>
            <button onClick={() => { setShowFollowers(false); setShowFollowing(false); }} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
          </div>
          <div className="divide-y divide-border">
            {(showFollowers ? followersList : followingList).map((p) => (
              <Link key={p.user_id} to="/u/$username" params={{ username: p.username }} className="flex items-center gap-3 px-4 py-3 hover:bg-card/50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary overflow-hidden">
                  {p.avatar_url ? <img src={p.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" /> : getInitials(p.full_name || "U")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground">@{p.username}</p>
                </div>
              </Link>
            ))}
            {(showFollowers ? followersList : followingList).length === 0 && (
              <p className="p-4 text-center text-sm text-muted-foreground">None yet</p>
            )}
          </div>
        </div>
      )}

      <div className="border-b border-border px-4 py-2">
        <h2 className="text-sm font-semibold text-foreground">Posts</h2>
      </div>
      {posts.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">No posts yet</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </AppLayout>
  );
}
