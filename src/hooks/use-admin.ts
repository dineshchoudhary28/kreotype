"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function useAdmin() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    if (status === "unauthenticated") {
      setLoading(false);
      setIsAdmin(false);
      return;
    }
    // This is a placeholder for a real admin check.
    // In a real application, you would have a more robust way of determining admin status.
    const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];
    const userId = session?.user?.id;
    if (userId && ADMIN_USER_IDS.includes(userId)) {
      setIsAdmin(true);
    }
    setLoading(false);
  }, [session, status]);

  return { isAdmin, loading };
}
