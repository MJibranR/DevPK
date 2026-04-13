import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  role: string;
  university: string;
  location: string;
  stack: string[];
  github_url: string;
  linkedin_url: string;
  followers_count: number;
  following_count: number;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

const normalizeUsername = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);

const getBaseUsername = (authUser: User) => {
  const metadataUsername = typeof authUser.user_metadata?.username === "string" ? authUser.user_metadata.username : "";
  const emailUsername = authUser.email?.split("@")[0] ?? "user";
  return normalizeUsername(metadataUsername || emailUsername) || `user${authUser.id.replace(/-/g, "").slice(0, 8)}`;
};

const getDisplayName = (authUser: User) => {
  const metadataFullName = typeof authUser.user_metadata?.full_name === "string" ? authUser.user_metadata.full_name.trim() : "";
  return metadataFullName || authUser.email?.split("@")[0] || "User";
};

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreateProfile = useCallback(async (authUser: User) => {
    setLoading(true);

    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (existingProfile) {
        setProfile(existingProfile as Profile);
        return existingProfile as Profile;
      }

      const baseUsername = getBaseUsername(authUser);
      const fullName = getDisplayName(authUser);

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const candidateUsername = attempt === 0 ? baseUsername : `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;

        const { data: createdProfile, error } = await supabase
          .from("profiles")
          .insert({
            user_id: authUser.id,
            username: candidateUsername,
            full_name: fullName,
          })
          .select("*")
          .maybeSingle();

        if (!error && createdProfile) {
          setProfile(createdProfile as Profile);
          return createdProfile as Profile;
        }

        if (error?.code !== "23505") {
          break;
        }
      }

      const { data: retryProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle();

      setProfile((retryProfile as Profile) ?? null);
      return (retryProfile as Profile) ?? null;
    } catch {
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();

    if (currentSession?.user) {
      await fetchOrCreateProfile(currentSession.user);
      return;
    }

    setProfile(null);
  }, [fetchOrCreateProfile]);

  useEffect(() => {
    const syncAuthState = async (nextSession: Session | null) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        await fetchOrCreateProfile(nextSession.user);
      } else {
        setProfile(null);
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncAuthState(nextSession);
    });

    void supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      void syncAuthState(currentSession);
    });

    return () => subscription.unsubscribe();
  }, [fetchOrCreateProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
