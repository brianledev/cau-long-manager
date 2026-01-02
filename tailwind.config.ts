import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(210 40% 98%)",
        foreground: "hsl(222 47% 11%)",
        card: "hsl(0 0% 100%)",
        "card-foreground": "hsl(222 47% 11%)",
        popover: "hsl(0 0% 100%)",
        "popover-foreground": "hsl(222 47% 11%)",
        primary: "hsl(217 91% 60%)",
        "primary-foreground": "hsl(210 40% 98%)",
        secondary: "hsl(210 40% 96.1%)",
        "secondary-foreground": "hsl(222 47% 11%)",
        muted: "hsl(210 40% 96.1%)",
        "muted-foreground": "hsl(215 16% 47%)",
        accent: "hsl(210 40% 96.1%)",
        "accent-foreground": "hsl(222 47% 11%)",
        destructive: "hsl(0 84.2% 60.2%)",
        "destructive-foreground": "hsl(210 40% 98%)",
        border: "hsl(214 32% 91%)",
        input: "hsl(214 32% 91%)",
        ring: "hsl(222 84% 4.9%)",
      },
      borderRadius: {
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
