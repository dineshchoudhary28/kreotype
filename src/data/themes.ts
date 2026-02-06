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
      secondary: "#94a3b8",
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
      secondary: "#64748b",
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
      secondary: "#919599",
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
      secondary: "#919191",
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
      surface: "#1e1f29",
      primary: "#bd93f9",
      secondary: "#94a3b8",
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
      surface: "#242933",
      primary: "#88c0d0",
      secondary: "#94a3b8",
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
      surface: "#1d2021",
      primary: "#d79921",
      secondary: "#a89984",
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
      surface: "#16161e",
      primary: "#7aa2f7",
      secondary: "#787c99",
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
      secondary: "#828997",
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
      surface: "#181825",
      primary: "#cba6f7",
      secondary: "#9399b2",
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
      secondary: "#839496",
      accent: "#b58900",
      text: "#93a1a1",
      error: "#dc322f",
      errorExtra: "#b71c1c",
    },
  },
  {
    name: "monokai_pro",
    label: "Monokai Pro",
    colors: {
      background: "#2d2a2e",
      surface: "#221f22",
      primary: "#ffd866",
      secondary: "#939293",
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
      surface: "#22313f",
      primary: "#2ecc71",
      secondary: "#95a5a6",
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
      surface: "#050112",
      primary: "#00ff9f",
      secondary: "#947bc4",
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
      surface: "#0f0f10",
      primary: "#e4609b",
      secondary: "#8899a6",
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
      secondary: "#64748b",
      accent: "#007acc",
      text: "#1e293b",
      error: "#d32f2f",
      errorExtra: "#b71c1c",
    },
  },
  {
    name: "lavender",
    label: "Lavender",
    colors: {
      background: "#f5f0ff",
      surface: "#ebe4ff",
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
      secondary: "#8b949e",
      accent: "#7d9c7d",
      text: "#e6edf3",
      error: "#f85149",
      errorExtra: "#da3633",
    },
  },
  {
    name: "midnight",
    label: "Midnight",
    colors: {
      background: "#0b0c15",
      surface: "#05060b",
      primary: "#a29bfe",
      secondary: "#7e8492",
      accent: "#a29bfe",
      text: "#c9d1d9",
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
      secondary: "#94a3b8",
      accent: "#ec3b5b",
      text: "#eceff4",
      error: "#ec3b5b",
      errorExtra: "#c22b46",
    },
  },
];

export const defaultTheme = themes[0];
