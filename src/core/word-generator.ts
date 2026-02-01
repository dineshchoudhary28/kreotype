import type { QuoteData } from "@/types/test";

const SENTENCE_ENDERS = [".", "!", "?"];
const PUNCTUATION_MARKS = [",", ";", ":"];

export function generateWords(
  wordList: string[],
  count: number,
  options: { punctuation: boolean; numbers: boolean } = {
    punctuation: false,
    numbers: false,
  }
): string[] {
  const result: string[] = [];
  let lastWasSentenceEnd = true;

  for (let i = 0; i < count; i++) {
    if (options.numbers && Math.random() < 0.1) {
      result.push(String(Math.floor(Math.random() * 1000)));
      lastWasSentenceEnd = false;
      continue;
    }

    let word = wordList[Math.floor(Math.random() * wordList.length)];

    if (options.punctuation) {
      if (lastWasSentenceEnd) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
        lastWasSentenceEnd = false;
      }

      if (Math.random() < 0.08 && i < count - 1) {
        const end = SENTENCE_ENDERS[Math.floor(Math.random() * SENTENCE_ENDERS.length)];
        word += end;
        lastWasSentenceEnd = true;
      } else if (Math.random() < 0.06 && i < count - 1) {
        const mark = PUNCTUATION_MARKS[Math.floor(Math.random() * PUNCTUATION_MARKS.length)];
        word += mark;
      }

      if (i === count - 1 && !SENTENCE_ENDERS.some((e) => word.endsWith(e))) {
        word += ".";
      }
    }

    result.push(word);
  }

  return result;
}

export function generateQuoteWords(quotes: QuoteData[], group?: QuoteData["group"]): {
  words: string[];
  quote: QuoteData;
} {
  const filtered = group ? quotes.filter((q) => q.group === group) : quotes;
  if (filtered.length === 0) {
    const fallback = quotes[Math.floor(Math.random() * quotes.length)];
    const words = fallback.text.split(" ");
    return { words, quote: fallback };
  }
  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  const words = quote.text.split(" ");
  return { words, quote };
}

export function generateZenWords(wordList: string[], batchSize: number = 100): string[] {
  return generateWords(wordList, batchSize);
}
