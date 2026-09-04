import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF9F5",
        paper2: "#F1EFE8",
        ink: "#1A1915",
        ink2: "#6B675E",
        ink3: "#8F887C",
        line: "rgba(26,25,21,0.14)",
        accent: "#B4442C",
        accentdeep: "#8F3620",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      spacing: {
        section: "7rem",
      },
    },
  },
  plugins: [],
};

export default config;
