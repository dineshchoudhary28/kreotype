export interface CharCounts {
  correctWordChars: number;
  allCorrectChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  spaces: number;
  correctSpaces: number;
  allCharsTyped: number;
}

export function countChars(
  words: string[],
  wordInputs: string[],
  currentInput: string,
  activeWordIndex: number
): CharCounts {
  const counts: CharCounts = {
    correctWordChars: 0,
    allCorrectChars: 0,
    incorrectChars: 0,
    extraChars: 0,
    missedChars: 0,
    spaces: 0,
    correctSpaces: 0,
    allCharsTyped: 0,
  };

  const inputs = [...wordInputs];
  if (activeWordIndex < words.length && currentInput !== undefined) {
    inputs.push(currentInput);
  } else if (activeWordIndex >= words.length && currentInput && currentInput.length > 0) {
    // Timer expired mid-word: still count the partial input for the last word
    inputs.push(currentInput);
  }

  for (let w = 0; w < inputs.length; w++) {
    const target = words[w] ?? "";
    const input = inputs[w] ?? "";
    let wordCorrectChars = 0;
    let wordHasError = false;

    for (let i = 0; i < Math.max(target.length, input.length); i++) {
      if (i < target.length && i < input.length) {
        if (input[i] === target[i]) {
          wordCorrectChars++;
          counts.allCorrectChars++;
        } else {
          counts.incorrectChars++;
          wordHasError = true;
        }
      } else if (i >= target.length) {
        counts.extraChars++;
        wordHasError = true;
      } else {
        counts.missedChars++;
        wordHasError = true;
      }
    }

    counts.allCharsTyped += input.length;

    if (w < wordInputs.length) {
      counts.spaces++;
      counts.allCharsTyped++;
      if (!wordHasError && input.length === target.length) {
        counts.correctWordChars += wordCorrectChars;
        counts.correctSpaces++;
      }
    }
  }

  return counts;
}
