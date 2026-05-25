/* ====================================================================
   tailwind.config.ts — Press Accreditations · Linear/Vercel redesign
   Drop in at project root to replace the current config.
   Pairs with src/index.css that defines the HSL tokens.
   ==================================================================== */

import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  // Dark is the default; explicitly opt-in light on public pages with `.light`.
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1440px",
      },
    },

    // Custom breakpoints — explicit mobile / tablet / desktop / wide
    screens: {
      sm: "480px",   // large phone
      md: "768px",   // tablet
      lg: "1024px",  // small laptop
      xl: "1280px",  // desktop
      "2xl": "1440px",
      "3xl": "1760px", // wide / dashboards on big monitors
    },

    extend: {
      fontFamily: {
        sans: ['"Geist"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"Geist Mono"', "ui-monospace", "SF Mono", "Menlo", "monospace"],
        display: ['"Geist"', "ui-sans-serif", "sans-serif"],
        serif: ['"Instrument Serif"', '"Times New Roman"', "serif"],
      },

      colors: {
        // Surfaces
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Hairlines (use as text-hairline / border-hairline via opacity)
        hairline:   "hsl(var(--hairline))",
        "hairline-1": "hsl(var(--hairline-1))",
        "hairline-2": "hsl(var(--hairline-2))",

        // Tokens
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
      },

      // Tighter radius scale (Linear-style)
      borderRadius: {
        none: "0",
        xs: "4px",
        sm: "calc(var(--radius) - 4px)", // 4
        md: "calc(var(--radius) - 2px)", // 6
        lg: "var(--radius)",             // 8
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
        full: "9999px",
      },

      // Letter-spacing tuned to Geist
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.025em",
        snug: "-0.015em",
        normal: "-0.005em", // body
        wide: "0.02em",
        wider: "0.05em",
        widest: "0.08em",   // overline/mono labels
      },

      fontSize: {
        // Compact UI sizes (matches Linear/Vercel density)
        "2xs": ["10px", { lineHeight: "1.4", letterSpacing: "0.04em" }],
        xs: ["11.5px", { lineHeight: "1.45" }],
        sm: ["12.5px", { lineHeight: "1.5" }],
        base: ["13.5px", { lineHeight: "1.5" }],
        md: ["14px", { lineHeight: "1.5" }],
        lg: ["16px", { lineHeight: "1.45" }],
        xl: ["18px", { lineHeight: "1.35" }],
        "2xl": ["22px", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "3xl": ["28px", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        "4xl": ["36px", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "5xl": ["48px", { lineHeight: "1", letterSpacing: "-0.035em" }],
        "6xl": ["64px", { lineHeight: "0.98", letterSpacing: "-0.04em" }],
        "7xl": ["88px", { lineHeight: "0.96", letterSpacing: "-0.045em" }],
      },

      boxShadow: {
        // Soft modern shadows
        soft:        "0 1px 2px hsl(var(--background) / 0.04), 0 0 0 1px hsl(var(--hairline))",
        card:        "0 1px 0 hsl(var(--hairline)), 0 6px 24px -10px hsl(0 0% 0% / 0.40)",
        "card-hover":"0 1px 0 hsl(var(--hairline)), 0 12px 36px -10px hsl(0 0% 0% / 0.55)",
        glow:        "0 0 0 1px hsl(var(--primary)), 0 8px 28px -8px hsl(var(--primary) / 0.4)",
        "glow-soft": "0 0 0 1px hsl(var(--primary) / 0.4), 0 0 32px -8px hsl(var(--primary) / 0.3)",
        "inner-hair":"inset 0 0 0 1px hsl(var(--hairline))",
        none: "none",
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
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-live": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--success) / 0.6)" },
          "50%":      { boxShadow: "0 0 0 6px hsl(var(--success) / 0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "scale-in": {
          "0%":   { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in":  "fade-in 0.32s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-up":  "fade-up 0.32s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pulse-live": "pulse-live 1.6s ease-out infinite",
        "shimmer":  "shimmer 1.6s linear infinite",
        "scale-in": "scale-in 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
      },

      backgroundImage: {
        "grid":    "linear-gradient(to right, hsl(var(--hairline)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--hairline)) 1px, transparent 1px)",
        "accent":  "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
        "aurora":  "radial-gradient(80% 60% at 50% 0%, hsl(var(--primary) / 0.35), transparent 70%), radial-gradient(60% 50% at 80% 100%, hsl(var(--secondary) / 0.18), transparent 70%)",
      },
      backgroundSize: {
        "grid-56": "56px 56px",
        "grid-28": "28px 28px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
