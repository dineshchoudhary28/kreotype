"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

function UsernameGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "authenticated" || !session) return;

    if (
      session.needsUsername &&
      pathname !== "/complete-profile" &&
      !pathname.startsWith("/api/")
    ) {
      router.push("/complete-profile");
    }
  }, [session, status, pathname, router]);

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UsernameGuard>{children}</UsernameGuard>
    </SessionProvider>
  );
}
