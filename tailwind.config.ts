import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#080B10",
          900: "#0B0F14",
          850: "#0F141B",
          800: "#141A23",
          700: "#1B222D",
          600: "#232B38",
          500: "#323C4B",
        },
        ink: {
          100: "#E7ECF3",
          300: "#B7C1D1",
          500: "#7C8AA0",
          700: "#4E5A6E",
        },
        signal: {
          DEFAULT: "#38E1C6",
          dim: "#1F8F7C",
          soft: "rgba(56, 225, 198, 0.12)",
        },
        ember: {
          DEFAULT: "#F5A623",
          soft: "rgba(245, 166, 35, 0.12)",
        },
        danger: "#EF5A5A",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 0 rgba(255,255,255,0.03) inset, 0 20px 60px -20px rgba(0,0,0,0.6)",
        glow: "0 0 0 1px rgba(56,225,198,0.25), 0 0 24px rgba(56,225,198,0.15)",
      },
      keyframes: {
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        blink: "blink 1s step-start infinite",
        rise: "rise 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
