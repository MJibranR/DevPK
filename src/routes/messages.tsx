import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/devpk/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { formatTimeAgo, getInitials } from "@/lib/seed-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, MessageCircle, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — DevPK" }] }),
  ssr: false,
  component: MessagesPage,
});

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
  other_profile?: { username: string; full_name: string; avatar_url: string | null };
  last_message?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read: boolean;
  created_at: string;
}

function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (data) {
        const enriched = await Promise.all(
          data.map(async (c: any) => {
            const otherId = c.user1_id === user.id ? c.user2_id : c.user1_id;
            const { data: p } = await supabase.from("profiles").select("username, full_name, avatar_url").eq("user_id", otherId).single();
            const { data: lastMsg } = await supabase.from("messages").select("body").eq("conversation_id", c.id).order("created_at", { ascending: false }).limit(1).single();
            return { ...c, other_profile: p, last_message: lastMsg?.body };
          })
        );
        setConversations(enriched);
      }
      setLoading(false);
    };
    load();
  }, [user?.id]);

  useEffect(() => {
    if (!activeConvo) return;
    const load = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConvo.id)
        .order("created_at", { ascending: true });
      setMessages(data || []);
      if (user) {
        await supabase.from("messages").update({ read: true }).eq("conversation_id", activeConvo.id).neq("sender_id", user.id).eq("read", false);
      }
    };
    load();

    const channel = supabase
      .channel(`chat-${activeConvo.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeConvo.id}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConvo?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url")
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .neq("user_id", user?.id || "")
        .limit(10);
      setSearchResults(data || []);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const startConversation = async (otherUserId: string) => {
    if (!user) return;
    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
      .maybeSingle();

    if (existing) {
      const otherId = existing.user1_id === user.id ? existing.user2_id : existing.user1_id;
      const { data: p } = await supabase.from("profiles").select("username, full_name, avatar_url").eq("user_id", otherId).single();
      setActiveConvo({ ...existing, other_profile: p || undefined });
    } else {
      const { data: newConvo } = await supabase
        .from("conversations")
        .insert({ user1_id: user.id, user2_id: otherUserId })
        .select()
        .single();
      if (newConvo) {
        const { data: p } = await supabase.from("profiles").select("username, full_name, avatar_url").eq("user_id", otherUserId).single();
        const enriched = { ...newConvo, other_profile: p || undefined };
        setActiveConvo(enriched);
        setConversations((prev) => [enriched, ...prev]);
      }
    }
    setShowSearch(false);
    setSearchQuery("");
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeConvo || !user) return;
    const body = newMsg.trim();
    setNewMsg("");
    await supabase.from("messages").insert({ conversation_id: activeConvo.id, sender_id: user.id, body });
    await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", activeConvo.id);
  };

  const deleteMessage = async (msgId: string) => {
    const { error } = await supabase.from("messages").delete().eq("id", msgId);
    if (!error) {
      setMessages(messages.filter((m) => m.id !== msgId));
      toast.success("Message deleted");
    }
  };

  const deleteConversation = async (convoId: string) => {
    await supabase.from("messages").delete().eq("conversation_id", convoId);
    const { error } = await supabase.from("conversations").delete().eq("id", convoId);
    if (!error) {
      setConversations(conversations.filter((c) => c.id !== convoId));
      if (activeConvo?.id === convoId) setActiveConvo(null);
      toast.success("Conversation deleted");
    }
  };

  if (!user) {
    return <AppLayout><div className="p-8 text-center text-muted-foreground">Please log in to use messages.</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-56px)] lg:h-screen flex-col">
        {activeConvo ? (
          <>
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <button onClick={() => setActiveConvo(null)} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary overflow-hidden">
                {activeConvo.other_profile?.avatar_url ? (
                  <img src={activeConvo.other_profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : getInitials(activeConvo.other_profile?.full_name || "?")}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{activeConvo.other_profile?.full_name}</p>
                <p className="text-xs text-muted-foreground">@{activeConvo.other_profile?.username}</p>
              </div>
              <button onClick={() => deleteConversation(activeConvo.id)} className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`group flex ${m.sender_id === user.id ? "justify-end" : "justify-start"}`}>
                  <div className="relative">
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${m.sender_id === user.id ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}>
                      <p>{m.body}</p>
                      <p className={`mt-1 text-[10px] ${m.sender_id === user.id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{formatTimeAgo(m.created_at)}</p>
                    </div>
                    {m.sender_id === user.id && (
                      <button onClick={() => deleteMessage(m.id)} className="absolute -top-2 -right-2 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="border-t border-border p-3">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                <Input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Type a message..." className="flex-1" />
                <Button type="submit" size="icon" disabled={!newMsg.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h1 className="text-lg font-semibold text-foreground">Messages</h1>
              <Button variant="outline" size="sm" onClick={() => setShowSearch(!showSearch)} className="gap-1.5">
                <Search className="h-3.5 w-3.5" /> New chat
              </Button>
            </div>
            {showSearch && (
              <div className="border-b border-border p-3">
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search users..." autoFocus />
                {searchResults.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {searchResults.map((u) => (
                      <button key={u.user_id} onClick={() => startConversation(u.user_id)} className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-card">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary overflow-hidden">
                          {u.avatar_url ? <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" /> : getInitials(u.full_name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{u.full_name}</p>
                          <p className="text-xs text-muted-foreground">@{u.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {loading ? (
              <p className="p-8 text-center text-sm text-muted-foreground">Loading...</p>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-sm text-muted-foreground">No conversations yet</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowSearch(true)}>Start a conversation</Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {conversations.map((c) => (
                  <div key={c.id} className="group flex items-center">
                    <button onClick={() => setActiveConvo(c)} className="flex flex-1 items-center gap-3 p-4 text-left transition-colors hover:bg-card/50">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary overflow-hidden">
                        {c.other_profile?.avatar_url ? <img src={c.other_profile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" /> : getInitials(c.other_profile?.full_name || "?")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-foreground">{c.other_profile?.full_name}</p>
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(c.last_message_at)}</span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{c.last_message || "No messages yet"}</p>
                      </div>
                    </button>
                    <button onClick={() => deleteConversation(c.id)} className="hidden group-hover:flex mr-3 rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
