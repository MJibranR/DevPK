import { Image, Hash, Code, Send, X, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { getInitials } from "@/lib/seed-data";

interface MentionSuggestion {
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
}

export function PostComposer({ onPost, communityId }: { onPost?: (post: any) => void; communityId?: string }) {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mention autocomplete state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion[]>([]);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Detect @mention typing
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setMentionStart(cursorPos - mentionMatch[0].length);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
      setMentionSuggestions([]);
    }
  };

  // Search users for mention
  useEffect(() => {
    if (mentionQuery === null || mentionQuery.length === 0) {
      setMentionSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url")
        .or(`username.ilike.%${mentionQuery}%,full_name.ilike.%${mentionQuery}%`)
        .limit(5);
      setMentionSuggestions(data || []);
    }, 200);

    return () => clearTimeout(timer);
  }, [mentionQuery]);

  const insertMention = useCallback((suggestion: MentionSuggestion) => {
    const before = content.slice(0, mentionStart);
    const after = content.slice(mentionStart + (mentionQuery?.length || 0) + 1); // +1 for @
    const newContent = `${before}@${suggestion.username} ${after}`;
    setContent(newContent);
    setMentionQuery(null);
    setMentionSuggestions([]);
    textareaRef.current?.focus();
  }, [content, mentionStart, mentionQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((i) => Math.min(i + 1, mentionSuggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(mentionSuggestions[mentionIndex]);
      } else if (e.key === "Escape") {
        setMentionQuery(null);
        setMentionSuggestions([]);
      }
    }
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.slice(0, start) + text + content.slice(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handlePost = async () => {
    if (!user || (!content.trim() && !imageFile)) return;
    setPosting(true);

    let image_url: string | null = null;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(path, imageFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);
        image_url = urlData.publicUrl;
      }
    }

    const hashtags = content.match(/#(\w+)/g)?.map((h) => h.slice(1)) || [];

    const { data, error } = await supabase.from("posts").insert({
      user_id: user.id,
      content: content.trim(),
      hashtags,
      image_url,
      ...(communityId ? { community_id: communityId } : {}),
    }).select().single();

    if (data && !error) {
      // Send mention notifications
      const mentions = content.match(/@(\w+)/g)?.map((m) => m.slice(1)) || [];
      if (mentions.length > 0) {
        const { data: mentionedUsers } = await supabase
          .from("profiles")
          .select("user_id")
          .in("username", mentions);
        if (mentionedUsers) {
          const notifications = mentionedUsers
            .filter((u) => u.user_id !== user.id)
            .map((u) => ({
              user_id: u.user_id,
              type: "mention",
              from_user_id: user.id,
              post_id: data.id,
            }));
          if (notifications.length > 0) {
            await supabase.from("notifications").insert(notifications);
          }
        }
      }

      onPost?.(data);
      setContent("");
      removeImage();
    }
    setPosting(false);
  };

  if (!user) return null;

  return (
    <div className="border-b border-border p-4">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            getInitials(profile?.full_name || profile?.username || "?")
          )}
        </div>
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder={t("whatsOnYourMind")}
            className="w-full resize-none border-none bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            rows={3}
            maxLength={500}
          />

          {/* Mention autocomplete dropdown */}
          {mentionSuggestions.length > 0 && (
            <div className="absolute left-0 z-50 mt-1 w-64 rounded-lg border border-border bg-popover shadow-lg">
              {mentionSuggestions.map((s, i) => (
                <button
                  key={s.user_id}
                  onClick={() => insertMention(s)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${i === mentionIndex ? "bg-accent text-accent-foreground" : "text-popover-foreground hover:bg-accent/50"}`}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold text-primary overflow-hidden">
                    {s.avatar_url ? (
                      <img src={s.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      getInitials(s.full_name || s.username)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{s.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">@{s.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {imagePreview && (
            <div className="relative mt-2 inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-48 rounded-lg border border-border object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute -right-2 -top-2 rounded-full bg-background border border-border p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleImageSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                title="Add image"
              >
                <Image className="h-4 w-4" />
              </button>
              <button
                onClick={() => insertAtCursor("#")}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                title="Add hashtag"
              >
                <Hash className="h-4 w-4" />
              </button>
              <button
                onClick={() => insertAtCursor("@")}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                title="Mention someone"
              >
                <AtSign className="h-4 w-4" />
              </button>
              <button
                onClick={() => insertAtCursor("```\n\n```")}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                title="Add code block"
              >
                <Code className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              {content.length > 0 && (
                <span className={`text-xs ${content.length > 450 ? "text-destructive" : "text-muted-foreground"}`}>
                  {content.length}/500
                </span>
              )}
              <Button size="sm" disabled={(content.trim().length === 0 && !imageFile) || posting} onClick={handlePost} className="gap-1.5">
                <Send className="h-3.5 w-3.5" />
                {posting ? t("posting") : t("post")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
