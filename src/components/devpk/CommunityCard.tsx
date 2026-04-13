import { Button } from "@/components/ui/button";
import { useState } from "react";
import { formatCount } from "@/lib/seed-data";
import { Link } from "@tanstack/react-router";

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  member_count: number | null;
}

export function CommunityCard({ community }: { community: Community }) {
  return (
    <Link to="/c/$slug" params={{ slug: community.slug }} className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{community.icon || "📁"}</span>
          <div>
            <h3 className="font-semibold text-foreground">{community.name}</h3>
            <p className="text-xs text-muted-foreground">{formatCount(community.member_count || 0)} members</p>
          </div>
        </div>
      </div>
      {community.description && <p className="mt-2 text-sm text-muted-foreground">{community.description}</p>}
    </Link>
  );
}
