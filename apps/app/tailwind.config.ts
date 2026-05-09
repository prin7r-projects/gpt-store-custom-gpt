import type { Config } from "tailwindcss";

/**
 * SeriousSequel App — Tailwind config.
 * Brand DNA: ink + paper + saffron accent (dashboard-restrained).
 * DESIGN.md tokens govern; no orange/coral/purple/violet.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(0 0% 100%)",
        foreground: "hsl(30 10% 7%)",
        card: {
          DEFAULT: "hsl(40 10% 98%)",
          foreground: "hsl(30 10% 7%)",
        },
        popover: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(30 10% 7%)",
        },
        primary: {
          DEFAULT: "hsl(30 10% 7%)",
          foreground: "hsl(0 0% 100%)",
        },
        secondary: {
          DEFAULT: "hsl(42 10% 93%)",
          foreground: "hsl(30 10% 7%)",
        },
        muted: {
          DEFAULT: "hsl(42 10% 93%)",
          foreground: "hsl(36 4% 46%)",
        },
        accent: {
          DEFAULT: "hsl(42 76% 53%)",
          foreground: "hsl(30 10% 7%)",
        },
        destructive: {
          DEFAULT: "hsl(0 72% 51%)",
          foreground: "hsl(0 0% 100%)",
        },
        border: "hsl(42 20% 88%)",
        input: "hsl(42 20% 88%)",
        ring: "hsl(42 76% 53%)",
        // DESIGN.md explicit tokens
        paper: {
          DEFAULT: "#FFFFFF",
          100: "#FFFFFF",
          200: "#F4F2EE",
          300: "#E5DBC4",
        },
        ink: {
          DEFAULT: "#161513",
          900: "#161513",
          800: "#26241F",
        },
        saffron: {
          DEFAULT: "#E8A82B",
          300: "#E8A82B",
        },
        reader: {
          DEFAULT: "#7A7464",
        },
        rule: "#E5DBC4",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        sheet: "10px",
        card: "16px",
      },
      fontFamily: {
        sans: ['Inter', '"Inter Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "ui-monospace", "Menlo", "monospace"],
      },
      keyframes: {
        "caret-pulse": {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
      },
      animation: {
        "caret-pulse": "caret-pulse 1.05s steps(1, end) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
