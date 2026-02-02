"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Command } from "cmdk";
import { useConfigStore } from "@/store/useConfigStore";

const TIME_OPTIONS = [15, 30, 60, 120];
const WORD_OPTIONS = [10, 25, 50, 100];

export function CommandPalette({ onRestart }: { onRestart: () => void }) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const setConfig = useConfigStore((s) => s.setConfig);
  const quickRestart = useConfigStore((s) => s.quickRestart);
  const singleListCommandLine = useConfigStore((s) => s.singleListCommandLine);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const isCmdP = (e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "p";
      const isEsc = e.key === "Escape";
      const isTab = e.key === "Tab";

      if (isCmdP) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }

      if (open) {
        if (isEsc) setOpen(false);
        return;
      }

      // Opening logic
      if (quickRestart === "esc") {
        // If Esc restarts, Tab opens command line
        if (isTab) {
          e.preventDefault();
          setOpen(true);
        }
      } else {
        // Default: Esc opens command line
        if (isEsc) {
           e.preventDefault();
           setOpen(true);
        }
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [quickRestart, open]);

  const showCommands = singleListCommandLine !== "manual" || inputValue.startsWith(">");
  const flatten = singleListCommandLine !== "off";

  const renderItems = () => (
    <>
      {/* Mode Items */}
      {(["time", "words", "quote", "zen"] as const).map((m) => (
        <Command.Item
          key={`mode-${m}`}
          value={`mode ${m}`}
          className="px-4 py-2 text-text text-sm rounded cursor-pointer data-[selected]:bg-primary data-[selected]:text-background"
          onSelect={() => { setConfig("mode", m); onRestart(); setOpen(false); }}
        >
          mode: {m}
        </Command.Item>
      ))}
      
      {/* Time Items */}
      {TIME_OPTIONS.map((t) => (
        <Command.Item
          key={`time-${t}`}
          value={`time ${t}`}
          className="px-4 py-2 text-text text-sm rounded cursor-pointer data-[selected]:bg-primary data-[selected]:text-background"
          onSelect={() => { setConfig("time", t); onRestart(); setOpen(false); }}
        >
          time: {t}s
        </Command.Item>
      ))}

      {/* Words Items */}
      {WORD_OPTIONS.map((w) => (
        <Command.Item
          key={`words-${w}`}
          value={`words ${w}`}
          className="px-4 py-2 text-text text-sm rounded cursor-pointer data-[selected]:bg-primary data-[selected]:text-background"
          onSelect={() => { setConfig("words", w); onRestart(); setOpen(false); }}
        >
          words: {w}
        </Command.Item>
      ))}
    </>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Command
              className="w-full max-w-md bg-background border border-secondary rounded-lg shadow-xl overflow-hidden"
              label="Command palette"
              shouldFilter={true}
            >
              <Command.Input
                className="w-full px-4 py-3 bg-transparent text-text outline-none border-b border-secondary placeholder:text-secondary"
                placeholder="Type a command..."
                autoFocus
                value={inputValue}
                onValueChange={setInputValue}
              />
              <Command.List className="max-h-64 overflow-y-auto p-2">
                <Command.Empty className="px-4 py-2 text-secondary text-sm">No results.</Command.Empty>
                
                {showCommands && (
                  flatten ? (
                    renderItems()
                  ) : (
                    <>
                      <Command.Group heading="Mode" className="text-xs text-secondary px-2 py-1">
                         {(["time", "words", "quote", "zen"] as const).map((m) => (
                            <Command.Item
                              key={`mode-${m}`}
                              value={`mode ${m}`}
                              className="px-4 py-2 text-text text-sm rounded cursor-pointer data-[selected]:bg-primary data-[selected]:text-background"
                              onSelect={() => { setConfig("mode", m); onRestart(); setOpen(false); }}
                            >
                              mode: {m}
                            </Command.Item>
                          ))}
                      </Command.Group>
                      <Command.Group heading="Time" className="text-xs text-secondary px-2 py-1">
                         {TIME_OPTIONS.map((t) => (
                            <Command.Item
                              key={`time-${t}`}
                              value={`time ${t}`}
                              className="px-4 py-2 text-text text-sm rounded cursor-pointer data-[selected]:bg-primary data-[selected]:text-background"
                              onSelect={() => { setConfig("time", t); onRestart(); setOpen(false); }}
                            >
                              time: {t}s
                            </Command.Item>
                          ))}
                      </Command.Group>
                      <Command.Group heading="Words" className="text-xs text-secondary px-2 py-1">
                          {WORD_OPTIONS.map((w) => (
                            <Command.Item
                              key={`words-${w}`}
                              value={`words ${w}`}
                              className="px-4 py-2 text-text text-sm rounded cursor-pointer data-[selected]:bg-primary data-[selected]:text-background"
                              onSelect={() => { setConfig("words", w); onRestart(); setOpen(false); }}
                            >
                              words: {w}
                            </Command.Item>
                          ))}
                      </Command.Group>
                    </>
                  )
                )}
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
