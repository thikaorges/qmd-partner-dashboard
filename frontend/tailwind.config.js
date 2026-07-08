/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        navy: "#0D1B2A",
        gold: "#C9A84C",
        border: "hsl(var(--border, 220 13% 91%))",
        input: "hsl(var(--input, 220 13% 91%))",
        ring: "hsl(var(--ring, 224 71% 45%))",
        background: "hsl(var(--background, 0 0% 100%))",
        foreground: "hsl(var(--foreground, 224 71% 4%))",
        primary: {
          DEFAULT: "hsl(var(--primary, 224 71% 4%))",
          foreground: "hsl(var(--primary-foreground, 210 20% 98%))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary, 220 14% 96%))",
          foreground: "hsl(var(--secondary-foreground, 220 9% 46%))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive, 0 84% 60%))",
          foreground: "hsl(var(--destructive-foreground, 210 20% 98%))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted, 220 14% 96%))",
          foreground: "hsl(var(--muted-foreground, 220 9% 46%))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent, 220 14% 96%))",
          foreground: "hsl(var(--accent-foreground, 224 71% 4%))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover, 0 0% 100%))",
          foreground: "hsl(var(--popover-foreground, 224 71% 4%))",
        },
        card: {
          DEFAULT: "hsl(var(--card, 0 0% 100%))",
          foreground: "hsl(var(--card-foreground, 224 71% 4%))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
