import { Search, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getInitials } from "@/lib/seed-data";
import { Link } from "@tanstack/react-router";

interface SearchResult {
  type: "user" | "post" | "job";
  id: string;
  title: string;
  subtitle: string;
  link: string;
}

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setSearching(true);
    setOpen(true);

    const pattern = `%${q}%`;
    const [usersRes, postsRes, jobsRes] = await Promise.all([
      supabase.from("profiles").select("username, full_name, role").ilike("full_name", pattern).limit(3),
      supabase.from("posts").select("id, content").ilike("content", pattern).limit(3),
      supabase.from("jobs").select("id, title, company").ilike("title", pattern).limit(3),
    ]);

    const r: SearchResult[] = [];
    usersRes.data?.forEach((u) => r.push({ type: "user", id: u.username, title: u.full_name, subtitle: `@${u.username} · ${u.role || "Developer"}`, link: `/u/${u.username}` }));
    postsRes.data?.forEach((p) => r.push({ type: "post", id: p.id, title: p.content.slice(0, 80) + "...", subtitle: "Post", link: "/feed" }));
    jobsRes.data?.forEach((j) => r.push({ type: "job", id: j.id, title: j.title, subtitle: j.company, link: "/jobs" }));
    setResults(r);
    setSearching(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Search DevPK..."
          className={`w-full rounded-lg border border-border bg-secondary pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none ${compact ? "py-1.5" : "py-2.5"}`}
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); setOpen(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-auto rounded-lg border border-border bg-card shadow-lg">
            {searching && <p className="p-3 text-sm text-muted-foreground">Searching...</p>}
            {!searching && results.length === 0 && <p className="p-3 text-sm text-muted-foreground">No results found</p>}
            {results.map((r) => (
              <Link
                key={`${r.type}-${r.id}`}
                to={r.link}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-secondary"
              >
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{r.type}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{r.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
