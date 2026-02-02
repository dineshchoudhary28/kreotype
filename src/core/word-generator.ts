import type { QuoteData } from "@/types/test";

// --- Accent tables for lazy mode (ported from Monkeytype's lazy-mode.ts) ---

type AccentRule = [string, string];

const DEFAULT_ACCENTS: AccentRule[] = [
  ["áàâäåãąą́āą̄ă", "a"],
  ["éèêëẽęę́ēę̄ėě", "e"],
  ["íìîïĩįį́īį̄ı", "i"],
  ["óòôöøõóōǫǫ́ǭő", "o"],
  ["úùûüŭũúūůű", "u"],
  ["ńň", "n"],
  ["çĉčć", "c"],
  ["řŕṛ", "r"],
  ["ďđḍ", "d"],
  ["ťțṭ", "t"],
  ["ṃ", "m"],
  ["æ", "ae"],
  ["œ", "oe"],
  ["ẅŵ", "w"],
  ["ĝğg̃", "g"],
  ["ĥ", "h"],
  ["ĵ", "j"],
  ["ńṇṅ", "n"],
  ["ŝśšșşṣ", "s"],
  ["ß", "ss"],
  ["żźž", "z"],
  ["ÿỹýÿŷ", "y"],
  ["łľĺ", "l"],
  ["ё", "е"],
  ["ά", "α"],
  ["έ", "ε"],
  ["ί", "ι"],
  ["ύ", "υ"],
  ["ό", "ο"],
  ["ή", "η"],
  ["ώ", "ω"],
  ["þ", "th"],
];

const accentMap = new Map<string, string>(
  DEFAULT_ACCENTS.flatMap((rule) =>
    [...rule[0]].map((accent) => [accent, rule[1]] as [string, string])
  )
);

export function replaceAccents(
  word: string,
  additionalAccents?: AccentRule[]
): string {
  if (!word) return word;

  const additionalMap = additionalAccents
    ? new Map<string, string>(
        additionalAccents.flatMap((rule) =>
          [...rule[0]].map((accent) => [accent, rule[1]] as [string, string])
        )
      )
    : null;

  const uppercased = word.toUpperCase();
  const cases = [...word].map((ch, i) => ch === uppercased[i]);
  const result: string[] = [];
  let offset = 0;

  for (let i = 0; i < word.length; i++) {
    const idx = i + offset;
    if (idx >= word.length) break;
    const ch = word[idx]!.toLowerCase();
    const replacement = additionalMap?.get(ch) ?? accentMap.get(ch);

    if (replacement !== undefined) {
      for (let j = 0; j < replacement.length; j++) {
        const c = replacement[j]!;
        const isUpper = cases[idx + j] ?? false;
        result.push(isUpper ? c.toUpperCase() : c);
      }
      offset += 0; // single char replaced
    } else {
      const c = word[idx]!;
      result.push(cases[idx] ? c.toUpperCase() : c);
    }
  }

  return result.join("");
}

// --- British English simple replacements ---

const BRITISH_REPLACEMENTS: Record<string, string> = {
  color: "colour",
  colors: "colours",
  colored: "coloured",
  favor: "favour",
  favors: "favours",
  favorite: "favourite",
  favorites: "favourites",
  honor: "honour",
  honors: "honours",
  honored: "honoured",
  humor: "humour",
  humors: "humours",
  labor: "labour",
  labors: "labours",
  neighbor: "neighbour",
  neighbors: "neighbours",
  realize: "realise",
  realizes: "realises",
  realized: "realised",
  organize: "organise",
  organizes: "organises",
  organized: "organised",
  recognize: "recognise",
  recognizes: "recognises",
  recognized: "recognised",
  analyze: "analyse",
  analyzes: "analyses",
  analyzed: "analysed",
  defense: "defence",
  offense: "offence",
  license: "licence",
  practice: "practise",
  catalog: "catalogue",
  dialog: "dialogue",
  traveling: "travelling",
  traveled: "travelled",
  center: "centre",
  centers: "centres",
  theater: "theatre",
  theaters: "theatres",
  meter: "metre",
  meters: "metres",
  fiber: "fibre",
  fibers: "fibres",
  gray: "grey",
  jewelry: "jewellery",
  program: "programme",
  programs: "programmes",
};

export function applyBritishEnglish(word: string, language: string): string {
  if (!language.includes("english")) return word;
  const lower = word.toLowerCase();
  const replacement = BRITISH_REPLACEMENTS[lower];
  if (!replacement) return word;
  // Preserve case of first letter
  if (word[0] === word[0]?.toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

// --- Punctuation Pipeline (ported from Monkeytype words-generator.ts) ---

const SENTENCE_ENDERS = [".", "!", "?"];
const PUNCTUATION_MARKS = [",", ";", ":"];

function shouldCapitalize(lastChar: string): boolean {
  return /[?!.؟]/.test(lastChar);
}

function getLastChar(str: string): string {
  return str.length > 0 ? str[str.length - 1]! : "";
}

function capitalizeFirst(word: string): string {
  if (word.length === 0) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function punctuateWord(
  previousWord: string,
  currentWord: string,
  index: number,
  maxIndex: number,
  language: string = "english"
): string {
  let word = currentWord;
  const currentLanguage = language.split("_")[0] ?? "english";
  const lastChar = getLastChar(previousWord);

  // Capitalize after sentence enders or at start
  if (
    currentLanguage !== "code" &&
    currentLanguage !== "georgian" &&
    (index === 0 || shouldCapitalize(lastChar))
  ) {
    word = capitalizeFirst(word);

    if (currentLanguage === "turkish") {
      word = word.replace(/I/g, "I\u0307"); // dotted I
    }
  } else if (
    (Math.random() < 0.1 &&
      lastChar !== "." &&
      lastChar !== "," &&
      index !== maxIndex - 2) ||
    index === maxIndex - 1
  ) {
    // Sentence ender
    const rand = Math.random();
    if (rand <= 0.8) {
      if (
        currentLanguage === "japanese" ||
        currentLanguage === "chinese"
      ) {
        word += "\u3002"; // Japanese/Chinese period
      } else if (
        currentLanguage === "nepali" ||
        currentLanguage === "bangla" ||
        currentLanguage === "hindi"
      ) {
        word += "\u0964"; // Devanagari danda
      } else {
        word += ".";
      }
    } else if (rand > 0.8 && rand < 0.9) {
      if (
        currentLanguage === "arabic" ||
        currentLanguage === "persian" ||
        currentLanguage === "urdu" ||
        currentLanguage === "kurdish"
      ) {
        word += "\u061F"; // Arabic question mark
      } else if (currentLanguage === "greek") {
        word += ";"; // Greek question mark
      } else if (
        currentLanguage === "japanese" ||
        currentLanguage === "chinese"
      ) {
        word += "\uFF1F"; // Fullwidth question mark
      } else {
        word += "?";
      }
    } else {
      if (
        currentLanguage === "japanese" ||
        currentLanguage === "chinese"
      ) {
        word += "\uFF01"; // Fullwidth exclamation
      } else {
        word += "!";
      }
    }
  } else if (
    Math.random() < 0.01 &&
    lastChar !== "," &&
    lastChar !== "."
  ) {
    word = `"${word}"`;
  } else if (
    Math.random() < 0.011 &&
    lastChar !== "," &&
    lastChar !== "."
  ) {
    word = `'${word}'`;
  } else if (Math.random() < 0.012 && lastChar !== "," && lastChar !== ".") {
    if (currentLanguage === "japanese" || currentLanguage === "chinese") {
      word = `\uFF08${word}\uFF09`; // Fullwidth parens
    } else {
      word = `(${word})`;
    }
  } else if (
    Math.random() < 0.013 &&
    lastChar !== "," &&
    lastChar !== "." &&
    lastChar !== ";" &&
    lastChar !== ":"
  ) {
    if (currentLanguage === "chinese") {
      word += "\uFF1A"; // Fullwidth colon
    } else {
      word += ":";
    }
  } else if (
    Math.random() < 0.014 &&
    lastChar !== "," &&
    lastChar !== "." &&
    previousWord !== "-"
  ) {
    word = "-";
  } else if (
    Math.random() < 0.015 &&
    lastChar !== "," &&
    lastChar !== "." &&
    lastChar !== ";"
  ) {
    if (currentLanguage === "arabic" || currentLanguage === "kurdish") {
      word += "\u061B"; // Arabic semicolon
    } else if (currentLanguage === "chinese") {
      word += "\uFF1B"; // Fullwidth semicolon
    } else {
      word += ";";
    }
  } else if (Math.random() < 0.2 && lastChar !== ",") {
    if (
      currentLanguage === "arabic" ||
      currentLanguage === "urdu" ||
      currentLanguage === "persian" ||
      currentLanguage === "kurdish"
    ) {
      word += "\u060C"; // Arabic comma
    } else if (currentLanguage === "japanese") {
      word += "\u3001"; // Japanese comma
    } else if (currentLanguage === "chinese") {
      word += "\uFF0C"; // Fullwidth comma
    } else {
      word += ",";
    }
  }

  return word;
}

// --- Number generation ---

export function generateNumber(maxDigits: number = 4): string {
  const digits = Math.floor(Math.random() * maxDigits) + 1;
  const max = Math.pow(10, digits);
  return String(Math.floor(Math.random() * max));
}

// --- Core word generation ---

export interface GenerateWordsOptions {
  punctuation?: boolean;
  numbers?: boolean;
  lazyMode?: boolean;
  britishEnglish?: boolean;
  language?: string;
}

export function generateWords(
  wordList: string[],
  count: number,
  options: GenerateWordsOptions = {}
): string[] {
  const {
    punctuation = false,
    numbers = false,
    lazyMode = false,
    britishEnglish = false,
    language = "english",
  } = options;

  if (wordList.length === 0) return [];

  const result: string[] = [];
  let previousWord = "";

  for (let i = 0; i < count; i++) {
    // Number injection: 10% chance
    if (numbers && Math.random() < 0.1) {
      const num = generateNumber(4);
      result.push(num);
      previousWord = num;
      continue;
    }

    // Pick random word, avoiding repeating the previous word
    let word: string;
    let attempts = 0;
    do {
      word = wordList[Math.floor(Math.random() * wordList.length)]!;
      attempts++;
    } while (
      word === previousWord &&
      wordList.length > 1 &&
      attempts < 100
    );

    // Filter out words with numbers/punctuation/uppercase unless enabled
    if (
      !punctuation &&
      !language.startsWith("code") &&
      /[-=_+[\]{};'\\:"|,./<>?]/.test(word)
    ) {
      // Regenerate to avoid special chars when punctuation is off
      let regen = 0;
      while (
        /[-=_+[\]{};'\\:"|,./<>?]/.test(word) &&
        regen < 50
      ) {
        word = wordList[Math.floor(Math.random() * wordList.length)]!;
        regen++;
      }
    }

    if (!numbers && /[0-9]/.test(word)) {
      let regen = 0;
      while (/[0-9]/.test(word) && regen < 50) {
        word = wordList[Math.floor(Math.random() * wordList.length)]!;
        regen++;
      }
    }

    // Lowercase unless it's a special language or punctuation is on
    if (
      /[A-Z]/.test(word) &&
      !punctuation &&
      !language.startsWith("german") &&
      !language.startsWith("code")
    ) {
      word = word.toLowerCase();
    }

    // Apply lazy mode (accent removal)
    if (lazyMode) {
      word = replaceAccents(word);
    }

    // Apply British English
    if (britishEnglish) {
      word = applyBritishEnglish(word, language);
    }

    // Apply punctuation pipeline
    if (punctuation) {
      word = punctuateWord(previousWord, word, i, count, language);
    }

    result.push(word);
    previousWord = word;
  }

  return result;
}

// --- Section-based generation (for modes that need word batches) ---

export function generateWordsSection(
  wordList: string[],
  sectionSize: number,
  existingWords: string[],
  options: GenerateWordsOptions = {}
): string[] {
  return generateWords(wordList, sectionSize, options);
}

// --- Quote generation ---

export function generateQuoteWords(
  quotes: QuoteData[],
  group?: QuoteData["group"]
): {
  words: string[];
  quote: QuoteData;
} {
  const filtered = group ? quotes.filter((q) => q.group === group) : quotes;
  if (filtered.length === 0) {
    const fallback = quotes[Math.floor(Math.random() * quotes.length)]!;
    const words = fallback.text.split(" ");
    return { words, quote: fallback };
  }
  const quote = filtered[Math.floor(Math.random() * filtered.length)]!;
  const words = quote.text.split(" ");
  return { words, quote };
}

export function generateQuoteById(
  quotes: QuoteData[],
  id: number
): { words: string[]; quote: QuoteData } | null {
  const quote = quotes.find((q) => q.id === id);
  if (!quote) return null;
  return { words: quote.text.split(" "), quote };
}

// --- Zen mode ---

export function generateZenWords(
  wordList: string[],
  batchSize: number = 100,
  options: GenerateWordsOptions = {}
): string[] {
  return generateWords(wordList, batchSize, options);
}
