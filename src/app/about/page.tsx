"use client";

export default function AboutPage() {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-10 px-4 py-8">
      {/* Stats */}
      <div className="flex flex-wrap gap-8 justify-center">
        <div className="text-center">
          <div className="text-xs text-secondary">total tests started</div>
          <div className="text-2xl text-primary">-</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-secondary">total typing time</div>
          <div className="text-2xl text-primary">-</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-secondary">total tests completed</div>
          <div className="text-2xl text-primary">-</div>
        </div>
      </div>

      {/* About */}
      <section>
        <h2 className="text-lg text-primary mb-3 flex items-center gap-2">
          about
        </h2>
        <p className="text-sm text-text leading-relaxed">
          Kreotype is a minimalistic and customizable typing test. It features
          many test modes, user-configurable settings such as themes, a smooth
          caret, and more. Kreotype attempts to emulate the experience of
          natural keyboard typing during a typing test, by unobtrusively
          presenting the text prompts and displaying typed characters in-place,
          providing straightforward, real-time feedback on typos, speed, and
          accuracy.
        </p>
        <p className="text-sm text-text leading-relaxed mt-2">
          Test yourself in various modes, track your progress and improve your
          speed.
        </p>
      </section>

      {/* Word Set */}
      <section>
        <h3 className="text-base text-primary mb-2">word set</h3>
        <p className="text-sm text-secondary leading-relaxed">
          By default, this website uses the most common 200 words in the English
          language to generate its tests. You can change to an expanded set
          (1000 most common words) in the options, or change the language
          entirely.
        </p>
      </section>

      {/* Keybinds */}
      <section>
        <h3 className="text-base text-primary mb-2">keybinds</h3>
        <p className="text-sm text-secondary leading-relaxed">
          You can use{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-secondary bg-opacity-10 text-text">tab</kbd>{" "}
          or{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-secondary bg-opacity-10 text-text">esc</kbd>{" "}
          to restart the typing test. Open the command line by pressing{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-secondary bg-opacity-10 text-text">ctrl/cmd</kbd>
          +
          <kbd className="px-1.5 py-0.5 rounded bg-secondary bg-opacity-10 text-text">shift</kbd>
          +
          <kbd className="px-1.5 py-0.5 rounded bg-secondary bg-opacity-10 text-text">p</kbd>
          {" "} — there you can access all the functionality you need without
          touching your mouse.
        </p>
      </section>

      {/* Stats */}
      <section>
        <h3 className="text-base text-primary mb-2">stats</h3>
        <div className="flex flex-col gap-2 text-sm text-secondary">
          <p>
            <strong className="text-text">wpm</strong> — total number
            of characters in the correctly typed words (including spaces),
            divided by 5 and normalised to 60 seconds.
          </p>
          <p>
            <strong className="text-text">raw wpm</strong> — calculated
            just like wpm, but also includes incorrect words.
          </p>
          <p>
            <strong className="text-text">acc</strong> — percentage of
            correctly pressed keys.
          </p>
          <p>
            <strong className="text-text">consistency</strong> — based
            on the variance of your raw wpm. Closer to 100% is better.
          </p>
        </div>
      </section>

      {/* Results Screen */}
      <section>
        <h3 className="text-base text-primary mb-2">results screen</h3>
        <p className="text-sm text-secondary leading-relaxed">
          After completing a test you will be able to see your wpm, raw wpm,
          accuracy, character stats, and test length. You can also see a graph
          of your wpm and raw over the duration of the test.
        </p>
      </section>

      {/* Bug Report */}
      <section>
        <h3 className="text-base text-primary mb-2">
          bug report or feature request
        </h3>
        <p className="text-sm text-secondary leading-relaxed">
          If you encounter a bug, or have a feature request — create an issue on
          GitHub.
        </p>
      </section>

      {/* Contact */}
      <section>
        <h3 className="text-base text-primary mb-2">contact</h3>
        <div className="flex gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer noopener"
            className="px-4 py-2 rounded bg-secondary bg-opacity-10 text-secondary hover:text-text transition-colors text-sm"
          >
            github
          </a>
        </div>
      </section>
    </div>
  );
}
