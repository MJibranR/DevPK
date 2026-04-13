import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/devpk/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { CommunityCard } from "@/components/devpk/CommunityCard";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/communities")({
  head: () => ({
    meta: [{ title: "Communities — DevPK" }, { name: "description", content: "Join tech communities in Pakistan." }],
  }),
  ssr: false,
  component: CommunitiesPage,
});

const EMOJI_OPTIONS = ["🌐", "🤖", "💼", "🎨", "🏙️", "🎓", "🔒", "📱", "⚡", "🚀", "💡", "🔥", "🎯", "🛠️", "📊"];

function CommunitiesPage() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", icon: "🌐" });

  useEffect(() => {
    supabase.from("communities").select("*").order("member_count", { ascending: false }).then(({ data }) => {
      setCommunities(data || []);
      setLoading(false);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);

    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const { data, error } = await supabase.from("communities").insert({
      name: form.name,
      slug,
      description: form.description,
      icon: form.icon,
      creator_id: user.id,
      member_count: 1,
    }).select().single();

    if (error) {
      toast.error(error.message.includes("duplicate") ? "A community with this slug already exists" : error.message);
    } else if (data) {
      await supabase.from("community_members").insert({ user_id: user.id, community_id: data.id });
      setCommunities([data, ...communities]);
      setForm({ name: "", slug: "", description: "", icon: "🌐" });
      setShowForm(false);
      toast.success("Community created!");
    }
    setCreating(false);
  };

  const handleDelete = async (communityId: string) => {
    // Delete members first, then community
    await supabase.from("community_members").delete().eq("community_id", communityId);
    const { error } = await supabase.from("communities").delete().eq("id", communityId);
    if (!error) {
      setCommunities(communities.filter((c) => c.id !== communityId));
      toast.success("Community deleted");
    } else {
      toast.error("Failed to delete community");
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Communities</h1>
          <p className="text-sm text-muted-foreground">Find your people</p>
        </div>
        {user && (
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
            {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showForm ? "Cancel" : "Create"}
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="border-b border-border p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setForm({ ...form, icon: emoji })}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-colors ${form.icon === emoji ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary hover:bg-secondary/80"}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Community name"
            required
            className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
            placeholder="URL slug (auto-generated if empty)"
            className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What is this community about?"
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <Button type="submit" size="sm" disabled={creating || !form.name.trim()}>
            {creating ? "Creating..." : "Create community"}
          </Button>
        </form>
      )}

      {loading ? (
        <p className="p-8 text-center text-sm text-muted-foreground">Loading...</p>
      ) : communities.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">No communities yet. Create one!</p>
      ) : (
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((c) => (
            <div key={c.id} className="relative">
              <CommunityCard community={c} />
              {user && user.id === c.creator_id && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="absolute top-2 right-2 rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 bg-card/80 backdrop-blur-sm transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
