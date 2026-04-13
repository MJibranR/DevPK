import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

let channelCounter = 0;

export function useNotificationCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchCount = async () => {
      try {
        const { count: c } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false);
        setCount(c || 0);
      } catch {
        // Ignore fetch errors
      }
    };

    fetchCount();

    // Subscribe to realtime with error handling
    try {
      channelCounter++;
      const channelName = `notif-${user.id}-${channelCounter}`;
      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          () => {
            setCount((prev) => prev + 1);
          }
        )
        .subscribe();

      channelRef.current = channel;
    } catch {
      // Silently handle realtime subscription errors
    }

    return () => {
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch {
          // Ignore cleanup errors
        }
        channelRef.current = null;
      }
    };
  }, [user?.id]);

  return count;
}
