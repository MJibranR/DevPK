import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/devpk/AppLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { getInitials, formatTimeAgo } from "@/lib/seed-data";
import { ArrowUp, Check, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/questions/$id")({
  head: () => ({ meta: [{ title: "Question — DevPK" }] }),
  ssr: false,
  component: QuestionDetailPage,
});

function QuestionDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState<any>(null);
  const [questionAuthor, setQuestionAuthor] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [answerBody, setAnswerBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isAuthor = user && question && user.id === question.user_id;

  useEffect(() => {
    const load = async () => {
      const { data: q } = await supabase.from("questions").select("*").eq("id", id).single();
      if (q) {
        setQuestion(q);
        const { data: authorProfile } = await supabase
          .from("profiles")
          .select("username, full_name, avatar_url")
          .eq("user_id", q.user_id)
          .maybeSingle();
        setQuestionAuthor(authorProfile);

        const { data: a } = await supabase
          .from("answers")
          .select("*")
          .eq("question_id", q.id)
          .order("is_best_answer", { ascending: false })
          .order("upvotes", { ascending: false });

        if (a) {
          const userIds = [...new Set(a.map((ans: any) => ans.user_id))];
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, username, full_name, avatar_url")
            .in("user_id", userIds);
          const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
          setAnswers(a.map((ans: any) => ({ ...ans, profile: profileMap.get(ans.user_id) })));
        }
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleDeleteQuestion = async () => {
    if (!isAuthor) return;
    // Delete answers first, then question
    await supabase.from("answers").delete().eq("question_id", question.id);
    const { error } = await supabase.from("questions").delete().eq("id", question.id);
    if (!error) {
      toast.success("Question deleted");
      navigate({ to: "/questions" });
    } else {
      toast.error("Failed to delete question");
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    const { error } = await supabase.from("answers").delete().eq("id", answerId);
    if (!error) {
      setAnswers(answers.filter((a) => a.id !== answerId));
      const newCount = Math.max(0, (question.answers_count || 0) - 1);
      await supabase.from("questions").update({ answers_count: newCount }).eq("id", question.id);
      setQuestion({ ...question, answers_count: newCount });
      toast.success("Answer deleted");
    }
  };

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !question || !answerBody.trim()) return;
    setSubmitting(true);

    const { data } = await supabase.from("answers").insert({
      question_id: question.id,
      user_id: user.id,
      body: answerBody.trim(),
    }).select().single();

    if (data) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      setAnswers([...answers, { ...data, profile }]);
      setAnswerBody("");
      const newCount = (question.answers_count || 0) + 1;
      await supabase.from("questions").update({ answers_count: newCount }).eq("id", question.id);
      setQuestion({ ...question, answers_count: newCount });
      if (user.id !== question.user_id) {
        await supabase.from("notifications").insert({ user_id: question.user_id, type: "answer", from_user_id: user.id, question_id: question.id });
      }
    }
    setSubmitting(false);
  };

  const handleUpvote = async (answerId: string, current: number) => {
    await supabase.from("answers").update({ upvotes: current + 1 }).eq("id", answerId);
    setAnswers(answers.map((a) => a.id === answerId ? { ...a, upvotes: current + 1 } : a));
  };

  const markBest = async (answerId: string) => {
    await supabase.from("answers").update({ is_best_answer: false }).eq("question_id", question.id);
    await supabase.from("answers").update({ is_best_answer: true }).eq("id", answerId);
    setAnswers(answers.map((a) => ({ ...a, is_best_answer: a.id === answerId })));
  };

  if (loading) return <AppLayout><p className="p-12 text-center text-muted-foreground">Loading...</p></AppLayout>;
  if (!question) return <AppLayout><p className="p-12 text-center text-muted-foreground">Question not found</p></AppLayout>;

  return (
    <AppLayout>
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <Link to="/questions" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Q&A
          </Link>
          {isAuthor && (
            <button onClick={handleDeleteQuestion} className="flex items-center gap-1.5 text-xs text-destructive hover:underline">
              <Trash2 className="h-3.5 w-3.5" /> Delete question
            </button>
          )}
        </div>
        <h1 className="text-lg font-bold text-foreground leading-snug">{question.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {question.tags?.map((t: string) => (
            <span key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">{t}</span>
          ))}
        </div>
        {question.body && (
          <div className="mt-3 whitespace-pre-wrap text-sm text-foreground leading-relaxed">{question.body}</div>
        )}
        <div className="mt-3 flex items-center gap-3">
          {questionAuthor && (
            <Link to="/u/$username" params={{ username: questionAuthor.username }} className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold text-primary overflow-hidden">
                {questionAuthor.avatar_url ? (
                  <img src={questionAuthor.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  getInitials(questionAuthor.full_name || "U")
                )}
              </div>
              <span className="text-xs font-medium text-foreground hover:underline">{questionAuthor.full_name}</span>
            </Link>
          )}
          <span className="text-xs text-muted-foreground">· {formatTimeAgo(question.created_at)}</span>
          <span className="text-xs text-muted-foreground">· {question.upvotes || 0} upvotes</span>
        </div>
      </div>

      <div className="border-b border-border px-4 py-2.5 bg-card/50">
        <h2 className="text-sm font-semibold text-foreground">{answers.length} {answers.length === 1 ? "Answer" : "Answers"}</h2>
      </div>

      {answers.length === 0 && (
        <p className="p-6 text-center text-sm text-muted-foreground">No answers yet. Be the first to help!</p>
      )}

      {answers.map((a) => (
        <div key={a.id} className={`border-b border-border p-4 ${a.is_best_answer ? "bg-primary/5" : ""}`}>
          <div className="flex gap-3">
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => handleUpvote(a.id, a.upvotes || 0)} className="rounded-md p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <ArrowUp className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-foreground">{a.upvotes || 0}</span>
              {a.is_best_answer && (
                <div className="flex items-center gap-0.5 text-primary" title="Best answer">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{a.body}</p>
              <div className="mt-3 flex items-center gap-2">
                {a.profile && (
                  <Link to="/u/$username" params={{ username: a.profile.username }} className="flex items-center gap-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[9px] font-semibold text-primary overflow-hidden">
                      {a.profile.avatar_url ? (
                        <img src={a.profile.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                      ) : (
                        getInitials(a.profile.full_name || "U")
                      )}
                    </div>
                    <span className="text-xs font-medium text-foreground hover:underline">{a.profile.full_name}</span>
                  </Link>
                )}
                <span className="text-xs text-muted-foreground">· {formatTimeAgo(a.created_at)}</span>
                {isAuthor && !a.is_best_answer && (
                  <button onClick={() => markBest(a.id)} className="text-xs text-primary hover:underline ml-auto">✓ Mark as best</button>
                )}
                {a.is_best_answer && (
                  <span className="text-xs font-medium text-primary ml-auto">Best Answer</span>
                )}
                {user && user.id === a.user_id && (
                  <button onClick={() => handleDeleteAnswer(a.id)} className="text-muted-foreground hover:text-destructive ml-2">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {user ? (
        <form onSubmit={submitAnswer} className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Your Answer</h3>
          <textarea
            value={answerBody}
            onChange={(e) => setAnswerBody(e.target.value)}
            placeholder="Share your knowledge..."
            rows={5}
            required
            className="w-full resize-none rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <Button type="submit" size="sm" disabled={submitting || !answerBody.trim()}>
            {submitting ? "Posting..." : "Post answer"}
          </Button>
        </form>
      ) : (
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">Log in</Link> to answer this question
          </p>
        </div>
      )}
    </AppLayout>
  );
}
