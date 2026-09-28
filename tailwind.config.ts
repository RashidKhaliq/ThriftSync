import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc8fb",
          400: "#36a9f7",
          500: "#0c8de9",
          600: "#026fc7",
          700: "#0359a2",
          800: "#074c85",
          900: "#0c3f6e",
          950: "#082849",
        },
        thrift: {
          amber: "#f59e0b",
          emerald: "#10b981",
          rose: "#f43f5e",
          indigo: "#6366f1",
          purple: "#8b5cf6",
          dark: "#0f172a",
          card: "#1e293b",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(99, 102, 241, 0.4)" },
          "100%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.8)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
