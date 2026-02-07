"use client";

import { useSession } from "next-auth/react";
import { useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { CompletedEvent } from "@/lib/db/schemas/result";
import { useTypingTestStore } from "@/store/useTypingTestStore";

export function LocalResultSyncer() {
  const { status } = useSession();
  const hasCheckedRef = useRef(false);
  const setIsSyncing = useTypingTestStore((s) => s.setIsSyncing);

  const syncResults = useCallback(async (results: CompletedEvent[]) => {
    setIsSyncing(true);
    toast.promise(
      (async () => {
        let successCount = 0;
        for (const result of results) {
          try {
            const res = await fetch("/api/results", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(result),
            });
            if (res.ok) successCount++;
          } catch (err) {
            console.error("Failed to sync a result:", err);
          }
        }
        
        if (successCount > 0) {
          localStorage.removeItem("kreotype_local_results");
          return { count: successCount };
        } else {
          throw new Error("Failed to sync any results");
        }
      })(),
      {
        loading: "Syncing results...",
        success: (data) => `Successfully synced ${data.count} results to your profile!`,
        error: "Failed to sync results. Please try again later.",
        finally: () => setIsSyncing(false),
      }
    );
  }, [setIsSyncing]);

  useEffect(() => {
    if (status === "authenticated" && !hasCheckedRef.current) {
      hasCheckedRef.current = true;
      const localResultsJson = localStorage.getItem("kreotype_local_results");
      if (localResultsJson) {
        try {
          const localResults = JSON.parse(localResultsJson);
          if (Array.isArray(localResults) && localResults.length > 0) {
            // Found local results, ask to sync
            toast.info("Unsaved results found", {
              description: `You have ${localResults.length} typing tests saved locally. Sync them to your profile?`,
              action: {
                label: "Sync Now",
                onClick: () => syncResults(localResults),
              },
              duration: 10000,
            });
          }
        } catch (err) {
          console.error("Failed to parse local results:", err);
        }
      }
    }
  }, [status, syncResults]);

  return null;
}
