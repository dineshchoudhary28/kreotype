"use client";

import { useSession } from "next-auth/react";
import { useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { type CompletedEventInput } from "@/server/validators/result";
import { useTypingTestStore } from "@/store/useTypingTestStore";
import { MAINTENANCE_MODE } from "@/lib/maintenance";

export function LocalResultSyncer() {
  const { status } = useSession();
  const hasCheckedRef = useRef(false);
  const setIsSyncing = useTypingTestStore((s) => s.setIsSyncing);

  const syncResults = useCallback(async (results: (CompletedEventInput & { testId: string })[]) => {
    setIsSyncing(true);
    toast.promise(
      (async () => {
        let successCount = 0;
        const failedResults: (CompletedEventInput & { testId: string })[] = [];

        for (const result of results) {
          try {
            const res = await fetch("/api/results", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(result),
            });
            if (res.ok) {
              successCount++;
            } else {
              failedResults.push(result);
            }
          } catch (err) {
            console.error("Failed to sync a result:", err);
            failedResults.push(result);
          }
        }

        // Preserve failed results in localStorage, remove only synced ones
        if (failedResults.length > 0) {
          localStorage.setItem("kreotype_local_results", JSON.stringify(failedResults));
        } else {
          localStorage.removeItem("kreotype_local_results");
        }

        if (successCount === 0) {
          throw new Error("Failed to sync any results");
        }

        return { count: successCount, failed: failedResults.length };
      })(),
      {
        loading: "Syncing results...",
        success: (data) =>
          data.failed > 0
            ? `Synced ${data.count} results. ${data.failed} failed and will retry later.`
            : `Successfully synced ${data.count} results to your profile!`,
        error: "Failed to sync results. Please try again later.",
        finally: () => setIsSyncing(false),
      }
    );
  }, [setIsSyncing]);

  useEffect(() => {
    if (MAINTENANCE_MODE) return;
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
