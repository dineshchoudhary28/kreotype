"use client";

import { useState, useEffect } from "react";
import { type IUser } from "@/server/models/User";

interface UserDataState {
  user: IUser | null;
  isLoading: boolean;
  error: Error | null;
}

export function useUserData(): UserDataState {
  const [state, setState] = useState<UserDataState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("/api/users/me");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setState({ user: data.user, isLoading: false, error: null });
      } catch (error) {
        setState({ user: null, isLoading: false, error: error as Error });
      }
    }

    fetchUserData();
  }, []);

  return state;
}
