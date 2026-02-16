"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function useAdmin() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  /* eslint-disable react-hooks/set-state-in-effect -- deriving admin status from session on auth change */
  useEffect(() => {
    if (status === "loading") {
      return;
    }
    if (status === "unauthenticated") {
      setLoading(false);
      setIsAdmin(false);
      return;
    }
    const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];
    const userId = session?.user?.id;
    if (userId && ADMIN_USER_IDS.includes(userId)) {
      setIsAdmin(true);
    }
    setLoading(false);
  }, [session, status]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return { isAdmin, loading };
}
