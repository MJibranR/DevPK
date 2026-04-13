import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const deleteAccountFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    // Delete profile and related data
    await supabaseAdmin.from("profiles").delete().eq("user_id", userId);
    await supabaseAdmin.from("posts").delete().eq("user_id", userId);
    await supabaseAdmin.from("comments").delete().eq("user_id", userId);
    await supabaseAdmin.from("likes").delete().eq("user_id", userId);
    await supabaseAdmin.from("reposts").delete().eq("user_id", userId);
    await supabaseAdmin.from("follows").delete().or(`follower_id.eq.${userId},following_id.eq.${userId}`);
    await supabaseAdmin.from("notifications").delete().or(`user_id.eq.${userId},from_user_id.eq.${userId}`);
    await supabaseAdmin.from("projects").delete().eq("user_id", userId);
    await supabaseAdmin.from("questions").delete().eq("user_id", userId);
    await supabaseAdmin.from("answers").delete().eq("user_id", userId);
    await supabaseAdmin.from("jobs").delete().eq("user_id", userId);

    // Delete auth user
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);

    return { success: true };
  });
