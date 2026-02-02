"use client";

import { motion } from "framer-motion";
import { useConfigStore } from "@/store/useConfigStore";

interface CaretProps {
  top: number;
  left: number;
  isTyping?: boolean;
  isPaceCaret?: boolean;
}

export function Caret({ top, left, isTyping = false, isPaceCaret = false }: CaretProps) {
  const caretStyle = useConfigStore((s) => s.caretStyle);
  const smoothCaret = useConfigStore((s) => s.smoothCaret);

  if (caretStyle === "off" && !isPaceCaret) return null;

  const styles: Record<string, string> = {
    line: "w-[2px] h-[1.4em]",
    block: "w-[0.6em] h-[1.4em] opacity-40",
    underline: "w-[0.6em] h-[2px] translate-y-[1.2em]",
  };

  const paceCaretClass = isPaceCaret
    ? "opacity-30 bg-[var(--sub)]"
    : "bg-[var(--caret)]";

  return (
    <motion.div
      className={`absolute rounded-sm ${styles[caretStyle] ?? styles.line} ${paceCaretClass}`}
      animate={{ top, left }}
      transition={smoothCaret
        ? { type: "spring", stiffness: 500, damping: 30, mass: 0.5 }
        : { duration: 0 }
      }
      style={{ position: "absolute" }}
    >
      {!isPaceCaret && (
        <motion.div
          className="w-full h-full bg-inherit rounded-sm"
          animate={isTyping ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
          transition={isTyping ? { duration: 0.1 } : { duration: 1, repeat: Infinity, ease: "linear", times: [0, 0.5, 0.5, 1] }}
        />
      )}
    </motion.div>
  );
}
