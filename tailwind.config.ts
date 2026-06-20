import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        foreground: "#0F172A",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        primary: {
          DEFAULT: "#16A34A",
          foreground: "#FFFFFF",
          hover: "#15803D",
        },
        success: {
          DEFAULT: "#22C55E",
          foreground: "#FFFFFF",
        },
        danger: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#FFFFFF",
        },
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },
        border: "#E2E8F0",
        input: "#E2E8F0",
        ring: "#16A34A",
      },
      borderRadius: {
        lg: "20px",
        md: "16px",
        sm: "12px",
      },
      boxShadow: {
        premium: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 10px -1px rgba(15, 23, 42, 0.03)",
        "premium-hover": "0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 14px -2px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
