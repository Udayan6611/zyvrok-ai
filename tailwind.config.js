/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./legal.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.html"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "base": "#09090b",
        "surface": "#111116",
        "surface-elevated": "#181820",
        "subtle": "#181822",
        "subtle-hover": "#22222e",
        "border-crisp": "rgba(255, 255, 255, 0.08)",
        "border-highlight": "rgba(255, 255, 255, 0.16)",
        "text-primary": "#fafafa",
        "text-secondary": "#a1a1aa",
        "text-muted": "#71717a",
        "primary": "#3b82f6",
        "primary-container": "#2563eb",
        "primary-subtle": "rgba(59, 130, 246, 0.15)",
        "accent": "#10b981",
        "accent-subtle": "rgba(16, 185, 129, 0.15)"
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      }
    }
  },
  plugins: []
};
