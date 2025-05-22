import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#F8FAFC",
          light: "#FFFFFF",
          dark: "#0F172A",
        },
        text: {
          DEFAULT: "#334155",
          light: "#64748B",
          dark: "#F8FAFC",
          muted: "#94A3B8",
        },
        primary: {
          DEFAULT: "#3B82F6",
          light: "#60A5FA",
          dark: "#2563EB",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#6366F1",
          light: "#818CF8",
          dark: "#4F46E5",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#059669",
          foreground: "#FFFFFF",
        },
        border: {
          DEFAULT: "#E2E8F0",
          light: "#F1F5F9",
          dark: "#334155",
        },
        error: {
          DEFAULT: "#EF4444",
          light: "#F87171",
          dark: "#DC2626",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#059669",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FBBF24",
          dark: "#D97706",
          foreground: "#FFFFFF",
        },
        black: "#000000",
        white: "#FFFFFF",
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config; 