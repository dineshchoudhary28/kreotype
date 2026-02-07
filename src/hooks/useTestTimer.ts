/**
 * useTestTimer Hook
 * 
 * Manages test timer for time-based and timed modes.
 */

import { useEffect, useRef } from "react";
import { useTypingTestStore } from "@/store/useTypingTestStore";

export function useTestTimer() {
    const { isActive, isFinished, tick } = useTypingTestStore();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isActive && !isFinished) {
            intervalRef.current = setInterval(() => {
                tick();
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, isFinished, tick]);

    return {
        isActive,
        isFinished,
    };
}
