import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#090A0F",
        surface: "#11131F",
        "surface-2": "#151827",
        cyanx: "#00F2FE",
        azure: "#4FACFE",
        violetx: "#7F00FF",
        magenta: "#E100FF",
        emeraldx: "#00F5A0",
        hairline: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "glow-cyan": "0 0 40px -10px rgba(0, 242, 254, 0.45)",
        "glow-violet": "0 0 40px -10px rgba(127, 0, 255, 0.45)",
        card: "0 20px 60px -30px rgba(0, 0, 0, 0.8)",
      },
      backgroundImage: {
        "gradient-cyan": "linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)",
        "gradient-violet": "linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(0, 245, 160, 0.5)" },
          "50%": { opacity: "0.7", boxShadow: "0 0 0 5px rgba(0, 245, 160, 0)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(400%)" },
        },
        "flow-dash": {
          to: { "stroke-dashoffset": "-24" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 2.4s ease-in-out infinite",
        blink: "blink 1.1s step-end infinite",
        scanline: "scanline 5s linear infinite",
        "flow-dash": "flow-dash 1.2s linear infinite",
        shimmer: "shimmer 4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
