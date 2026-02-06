export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  error: string;
  errorExtra: string;
}

export interface Theme {
  name: string;
  label: string;
  colors: ThemeColors;
}

export const themes: Theme[] = [
  {
    name: "kreotype_dark",
    label: "Kreotype Dark",
    colors: {
      background: "#000000",
      surface: "#0a0a0a",
      primary: "#685ACA",
      secondary: "#6b7280",
      accent: "#685ACA",
      text: "#ffffff",
      error: "#ca4754",
      errorExtra: "#7e2a33",
    },
  },
  {
    name: "kreotype_light",
    label: "Kreotype Light",
    colors: {
      background: "#ffffff",
      surface: "#f3f4f6",
      primary: "#685ACA",
      secondary: "#9ca3af",
      accent: "#685ACA",
      text: "#111827",
      error: "#ca4754",
      errorExtra: "#7e2a33",
    },
  },
  {
    name: "serika_dark",
    label: "Serika Dark",
    colors: {
      background: "#323437",
      surface: "#2c2e31",
      primary: "#e2b714",
      secondary: "#646669",
      accent: "#e2b714",
      text: "#d1d0c5",
      error: "#ca4754",
      errorExtra: "#7e2a33",
    },
  },
  {
    name: "carbon",
    label: "Carbon",
    colors: {
      background: "#313131",
      surface: "#2b2b2b",
      primary: "#f66e0d",
      secondary: "#616161",
      accent: "#f66e0d",
      text: "#f5e6c8",
      error: "#e61f44",
      errorExtra: "#b31230",
    },
  },
  {
    name: "dracula",
    label: "Dracula",
    colors: {
      background: "#282a36",
      surface: "#44475a",
      primary: "#bd93f9",
      secondary: "#6272a4",
      accent: "#ff79c6",
      text: "#f8f8f2",
      error: "#ff5555",
      errorExtra: "#b93e3e",
    },
  },
  {
    name: "nord",
    label: "Nord",
    colors: {
      background: "#2e3440",
      surface: "#3b4252",
      primary: "#88c0d0",
      secondary: "#4c566a",
      accent: "#81a1c1",
      text: "#d8dee9",
      error: "#bf616a",
      errorExtra: "#a64952",
    },
  },
  {
    name: "gruvbox_dark",
    label: "Gruvbox Dark",
    colors: {
      background: "#282828",
      surface: "#3c3836",
      primary: "#d79921",
      secondary: "#928374",
      accent: "#fabd2f",
      text: "#ebdbb2",
      error: "#cc241d",
      errorExtra: "#9d0006",
    },
  },
  {
    name: "tokyo_night",
    label: "Tokyo Night",
    colors: {
      background: "#1a1b26",
      surface: "#24283b",
      primary: "#7aa2f7",
      secondary: "#565f89",
      accent: "#bb9af7",
      text: "#a9b1d6",
      error: "#f7768e",
      errorExtra: "#db4b4b",
    },
  },
  {
    name: "one_dark",
    label: "One Dark",
    colors: {
      background: "#282c34",
      surface: "#21252b",
      primary: "#61afef",
      secondary: "#5c6370",
      accent: "#98c379",
      text: "#abb2bf",
      error: "#e06c75",
      errorExtra: "#be5046",
    },
  },
  {
    name: "catppuccin_mocha",
    label: "Catppuccin Mocha",
    colors: {
      background: "#1e1e2e",
      surface: "#313244",
      primary: "#cba6f7",
      secondary: "#6c7086",
      accent: "#f5c2e7",
      text: "#cdd6f4",
      error: "#f38ba8",
      errorExtra: "#d20f39",
    },
  },
  {
    name: "rose_pine",
    label: "Rosé Pine",
    colors: {
      background: "#191724",
      surface: "#1f1d2e",
      primary: "#ebbcba",
      secondary: "#908caa",
      accent: "#c4a7e7",
      text: "#e0def4",
      error: "#eb6f92",
      errorExtra: "#b4637a",
    },
  },
  {
    name: "solarized_dark",
    label: "Solarized Dark",
    colors: {
      background: "#002b36",
      surface: "#073642",
      primary: "#268bd2",
      secondary: "#586e75",
      accent: "#b58900",
      text: "#839496",
      error: "#dc322f",
      errorExtra: "#b71c1c",
    },
  },
  {
    name: "monokai_pro",
    label: "Monokai Pro",
    colors: {
      background: "#2d2a2e",
      surface: "#403e41",
      primary: "#ffd866",
      secondary: "#727072",
      accent: "#a9dc76",
      text: "#fcfcfa",
      error: "#ff6188",
      errorExtra: "#ab4059",
    },
  },
  {
    name: "matcha",
    label: "Matcha",
    colors: {
      background: "#2c3e50",
      surface: "#34495e",
      primary: "#2ecc71",
      secondary: "#7f8c8d",
      accent: "#27ae60",
      text: "#ecf0f1",
      error: "#e74c3c",
      errorExtra: "#c0392b",
    },
  },
  {
    name: "cyberpunk",
    label: "Cyberpunk",
    colors: {
      background: "#0d0221",
      surface: "#1a0b2e",
      primary: "#00ff9f",
      secondary: "#695496",
      accent: "#ff0099",
      text: "#d1f7ff",
      error: "#ff0055",
      errorExtra: "#b3003b",
    },
  },
  {
    name: "miami_nights",
    label: "Miami Nights",
    colors: {
      background: "#18181a",
      surface: "#222226",
      primary: "#e4609b",
      secondary: "#47ebb4",
      accent: "#05dfd7",
      text: "#f0f0f0",
      error: "#ff3333",
      errorExtra: "#b31212",
    },
  },
  {
    name: "light",
    label: "Light",
    colors: {
      background: "#ffffff",
      surface: "#f2f2f2",
      primary: "#007acc",
      secondary: "#999999",
      accent: "#007acc",
      text: "#333333",
      error: "#d32f2f",
      errorExtra: "#b71c1c",
    },
  },
  {
    name: "lavender",
    label: "Lavender",
    colors: {
      background: "#f5f0ff",
      surface: "#e0d0ff",
      primary: "#7c3aed",
      secondary: "#8b5cf6",
      accent: "#6d28d9",
      text: "#2e1065",
      error: "#dc2626",
      errorExtra: "#b91c1c",
    },
  },
  {
    name: "botanical",
    label: "Botanical",
    colors: {
      background: "#161b22",
      surface: "#0d1117",
      primary: "#7d9c7d",
      secondary: "#495057",
      accent: "#7d9c7d",
      text: "#e9ecef",
      error: "#e06c75",
      errorExtra: "#be5046",
    },
  },
  {
    name: "midnight",
    label: "Midnight",
    colors: {
      background: "#0b0c15",
      surface: "#151725",
      primary: "#a29bfe",
      secondary: "#565c70",
      accent: "#a29bfe",
      text: "#c0c5ce",
      error: "#ff5c57",
      errorExtra: "#ff3333",
    },
  },
  {
    name: "bushido",
    label: "Bushido",
    colors: {
      background: "#242933",
      surface: "#1b1f27",
      primary: "#ec3b5b",
      secondary: "#5d677a",
      accent: "#ec3b5b",
      text: "#ebebec",
      error: "#ec3b5b",
      errorExtra: "#c22b46",
    },
  },
];

export const defaultTheme = themes[0];
