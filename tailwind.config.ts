import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"]
      },
      colors: {
        ink: "#171717",
        fog: "#f7f3ee",
        blush: "#e7d9cf",
        moss: "#2e3f39",
        dusk: "#7f6f66",
        ember: "#b35d3d"
      },
      boxShadow: {
        card: "0 20px 50px -30px rgba(23, 23, 23, 0.35)"
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, rgba(0,0,0,0) 0), radial-gradient(circle at 2px 3px, rgba(0,0,0,0.04) 1px, rgba(0,0,0,0) 0)"
      }
    }
  },
  plugins: []
};

export default config;
