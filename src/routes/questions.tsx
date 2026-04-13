import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/devpk/AppLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle, ArrowUp, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/questions")({
  head: () => ({
    meta: [{ title: "Q&A — DevPK" }],
  }),
  ssr: false,
  component: QuestionsPage,
});

function QuestionsPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    supabase.from("questions").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setQuestions(data || []);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const tagArr = tags.split(",").map((t) => t.trim()).filter(Boolean);
    const { data } = await supabase.from("questions").insert({
      user_id: user.id,
      title,
      body,
      tags: tagArr,
    }).select().single();
    if (data) {
      setQuestions([data, ...questions]);
      setTitle("");
      setBody("");
      setTags("");
      setShowForm(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, qId: string) => {
    e.preventDefault();
    e.stopPropagation();
    await supabase.from("answers").delete().eq("question_id", qId);
    const { error } = await supabase.from("questions").delete().eq("id", qId);
    if (!error) {
      setQuestions(questions.filter((q) => q.id !== qId));
      toast.success("Question deleted");
    } else {
      toast.error("Failed to delete");
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Q&A</h1>
          <p className="text-sm text-muted-foreground">Ask the community</p>
        </div>
        {user && <Button size="sm" onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "Ask a question"}</Button>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border-b border-border p-4 space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Question title" required className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Describe your question in detail..." rows={4} className="w-full resize-none rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma-separated, e.g. react, typescript)" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <Button type="submit" size="sm">Post question</Button>
        </form>
      )}

      {loading ? (
        <p className="p-8 text-center text-sm text-muted-foreground">Loading...</p>
      ) : questions.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">No questions yet. Be the first to ask!</p>
      ) : (
        <div className="divide-y divide-border">
          {questions.map((q) => (
            <Link key={q.id} to="/questions/$id" params={{ id: q.id }} className="flex gap-4 p-4 transition-colors hover:bg-card/50">
              <div className="flex flex-col items-center gap-1 text-center">
                <ArrowUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{q.upvotes || 0}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-foreground leading-snug">{q.title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {q.tags?.map((tag: string) => (
                    <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{tag}</span>
                  ))}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageCircle className="h-3 w-3" /> {q.answers_count || 0} answers
                  </span>
                </div>
              </div>
              {user && user.id === q.user_id && (
                <button onClick={(e) => handleDelete(e, q.id)} className="shrink-0 self-start rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
