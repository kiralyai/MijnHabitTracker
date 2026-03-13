"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LogoutButton({
  className,
  variant = "outline",
}: {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      className={className}
      disabled={pending}
      type="button"
      variant={variant}
      onClick={async () => {
        const supabase = createSupabaseBrowserClient();

        if (!supabase) {
          toast.error("Supabase is not configured.");
          return;
        }

        setPending(true);

        try {
          const { error } = await supabase.auth.signOut();

          if (error) {
            throw error;
          }

          router.push("/login");
          router.refresh();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Unable to sign out.");
        } finally {
          setPending(false);
        }
      }}
    >
      <LogOut />
      {pending ? "Signing out..." : "Log out"}
    </Button>
  );
}
