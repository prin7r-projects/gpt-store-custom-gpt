import type { Config } from "tailwindcss";

/**
 * [SERIOUSSEQUEL_LANDING] Tailwind config for the SeriousSequel GPT-Store-handoff landing.
 * Brand DNA: "transcript-paper" — warm white + ink + saffron highlighter.
 * Typography: Source Serif 4 (display) / Inter (body) / JetBrains Mono (transcript).
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Paper — warm off-white, slightly cream
        paper: {
          DEFAULT: "#FFFFFF",
          50: "#FCF9F2",
          100: "#FFFFFF",
          200: "#F4F2EE",
          300: "#E5DBC4",
          400: "#CFC2A4"
        },
        // Ink — true reading black with a hint of warmth
        ink: {
          DEFAULT: "#161513",
          900: "#161513",
          800: "#26241F",
          700: "#3A372F",
          600: "#5C5749",
          500: "#7A7464",
          400: "#A09A88",
          300: "#C7C0AD"
        },
        // Saffron — single accent, used like a real highlighter
        saffron: {
          DEFAULT: "#E8A82B",
          50: "#FFF6DD",
          100: "#FBE8AE",
          200: "#F5CF6A",
          300: "#E8A82B",
          400: "#C68A1A",
          500: "#996811"
        },
        // Reader — secondary serif tint (notes, meta, citations)
        reader: {
          DEFAULT: "#7A7464",
          warm: "#8A7C5A"
        },
        // Box — pale neutral lines on paper
        rule: "#E5DBC4"
      },
      fontFamily: {
        // Display: serif transitional for sentence-like headlines
        serif: ['"Source Serif 4"', '"Source Serif Pro"', "Georgia", "serif"],
        // Body: clean modern sans
        sans: ['Inter', '"Inter Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        // Transcript: monospace for the conversation card framing
        mono: ['"JetBrains Mono"', '"Fira Code"', "ui-monospace", "Menlo", "monospace"]
      },
      fontSize: {
        // Display sizes for the serif headlines
        "display-1": ["clamp(2.4rem, 5vw, 4.25rem)", { lineHeight: "1.04", letterSpacing: "-0.022em" }],
        "display-2": ["clamp(1.75rem, 3.4vw, 2.75rem)", { lineHeight: "1.08", letterSpacing: "-0.018em" }],
        "display-3": ["clamp(1.4rem, 2.4vw, 1.9rem)", { lineHeight: "1.18", letterSpacing: "-0.012em" }]
      },
      borderRadius: {
        sheet: "10px",
        card: "16px",
        pill: "999px"
      },
      boxShadow: {
        sheet: "0 1px 0 rgba(22,21,19,0.04), 0 12px 32px -16px rgba(22,21,19,0.18)",
        deck: "0 1px 0 rgba(22,21,19,0.06), 0 30px 60px -30px rgba(22,21,19,0.22)",
        marker: "inset 0 -0.45em 0 rgba(232,168,43,0.42)"
      },
      maxWidth: {
        column: "62ch",
        wide: "88ch",
        page: "1180px"
      },
      transitionTimingFunction: {
        page: "cubic-bezier(0.2, 0.8, 0.2, 1)"
      }
    }
  },
  plugins: []
};

export default config;
