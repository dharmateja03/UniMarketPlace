import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "[data-theme='dark']"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  // Prefix to avoid conflicts with existing custom CSS
  prefix: "",
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--accent)",
        background: "var(--bg)",
        foreground: "var(--ink)",
        primary: {
          DEFAULT: "var(--accent)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "var(--accent-2)",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--border)",
          foreground: "var(--muted)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "var(--panel)",
          foreground: "var(--ink)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius-sm)",
        sm: "6px",
      },
      fontFamily: {
        sans: ["var(--font-body)", "sans-serif"],
        display: ["var(--font-display)", "serif"],
      },
    },
  },
  // Don't include Tailwind's base reset — we have our own in globals.css
  corePlugins: {
    preflight: false,
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
