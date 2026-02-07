/**
 * Word Generator
 * 
 * Generates word lists for typing tests based on different modes and configurations.
 */

const punctuationMarks = [".", ",", "!", "?", ";", ":"];

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Add punctuation to a word
 */
function addPunctuation(word: string): string {
    if (Math.random() < 0.15) {
        const mark = punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)];
        return word + mark;
    }
    return word;
}

/**
 * Add numbers to word list
 */
function injectNumbers(words: string[]): string[] {
    return words.map(word => {
        if (Math.random() < 0.1) {
            const num = Math.floor(Math.random() * 100);
            return Math.random() < 0.5 ? `${num}${word}` : `${word}${num}`;
        }
        return word;
    });
}

/**
 * Generate words for typing test
 * 
 * @param mode - Test mode: "time" | "words" | "zen"
 * @param value - Mode value (seconds for time, word count for words)
 * @param wordList - Source word list
 * @param punctuation - Include punctuation
 * @param numbers - Include numbers
 */
export function generateWords(
    mode: string,
    value: string,
    wordList: string[],
    punctuation: boolean,
    numbers: boolean
): string[] {
    let targetWordCount: number;

    if (mode === "time") {
        // Estimate words needed: ~40 WPM average * time in minutes
        const timeInMinutes = parseInt(value) / 60;
        targetWordCount = Math.ceil(40 * timeInMinutes * 1.5); // 1.5x buffer
    } else if (mode === "words") {
        targetWordCount = parseInt(value);
    } else {
        // Zen mode - generate a large pool
        targetWordCount = 500;
    }

    // Generate word pool (larger than needed to avoid repetition)
    const poolSize = Math.max(targetWordCount * 2, 100);
    const shuffled = shuffleArray(wordList);

    let words: string[] = [];
    while (words.length < targetWordCount) {
        words = words.concat(shuffled.slice(0, poolSize));
    }
    words = words.slice(0, targetWordCount);

    // Apply modifiers
    if (punctuation) {
        words = words.map(addPunctuation);
    }

    if (numbers) {
        words = injectNumbers(words);
    }

    return words;
}

/**
 * Generate quote-based test
 */
export function generateQuote(quote: string): string[] {
    return quote.split(/\s+/).filter(word => word.length > 0);
}

/**
 * Generate custom text test
 */
export function generateCustomText(text: string): string[] {
    return text.split(/\s+/).filter(word => word.length > 0);
}
