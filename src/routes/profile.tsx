import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { getInitials, formatCount } from "@/lib/seed-data";
import { PostCard } from "@/components/devpk/PostCard";
import { AppLayout } from "@/components/devpk/AppLayout";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import {
  MapPin, GraduationCap, Github, Linkedin, Edit,
  Briefcase, Code2, Calendar, Heart, ExternalLink, Repeat2,
} from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile — DevPK" }] }),
  ssr: false,
  component: MyProfilePage,
});

function MyProfilePage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<any[]>([]);
  const [repostedPosts, setRepostedPosts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"posts" | "reposts" | "projects" | "about">("posts");
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (!profile) return;

    const loadData = async () => {
      // Get real counts from follows table
      const [{ count: realFollowers }, { count: realFollowing }] = await Promise.all([
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile.user_id),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.user_id),
      ]);

      setFollowersCount(realFollowers || 0);
      setFollowingCount(realFollowing || 0);

      // Update stored counts if stale
      if ((realFollowers || 0) !== (profile.followers_count || 0) || (realFollowing || 0) !== (profile.following_count || 0)) {
        supabase.from("profiles").update({ followers_count: realFollowers || 0, following_count: realFollowing || 0 }).eq("user_id", profile.user_id).then(() => {});
      }
    };

    loadData();

    supabase.from("posts").select("*").eq("user_id", profile.user_id).order("created_at", { ascending: false }).then(({ data }) => setPosts(data || []));
    supabase.from("projects").select("*").eq("user_id", profile.user_id).order("created_at", { ascending: false }).then(({ data }) => setProjects(data || []));
    supabase.from("reposts").select("post_id").eq("user_id", profile.user_id).order("created_at", { ascending: false }).then(async ({ data: reposts }) => {
      if (reposts && reposts.length > 0) {
        const postIds = reposts.map((r: any) => r.post_id);
        const { data: repostData } = await supabase.from("posts").select("*").in("id", postIds);
        setRepostedPosts(repostData || []);
      }
    });
  }, [profile]);

  const loadFollowers = async () => {
    if (!profile) return;
    const { data: follows } = await supabase.from("follows").select("follower_id").eq("following_id", profile.user_id);
    if (follows && follows.length > 0) {
      const ids = follows.map((f: any) => f.follower_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, username, full_name, avatar_url").in("user_id", ids);
      setFollowersList(profiles || []);
    } else {
      setFollowersList([]);
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
    } else {
      setFollowingList([]);
    }
    setShowFollowing(true);
    setShowFollowers(false);
  };

  if (authLoading) {
    return <AppLayout><div className="flex items-center justify-center p-12 text-muted-foreground">Loading...</div></AppLayout>;
  }
  if (!user || !profile) return null;

  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const tabs = [
    { key: "posts" as const, label: "Posts", count: posts.length },
    { key: "reposts" as const, label: "Reposts", count: repostedPosts.length },
    { key: "projects" as const, label: "Projects", count: projects.length },
    { key: "about" as const, label: "About" },
  ];

  return (
    <AppLayout>
      <div className="relative h-28 sm:h-36 bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/60" />
      </div>

      <div className="relative px-4 pb-4">
        <div className="-mt-12 sm:-mt-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="flex items-end gap-3">
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border-4 border-background bg-primary/20 text-xl font-bold text-primary overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full rounded-full object-cover" />
              ) : (
                getInitials(profile.full_name || profile.username)
              )}
            </div>
            <div className="pb-1">
              <h1 className="text-lg sm:text-xl font-bold text-foreground">{profile.full_name || profile.username}</h1>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate({ to: "/settings" })} className="gap-1.5 self-start sm:self-auto">
            <Edit className="h-3.5 w-3.5" /> Edit Profile
          </Button>
        </div>

        {profile.role && (
          <p className="mt-2 text-sm font-medium text-primary flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" /> {profile.role}
          </p>
        )}
        {profile.bio && <p className="mt-2 text-sm text-foreground leading-relaxed">{profile.bio}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-muted-foreground">
          {profile.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.location}</span>}
          {profile.university && <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {profile.university}</span>}
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Joined {joinDate}</span>
        </div>

        <div className="mt-2 flex items-center gap-3">
          {profile.github_url && (
            <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Github className="h-4 w-4" /> GitHub
            </a>
          )}
          {profile.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Linkedin className="h-4 w-4" /> LinkedIn
            </a>
          )}
        </div>

        {profile.stack && profile.stack.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.stack.map((tech: string) => (
              <span key={tech} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{tech}</span>
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
          <span><strong className="text-foreground">{posts.length}</strong> <span className="text-muted-foreground">posts</span></span>
        </div>
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

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-none px-4 py-2.5 text-center text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.key ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ""}
          </button>
        ))}
      </div>

      {activeTab === "posts" && (
        posts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No posts yet. Share your first post from the feed!</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate({ to: "/feed" })}>Go to Feed</Button>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} onDelete={(id) => setPosts(posts.filter((p) => p.id !== id))} />)
        )
      )}

      {activeTab === "reposts" && (
        repostedPosts.length === 0 ? (
          <div className="p-8 text-center">
            <Repeat2 className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">No reposts yet</p>
          </div>
        ) : (
          repostedPosts.map((post) => (
            <div key={post.id}>
              <div className="flex items-center gap-1.5 px-4 pt-2 text-xs text-muted-foreground">
                <Repeat2 className="h-3 w-3" /> You reposted
              </div>
              <PostCard post={post} />
            </div>
          ))
        )
      )}

      {activeTab === "projects" && (
        projects.length === 0 ? (
          <div className="p-8 text-center">
            <Code2 className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">No projects yet. Add one from Showcase!</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate({ to: "/showcase" })}>Go to Showcase</Button>
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            {projects.map((project) => (
              <div key={project.id} className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/30">
                <div className="flex h-28 items-center justify-center bg-secondary">
                  {project.cover_image ? (
                    <img src={project.cover_image} alt={project.title} className="h-full w-full object-cover" />
                  ) : (
                    <Code2 className="h-10 w-10 text-muted-foreground/30" />
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-foreground">{project.title}</h3>
                  {project.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{project.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {project.stack?.map((tech: string) => (
                      <span key={tech} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">{tech}</span>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      <span className="text-xs">{formatCount(project.likes_count || 0)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.live_url && <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><ExternalLink className="h-3.5 w-3.5" /></a>}
                      {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Github className="h-3.5 w-3.5" /></a>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === "about" && (
        <div className="p-4 space-y-4">
          <AboutSection title="Bio" content={profile.bio} placeholder="No bio added yet" />
          <AboutSection title="Role" content={profile.role} placeholder="No role specified" />
          <AboutSection title="Institute" content={profile.university} placeholder="No institute added" />
          <AboutSection title="Location" content={profile.location} placeholder="No location set" />
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">Tech Stack</h3>
            {profile.stack && profile.stack.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.stack.map((tech: string) => (
                  <span key={tech} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{tech}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tech stack added</p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">Links</h3>
            <div className="space-y-1">
              {profile.github_url ? (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Github className="h-4 w-4" /> {profile.github_url}
                </a>
              ) : null}
              {profile.linkedin_url ? (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Linkedin className="h-4 w-4" /> {profile.linkedin_url}
                </a>
              ) : null}
              {!profile.github_url && !profile.linkedin_url && (
                <p className="text-sm text-muted-foreground">No links added</p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate({ to: "/settings" })}>
            <Edit className="h-3.5 w-3.5" /> Edit Info
          </Button>
        </div>
      )}
    </AppLayout>
  );
}

function AboutSection({ title, content, placeholder }: { title: string; content?: string | null; placeholder: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-0.5">{title}</h3>
      <p className={`text-sm ${content ? "text-foreground" : "text-muted-foreground"}`}>{content || placeholder}</p>
    </div>
  );
}
