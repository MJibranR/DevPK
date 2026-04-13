import { Heart, MessageCircle, Repeat2, Bookmark, Share, Send, X, Trash2, MoreHorizontal } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getInitials, formatTimeAgo, formatCount } from "@/lib/seed-data";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  hashtags: string[];
  likes_count: number;
  replies_count: number;
  created_at: string;
}

function renderContent(content: string) {
  const parts = content.split(/(#\w+|@\w+|```[\s\S]*?```|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("#")) {
      const tag = part.slice(1);
      return <Link key={i} to="/feed" search={{ hashtag: tag }} className="hashtag">{part}</Link>;
    }
    if (part.startsWith("@")) {
      const username = part.slice(1);
      return <Link key={i} to="/u/$username" params={{ username }} className="mention">{part}</Link>;
    }
    if (part.startsWith("```")) return <pre key={i} className="code-snippet my-2 block whitespace-pre-wrap text-sm">{part.replace(/```\w*\n?/g, "").trim()}</pre>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i} className="code-snippet">{part.slice(1, -1)}</code>;
    return <span key={i}>{part}</span>;
  });
}

interface Comment {
  id: string;
  body: string;
  user_id: string;
  created_at: string;
  profile?: { username: string; full_name: string; avatar_url: string | null };
}

export function PostCard({ post, onDelete }: { post: Post; onDelete?: (id: string) => void }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [reposted, setReposted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentsCount, setCommentsCount] = useState(post.replies_count || 0);
  const [postingComment, setPostingComment] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const isAuthor = user && user.id === post.user_id;

  useEffect(() => {
    supabase.from("profiles").select("username, full_name, avatar_url").eq("user_id", post.user_id).maybeSingle().then(({ data }) => {
      if (data) setProfile(data);
    });

    if (user) {
      supabase.from("likes").select("id").eq("user_id", user.id).eq("post_id", post.id).maybeSingle().then(({ data }) => {
        setLiked(!!data);
      });
      supabase.from("reposts").select("id").eq("user_id", user.id).eq("post_id", post.id).maybeSingle().then(({ data }) => {
        setReposted(!!data);
      });
    }
  }, [post.user_id, post.id, user?.id]);

  const handleDelete = async () => {
    if (!user || !isAuthor) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (!error) {
      setDeleted(true);
      onDelete?.(post.id);
      toast.success("Post deleted");
    } else {
      toast.error("Failed to delete post");
    }
    setShowMenu(false);
  };

  if (deleted) return null;

  const handleLike = async () => {
    if (!user) return;
    if (liked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", post.id);
      setLiked(false);
      setLikesCount(likesCount - 1);
      await supabase.from("posts").update({ likes_count: likesCount - 1 }).eq("id", post.id);
    } else {
      await supabase.from("likes").insert({ user_id: user.id, post_id: post.id });
      setLiked(true);
      setLikesCount(likesCount + 1);
      await supabase.from("posts").update({ likes_count: likesCount + 1 }).eq("id", post.id);
      if (user.id !== post.user_id) {
        await supabase.from("notifications").insert({ user_id: post.user_id, type: "like", from_user_id: user.id, post_id: post.id });
      }
    }
  };

  const handleRepost = async () => {
    if (!user) return;
    if (reposted) {
      await supabase.from("reposts").delete().eq("user_id", user.id).eq("post_id", post.id);
      setReposted(false);
    } else {
      await supabase.from("reposts").insert({ user_id: user.id, post_id: post.id });
      setReposted(true);
      if (user.id !== post.user_id) {
        await supabase.from("notifications").insert({ user_id: post.user_id, type: "repost", from_user_id: user.id, post_id: post.id });
      }
    }
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    if (data) {
      const userIds = [...new Set(data.map((c: any) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url")
        .in("user_id", userIds);
      const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
      setComments(data.map((c: any) => ({ ...c, profile: profileMap.get(c.user_id) })));
    }
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  };

  const handleComment = async () => {
    if (!user || !commentText.trim()) return;
    setPostingComment(true);
    const { data } = await supabase
      .from("comments")
      .insert({ post_id: post.id, user_id: user.id, body: commentText.trim() })
      .select()
      .single();
    if (data) {
      const newCount = commentsCount + 1;
      setCommentsCount(newCount);
      await supabase.from("posts").update({ replies_count: newCount }).eq("id", post.id);
      setCommentText("");
      loadComments();
      if (user.id !== post.user_id) {
        await supabase.from("notifications").insert({ user_id: post.user_id, type: "comment", from_user_id: user.id, post_id: post.id });
      }
    }
    setPostingComment(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (!error) {
      const newCount = Math.max(0, commentsCount - 1);
      setCommentsCount(newCount);
      await supabase.from("posts").update({ replies_count: newCount }).eq("id", post.id);
      setComments(comments.filter((c) => c.id !== commentId));
      toast.success("Comment deleted");
    }
  };

  const displayName = profile?.full_name || "User";
  const username = profile?.username || "user";

  return (
    <article className="border-b border-border px-4 py-3 transition-colors hover:bg-card/50">
      <div className="flex gap-3">
        <Link to="/u/$username" params={{ username }} className="shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              getInitials(displayName)
            )}
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link to="/u/$username" params={{ username }} className="truncate font-semibold text-foreground hover:underline">{displayName}</Link>
            <Link to="/u/$username" params={{ username }} className="truncate text-sm text-muted-foreground hover:underline">@{username}</Link>
            <span className="text-muted-foreground">·</span>
            <span className="shrink-0 text-sm text-muted-foreground">{formatTimeAgo(post.created_at)}</span>
            {isAuthor && (
              <div className="relative ml-auto">
                <button onClick={() => setShowMenu(!showMenu)} className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-border bg-card py-1 shadow-lg">
                      <button onClick={handleDelete} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-secondary">
                        <Trash2 className="h-3.5 w-3.5" /> Delete post
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
            {renderContent(post.content)}
          </div>

          {post.image_url && (
            <div className="mt-2">
              <img
                src={post.image_url}
                alt="Post image"
                className="max-h-80 w-full rounded-xl border border-border object-cover"
                loading="lazy"
              />
            </div>
          )}

          <div className="mt-3 flex items-center justify-between max-w-md">
            <button onClick={toggleComments} className="group flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{formatCount(commentsCount)}</span>
            </button>
            <button
              onClick={handleRepost}
              className={`group flex items-center gap-1.5 transition-colors ${reposted ? "text-green-500" : "text-muted-foreground hover:text-green-500"}`}
            >
              <Repeat2 className={`h-4 w-4 ${reposted ? "stroke-[2.5]" : ""}`} />
              {reposted && <span className="text-xs">✓</span>}
            </button>
            <button
              onClick={handleLike}
              className={`group flex items-center gap-1.5 transition-colors ${liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              <span className="text-xs">{formatCount(likesCount)}</span>
            </button>
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`group flex items-center gap-1.5 transition-colors ${bookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
            </button>
            <button className="text-muted-foreground transition-colors hover:text-primary">
              <Share className="h-4 w-4" />
            </button>
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="mt-3 border-t border-border pt-3">
              {comments.length > 0 && (
                <div className="space-y-2 mb-3">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <Link to="/u/$username" params={{ username: c.profile?.username || "user" }} className="shrink-0">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold text-primary overflow-hidden">
                          {c.profile?.avatar_url ? (
                            <img src={c.profile.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                          ) : (
                            getInitials(c.profile?.full_name || "U")
                          )}
                        </div>
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Link to="/u/$username" params={{ username: c.profile?.username || "user" }} className="text-xs font-semibold text-foreground hover:underline">{c.profile?.full_name || "User"}</Link>
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(c.created_at)}</span>
                          {user && user.id === c.user_id && (
                            <button onClick={() => handleDeleteComment(c.id)} className="ml-auto text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-foreground">{c.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {user && (
                <div className="flex gap-2">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={t("writeComment")}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleComment()}
                    className="flex-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    onClick={handleComment}
                    disabled={!commentText.trim() || postingComment}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
