"use client";

import { motion, AnimatePresence } from "framer-motion";

interface OutOfFocusWarningProps {
  show: boolean;
  onClick: () => void;
}

export function OutOfFocusWarning({ show, onClick }: OutOfFocusWarningProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 z-10 flex items-center justify-center bg-background bg-opacity-80 backdrop-blur-md cursor-pointer rounded-lg"
          onClick={onClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-secondary text-lg">
            Click or press any key to focus
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
