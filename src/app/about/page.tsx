"use client";

import { Zap, Target, TrendingUp, Palette, Keyboard, BarChart3, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-8 py-10 flex flex-col gap-8">
      {/* Header Section */}
      <div className="border-b border-surface pb-8">
        <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-3">
          <Keyboard className="text-primary" size={32} strokeWidth={2.5} />
          About Kreotype
        </h1>
        <p className="text-secondary text-sm font-medium tracking-wide uppercase">
          The modern typing experience
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Hero Section */}
        <section className="p-8 rounded-2xl border border-surface bg-gradient-to-br from-primary/5 to-transparent">
          <h2 className="text-2xl font-bold text-text mb-4">
            Master Your Typing Skills
          </h2>
          <p className="text-base text-secondary leading-relaxed mb-4">
            Kreotype is a dynamic, customizable typing test platform designed to help you improve
            your typing speed and accuracy. Built with modern web technologies, Kreotype offers a smooth,
            distraction-free experience that emulates natural keyboard typing.
          </p>
          <p className="text-base text-secondary leading-relaxed">
            Whether you're a developer looking to code faster, a writer aiming for efficiency, or simply
            someone who wants to type better, Kreotype provides the tools and insights you need to track
            your progress and achieve your goals.
          </p>
        </section>

        {/* Features Grid */}
        <section>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-text mb-1">Why Choose Kreotype?</h2>
            <p className="text-xs text-secondary">Features that make us stand out</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-surface bg-surface/20 hover:bg-surface/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 group-hover:scale-110 transition-transform">
                <Zap className="text-primary" size={24} />
              </div>
              <h3 className="text-base font-bold text-text mb-2">Lightning Fast</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Instant feedback with smooth animations and zero lag. Every keystroke is registered
                immediately for the most accurate typing experience.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-surface bg-surface/20 hover:bg-surface/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 group-hover:scale-110 transition-transform">
                <Palette className="text-primary" size={24} />
              </div>
              <h3 className="text-base font-bold text-text mb-2">Fully Customizable</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Choose from dozens of beautiful themes, customize test settings, and personalize your
                typing experience to match your style.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-surface bg-surface/20 hover:bg-surface/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 group-hover:scale-110 transition-transform">
                <Target className="text-primary" size={24} />
              </div>
              <h3 className="text-base font-bold text-text mb-2">Precision Metrics</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Track WPM, accuracy, consistency, and more. Detailed statistics help you understand
                your performance and identify areas for improvement.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-surface bg-surface/20 hover:bg-surface/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 group-hover:scale-110 transition-transform">
                <TrendingUp className="text-primary" size={24} />
              </div>
              <h3 className="text-base font-bold text-text mb-2">Track Progress</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Save your results, view historical data, and watch your typing speed improve over time
                with detailed charts and analytics.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-surface bg-surface/20 hover:bg-surface/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 group-hover:scale-110 transition-transform">
                <BarChart3 className="text-primary" size={24} />
              </div>
              <h3 className="text-base font-bold text-text mb-2">Multiple Modes</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Test yourself with time-based, word-count, or zen mode. Add punctuation, numbers, or
                choose from different languages.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-surface bg-surface/20 hover:bg-surface/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 group-hover:scale-110 transition-transform">
                <Users className="text-primary" size={24} />
              </div>
              <h3 className="text-base font-bold text-text mb-2">Compete & Compare</h3>
              <p className="text-sm text-secondary leading-relaxed">
                View global leaderboards, compare your scores with friends, and see how you rank
                against typists worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-text mb-1">How It Works</h2>
            <p className="text-xs text-secondary">Get started in seconds</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-surface bg-surface/20 text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-background font-black text-lg flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h3 className="text-sm font-bold text-text mb-2">Choose Settings</h3>
              <p className="text-xs text-secondary leading-relaxed">
                Select test mode, duration, and language
              </p>
            </div>

            <div className="p-5 rounded-xl border border-surface bg-surface/20 text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-background font-black text-lg flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h3 className="text-sm font-bold text-text mb-2">Start Typing</h3>
              <p className="text-xs text-secondary leading-relaxed">
                Click the text area and begin typing the words shown
              </p>
            </div>

            <div className="p-5 rounded-xl border border-surface bg-surface/20 text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-background font-black text-lg flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h3 className="text-sm font-bold text-text mb-2">View Results</h3>
              <p className="text-xs text-secondary leading-relaxed">
                See your WPM, accuracy, and detailed statistics
              </p>
            </div>

            <div className="p-5 rounded-xl border border-surface bg-surface/20 text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-background font-black text-lg flex items-center justify-center mx-auto mb-3">
                4
              </div>
              <h3 className="text-sm font-bold text-text mb-2">Track Progress</h3>
              <p className="text-xs text-secondary leading-relaxed">
                Save results and monitor improvement over time
              </p>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-text mb-1">Keyboard Shortcuts</h2>
            <p className="text-xs text-secondary">Navigate without touching your mouse</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-surface bg-surface/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-text">Restart Test</span>
                <div className="flex gap-2">
                  <kbd className="px-2 py-1 rounded bg-surface border border-surface text-xs text-text font-bold">Tab</kbd>
                  <span className="text-secondary">or</span>
                  <kbd className="px-2 py-1 rounded bg-surface border border-surface text-xs text-text font-bold">Esc</kbd>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-surface bg-surface/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-text">Command Palette</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 rounded bg-surface border border-surface text-xs text-text font-bold">Ctrl</kbd>
                  <span className="text-secondary">+</span>
                  <kbd className="px-2 py-1 rounded bg-surface border border-surface text-xs text-text font-bold">Shift</kbd>
                  <span className="text-secondary">+</span>
                  <kbd className="px-2 py-1 rounded bg-surface border border-surface text-xs text-text font-bold">P</kbd>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Explained */}
        <section>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-text mb-1">Understanding Your Stats</h2>
            <p className="text-xs text-secondary">What the numbers mean</p>
          </div>

          <div className="grid gap-3">
            <div className="p-4 rounded-xl border border-surface bg-surface/20">
              <h3 className="text-sm font-bold text-text mb-1">WPM (Words Per Minute)</h3>
              <p className="text-xs text-secondary leading-relaxed">
                Total number of correctly typed characters (including spaces) divided by 5, normalized to 60 seconds.
                This is the standard metric for typing speed.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-surface bg-surface/20">
              <h3 className="text-sm font-bold text-text mb-1">Raw WPM</h3>
              <p className="text-xs text-secondary leading-relaxed">
                Calculated like WPM but includes all typed characters, even incorrect ones. Shows your actual
                typing speed without accuracy penalties.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-surface bg-surface/20">
              <h3 className="text-sm font-bold text-text mb-1">Accuracy</h3>
              <p className="text-xs text-secondary leading-relaxed">
                Percentage of correctly pressed keys. Higher accuracy means fewer mistakes and better typing precision.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-surface bg-surface/20">
              <h3 className="text-sm font-bold text-text mb-1">Consistency</h3>
              <p className="text-xs text-secondary leading-relaxed">
                Based on the variance of your raw WPM throughout the test. Values closer to 100% indicate more
                consistent typing speed.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
