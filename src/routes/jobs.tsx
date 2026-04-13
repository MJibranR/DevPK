import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/devpk/AppLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { MapPin, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/jobs")({
  head: () => ({ meta: [{ title: "Jobs — DevPK" }] }),
  ssr: false,
  component: JobsPage,
});

function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company: "", title: "", description: "", type: "Full-time", city: "", stack: "", apply_url: "" });

  useEffect(() => {
    supabase.from("jobs").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setJobs(data || []);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const stackArr = form.stack.split(",").map((s) => s.trim()).filter(Boolean);
    const { data } = await supabase.from("jobs").insert({
      user_id: user.id,
      company: form.company,
      title: form.title,
      description: form.description,
      type: form.type,
      city: form.city,
      stack: stackArr,
      apply_url: form.apply_url,
    }).select().single();
    if (data) {
      setJobs([data, ...jobs]);
      setForm({ company: "", title: "", description: "", type: "Full-time", city: "", stack: "", apply_url: "" });
      setShowForm(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    const { error } = await supabase.from("jobs").delete().eq("id", jobId);
    if (!error) {
      setJobs(jobs.filter((j) => j.id !== jobId));
      toast.success("Job deleted");
    } else {
      toast.error("Failed to delete job");
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Jobs</h1>
          <p className="text-sm text-muted-foreground">Tech opportunities in Pakistan</p>
        </div>
        {user && <Button size="sm" onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "Post a job"}</Button>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border-b border-border p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Job title" required className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company" required className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          </div>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Job description" rows={3} className="w-full resize-none rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <div className="grid gap-3 sm:grid-cols-3">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
              <option>Full-time</option><option>Part-time</option><option>Internship</option><option>Freelance</option><option>Contract</option>
            </select>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City (or Remote)" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            <input value={form.apply_url} onChange={(e) => setForm({ ...form, apply_url: e.target.value })} placeholder="Apply URL" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          </div>
          <input value={form.stack} onChange={(e) => setForm({ ...form, stack: e.target.value })} placeholder="Tech stack (comma-separated)" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <Button type="submit" size="sm">Post job</Button>
        </form>
      )}

      {loading ? <p className="p-8 text-center text-sm text-muted-foreground">Loading...</p> : (
        <div className="divide-y divide-border">
          {jobs.map((job) => (
            <div key={job.id} className="p-4 transition-colors hover:bg-card/50">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    job.type === "Full-time" ? "bg-primary/10 text-primary" :
                    job.type === "Internship" ? "bg-chart-2/20 text-chart-2" :
                    "bg-chart-5/20 text-chart-5"
                  }`}>{job.type}</span>
                  {user && user.id === job.user_id && (
                    <button onClick={() => handleDelete(job.id)} className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              {job.description && <p className="mt-2 text-sm text-muted-foreground">{job.description}</p>}
              <div className="mt-3 flex items-center gap-3">
                {job.city && <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {job.city}</span>}
                <div className="flex flex-wrap gap-1.5">
                  {job.stack?.map((tech: string) => (
                    <span key={tech} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{tech}</span>
                  ))}
                </div>
              </div>
              {job.apply_url && (
                <div className="mt-3">
                  <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs">Apply <ExternalLink className="h-3 w-3" /></Button>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
