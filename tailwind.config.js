/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "base": "#F9FAFB",
        "surface": "#FFFFFF",
        "subtle": "#F3F4F6",
        "subtle-hover": "#E5E7EB",
        "border-crisp": "#E5E7EB",
        "border-highlight": "#D1D5DB",
        "text-primary": "#111827",
        "text-secondary": "#4B5563",
        "text-muted": "#9CA3AF",
        "primary": "#2563EB",
        "primary-container": "#1D4ED8",
        "primary-subtle": "#EFF6FF",
        "accent": "#10B981",
        "accent-subtle": "#ECFDF5",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      animation: {
        "shimmer": "shimmer 2s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spotlight": "spotlight 2s ease .75s 1 forwards",
      },
      keyframes: {
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        spotlight: {
          "0%": { opacity: 0, transform: "translate(-72%, -62%) scale(0.5)" },
          "100%": { opacity: 1, transform: "translate(-50%,-40%) scale(1)" },
        },
      },
    },
  },
  plugins: [],
}
