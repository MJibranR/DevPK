import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/devpk/AppLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { getInitials, formatCount } from "@/lib/seed-data";
import { Heart, ExternalLink, Github, Code2 } from "lucide-react";

export const Route = createFileRoute("/showcase")({
  head: () => ({ meta: [{ title: "Showcase — DevPK" }] }),
  ssr: false,
  component: ShowcasePage,
});

function ShowcasePage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", live_url: "", github_url: "", stack: "", cover_image: "" });

  useEffect(() => {
    supabase.from("projects").select("*").order("created_at", { ascending: false }).then(async ({ data }) => {
      if (data) {
        const userIds = [...new Set(data.map((p: any) => p.user_id))];
        const { data: profiles } = await supabase.from("profiles").select("user_id, username, full_name").in("user_id", userIds);
        const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
        const enriched = data.map((p: any) => ({ ...p, profiles: profileMap.get(p.user_id) }));
        setProjects(enriched);
      } else {
        setProjects([]);
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const stackArr = form.stack.split(",").map((s) => s.trim()).filter(Boolean);
    const { data, error } = await supabase.from("projects").insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      live_url: form.live_url,
      github_url: form.github_url,
      stack: stackArr,
      cover_image: form.cover_image,
    }).select().single();
    if (data && !error) {
      const { data: profileData } = await supabase.from("profiles").select("user_id, username, full_name").eq("user_id", user.id).maybeSingle();
      const enriched = { ...data, profiles: profileData };
      setProjects([enriched, ...projects]);
      setForm({ title: "", description: "", live_url: "", github_url: "", stack: "", cover_image: "" });
      setShowForm(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Showcase</h1>
          <p className="text-sm text-muted-foreground">Projects from the community</p>
        </div>
        {user && <Button size="sm" onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "Add project"}</Button>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border-b border-border p-4 space-y-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Project title" required className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full resize-none rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={form.live_url} onChange={(e) => setForm({ ...form, live_url: e.target.value })} placeholder="Live URL" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            <input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} placeholder="GitHub URL" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          </div>
          <input value={form.stack} onChange={(e) => setForm({ ...form, stack: e.target.value })} placeholder="Tech stack (comma-separated)" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <Button type="submit" size="sm">Submit project</Button>
        </form>
      )}

      {loading ? <p className="p-8 text-center text-sm text-muted-foreground">Loading...</p> : (
        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/30">
              <div className="flex h-36 items-center justify-center bg-secondary">
                {project.cover_image ? (
                  <img src={project.cover_image} alt={project.title} className="h-full w-full object-cover" />
                ) : (
                  <Code2 className="h-12 w-12 text-muted-foreground/30" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground">{project.title}</h3>
                {project.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{project.description}</p>}
                {project.profiles && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold text-primary">
                      {getInitials(project.profiles.full_name)}
                    </div>
                    <span className="text-xs text-muted-foreground">{project.profiles.full_name}</span>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.stack?.map((tech: string) => (
                    <span key={tech} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{tech}</span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Heart className="h-3.5 w-3.5" />
                    <span className="text-xs">{formatCount(project.likes_count || 0)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.live_url && <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary"><ExternalLink className="h-4 w-4" /></a>}
                    {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary"><Github className="h-4 w-4" /></a>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
