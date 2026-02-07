/**
 * usePaceCaret Hook
 * 
 * Manages pace caret position for typing test.
 * The pace caret shows the target typing speed.
 */

import { useMemo } from "react";
import { useTypingTestStore } from "@/store/useTypingTestStore";

export interface PaceCaretConfig {
    targetWpm: number;
    enabled: boolean;
}

export function usePaceCaret(config: PaceCaretConfig) {
    const { words, elapsedTime, startTime } = useTypingTestStore();

    const pacePosition = useMemo(() => {
        if (!config.enabled || !startTime) {
            return { wordIndex: 0, charIndex: 0 };
        }

        const elapsedMinutes = elapsedTime / 1000 / 60;
        const targetChars = config.targetWpm * 5 * elapsedMinutes;

        let charCount = 0;
        let wordIndex = 0;
        let charIndex = 0;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            for (let j = 0; j < word.word.length; j++) {
                if (charCount >= targetChars) {
                    return { wordIndex, charIndex };
                }
                charCount++;
                charIndex = j + 1;
            }

            // Space after word
            if (charCount >= targetChars) {
                return { wordIndex, charIndex };
            }
            charCount++;

            wordIndex = i + 1;
            charIndex = 0;
        }

        return { wordIndex, charIndex };
    }, [config.enabled, config.targetWpm, words, elapsedTime, startTime]);

    return {
        pacePosition,
        isEnabled: config.enabled,
    };
}
