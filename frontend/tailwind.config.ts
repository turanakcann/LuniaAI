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
        lunia: {
          bg: "var(--color-lunia-bg)",
          sidebar: "var(--color-lunia-sidebar)",
          card: "var(--color-lunia-card)",
          border: "var(--color-lunia-border)",
          text: "var(--color-lunia-text)",
          muted: "var(--color-lunia-muted)",
          accent: "var(--color-lunia-accent)",
        }
      }
    },
  },
  plugins: [],
};
export default config;