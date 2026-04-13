import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/devpk/AppLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme, type Theme } from "@/hooks/useTheme";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Camera, Loader2, Sun, Moon, Sparkles, Languages, Save, Trash2 } from "lucide-react";
import { getInitials } from "@/lib/seed-data";
import { deleteAccountFn } from "@/lib/delete-account";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — DevPK" }] }),
  ssr: false,
  component: SettingsPage,
});

function SettingsPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    bio: "",
    role: "",
    university: "",
    location: "",
    stack: "",
    github_url: "",
    linkedin_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        role: profile.role || "",
        university: profile.university || "",
        location: profile.location || "",
        stack: profile.stack?.join(", ") || "",
        github_url: profile.github_url || "",
        linkedin_url: profile.linkedin_url || "",
      });
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  if (authLoading) return <AppLayout><div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div></AppLayout>;
  if (!user) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center p-12 gap-3">
        <p className="text-muted-foreground">Please sign in to access settings.</p>
        <Link to="/login"><Button>Log in</Button></Link>
      </div>
    </AppLayout>
  );

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar must be under 2MB");
      return;
    }
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Failed to upload avatar");
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    await supabase.from("profiles").update({ avatar_url: newUrl }).eq("user_id", user.id);
    setAvatarUrl(newUrl);
    setUploadingAvatar(false);
    toast.success("Avatar updated!");
    refreshProfile();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const stackArr = form.stack.split(",").map((s) => s.trim()).filter(Boolean);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      username: form.username,
      bio: form.bio,
      role: form.role,
      university: form.university,
      location: form.location,
      stack: stackArr,
      github_url: form.github_url,
      linkedin_url: form.linkedin_url,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated!");
      refreshProfile();
    }
  };

  if (authLoading) return <AppLayout><div className="flex items-center justify-center p-12 text-muted-foreground">Loading...</div></AppLayout>;
  if (!user) return null;

  const themeOptions: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "light", icon: Sun, label: "Light" },
    { value: "midnight", icon: Sparkles, label: "Midnight" },
  ];

  return (
    <AppLayout>
      <div className="border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold text-foreground">{t("settings")}</h1>
      </div>
      <div className="max-w-lg p-3 sm:p-4">
        {/* Language & Theme */}
        <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4 rounded-lg border border-border bg-card p-3 sm:p-4">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Languages className="h-4 w-4" /> {t("language")}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setLang("en")}
                className={`rounded-lg px-3 sm:px-4 py-2 text-sm font-medium transition-colors ${lang === "en" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                English
              </button>
              <button
                onClick={() => setLang("ur")}
                className={`rounded-lg px-3 sm:px-4 py-2 text-sm font-medium transition-colors ${lang === "ur" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                اردو
              </button>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">{t("theme")}</label>
            <div className="flex flex-wrap gap-2">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-2 text-sm font-medium transition-colors ${theme === opt.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                >
                  <opt.icon className="h-4 w-4" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Avatar section */}
        <div className="mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center overflow-hidden rounded-full bg-primary/20 text-lg sm:text-xl font-semibold text-primary">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover" />
              ) : (
                getInitials(form.full_name || form.username || "?")
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {uploadingAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{t("profilePicture")}</p>
            <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 2MB.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3 sm:space-y-4">
          <SettingsField label={t("displayName")} value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
          <SettingsField label={t("username")} value={form.username} onChange={(v) => setForm({ ...form, username: v })} />
          <div>
            <label className="block text-sm font-medium text-foreground">{t("bio")}</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              placeholder="Tell us about yourself..."
              className="mt-1 w-full resize-none rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <SettingsField label={t("role")} value={form.role} onChange={(v) => setForm({ ...form, role: v })} placeholder="e.g. Full-Stack Developer" />
          <SettingsField label={t("institute")} value={form.university} onChange={(v) => setForm({ ...form, university: v })} placeholder="e.g. LUMS, FAST-NUCES" />
          <SettingsField label={t("location")} value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="e.g. Lahore" />
          <SettingsField label={t("techStack")} value={form.stack} onChange={(v) => setForm({ ...form, stack: v })} placeholder="React, TypeScript, Node.js" />
          <SettingsField label="GitHub URL" value={form.github_url} onChange={(v) => setForm({ ...form, github_url: v })} type="url" placeholder="https://github.com/username" />
          <SettingsField label="LinkedIn URL" value={form.linkedin_url} onChange={(v) => setForm({ ...form, linkedin_url: v })} type="url" placeholder="https://linkedin.com/in/username" />
          <Button type="submit" disabled={saving} className="w-full sm:w-auto gap-1.5">
            <Save className="h-4 w-4" />
            {saving ? t("saving") : t("saveChanges")}
          </Button>
        </form>

        {/* Delete Account */}
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-3 sm:p-4">
          <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
          <p className="mt-1 text-xs text-muted-foreground">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <Button
            variant="destructive"
            size="sm"
            className="mt-3 gap-1.5"
            onClick={async () => {
              if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
              try {
                await deleteAccountFn();
                await supabase.auth.signOut();
                navigate({ to: "/" });
                toast.success("Account deleted.");
              } catch (err: any) {
                toast.error(err.message || "Failed to delete account");
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

function SettingsField({ label, value, onChange, type = "text", placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
    </div>
  );
}
