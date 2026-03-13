import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { getOptionalUser } from "@/lib/auth";

export default async function SignupPage() {
  const user = await getOptionalUser();

  if (user) {
    redirect("/app/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <Suspense>
          <AuthCard mode="signup" />
        </Suspense>
      </div>
    </main>
  );
}
