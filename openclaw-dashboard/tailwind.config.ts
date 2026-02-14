import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        background: "hsl(0 0% 3.5%)",
        foreground: "hsl(0 0% 98%)",
        card: {
          DEFAULT: "hsl(0 0% 5%)",
          foreground: "hsl(0 0% 98%)",
        },
        popover: {
          DEFAULT: "hsl(0 0% 5%)",
          foreground: "hsl(0 0% 98%)",
        },
        primary: {
          DEFAULT: "hsl(195 100% 50%)",
          foreground: "hsl(0 0% 5%)",
        },
        secondary: {
          DEFAULT: "hsl(0 0% 10%)",
          foreground: "hsl(0 0% 98%)",
        },
        muted: {
          DEFAULT: "hsl(0 0% 10%)",
          foreground: "hsl(0 0% 60%)",
        },
        accent: {
          DEFAULT: "hsl(0 0% 10%)",
          foreground: "hsl(0 0% 98%)",
        },
        destructive: {
          DEFAULT: "hsl(0 70% 50%)",
          foreground: "hsl(0 0% 98%)",
        },
        border: "hsl(0 0% 15%)",
        input: "hsl(0 0% 15%)",
        ring: "hsl(195 100% 50%)",
        success: "hsl(150 60% 45%)",
        warning: "hsl(45 90% 55%)",
        error: "hsl(0 70% 55%)",
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      backdropBlur: {
        xl: "24px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
