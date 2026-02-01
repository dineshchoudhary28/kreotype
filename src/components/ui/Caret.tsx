"use client";

import { motion } from "framer-motion";
import { useConfigStore } from "@/store/useConfigStore";

interface CaretProps {
  top: number;
  left: number;
  isTyping?: boolean;
}

export function Caret({ top, left, isTyping = false }: CaretProps) {
  const caretStyle = useConfigStore((s) => s.caretStyle);
  const smoothCaret = useConfigStore((s) => s.smoothCaret);

  if (caretStyle === "off") return null;

  const styles: Record<string, string> = {
    line: "w-[2px] h-[1.4em]",
    block: "w-[0.6em] h-[1.4em] opacity-40",
    underline: "w-[0.6em] h-[2px] translate-y-[1.2em]",
  };

  return (
    <motion.div
      className={`absolute bg-[var(--caret)] rounded-sm ${styles[caretStyle] ?? styles.line}`}
      animate={{ top, left }}
      transition={smoothCaret
        ? { type: "spring", stiffness: 500, damping: 30, mass: 0.5 }
        : { duration: 0 }
      }
      style={{ position: "absolute" }}
    >
      <motion.div
        className="w-full h-full bg-inherit rounded-sm"
        animate={isTyping ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
        transition={isTyping ? { duration: 0.1 } : { duration: 1, repeat: Infinity, ease: "linear", times: [0, 0.5, 0.5, 1] }}
      />
    </motion.div>
  );
}