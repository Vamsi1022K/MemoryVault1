/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        appBg: "#FAF8FC",
        appSurface: "#FFFFFF",
        appMuted: "#F2F3F5",
        appBorder: "#E5E7EB",
        appPrimary: {
          DEFAULT: "#8B5CF6",
          hover: "#7C3AED",
          light: "#F5F3FF",
        },
        appSecondary: "#F59E0B",
        appSuccess: "#22C55E",
        appTextPrimary: "#111827",
        appTextSecondary: "#6B7280",
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
        hover: "0 10px 15px -3px rgba(139, 92, 246, 0.05), 0 4px 6px -4px rgba(139, 92, 246, 0.05)",
      }
    },
  },
  plugins: [],
};

