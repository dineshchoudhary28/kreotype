/**
 * useKeyboardInput Hook
 * 
 * Handles keyboard input for typing test.
 * Manages keydown/keyup events and input processing.
 */

import { useEffect, useCallback } from "react";
import { useTypingTestStore } from "@/store/useTypingTestStore";

interface UseKeyboardInputOptions {
    onChar?: (char: string) => void;
    onBackspace?: () => void;
    onSpace?: () => void;
    enabled?: boolean;
}

export function useKeyboardInput(options: UseKeyboardInputOptions = {}) {
    const {
        onChar,
        onBackspace,
        onSpace,
        enabled = true,
    } = options;

    const {
        handleInput,
        handleBackspace: storeBackspace,
        handleSpace: storeSpace,
        recordKeydown,
        recordKeyup,
        isFinished,
    } = useTypingTestStore();

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!enabled || isFinished) return;

        // Record keydown for timing
        recordKeydown(e.code);

        // Prevent default for typing keys
        if (e.key.length === 1 || e.key === "Backspace" || e.key === " ") {
            e.preventDefault();
        }

        // Handle special keys
        if (e.key === "Backspace") {
            onBackspace?.() || storeBackspace();
        } else if (e.key === " ") {
            onSpace?.() || storeSpace();
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            // Regular character
            onChar?.(e.key) || handleInput(e.key);
        }
    }, [enabled, isFinished, onChar, onBackspace, onSpace, handleInput, storeBackspace, storeSpace, recordKeydown]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (!enabled) return;
        recordKeyup(e.code);
    }, [enabled, recordKeyup]);

    useEffect(() => {
        if (!enabled) return;

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [enabled, handleKeyDown, handleKeyUp]);

    return {
        isEnabled: enabled,
    };
}
