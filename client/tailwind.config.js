/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        appBg: "#FAFAF8",
        appSurface: "#FFFFFF",
        appSidebar: "#F5F5F2",
        appBorder: "#E7E5E4",
        appPrimary: {
          DEFAULT: "#6D5BD0",
          hover: "#5B4BC0",
          light: "#F3F1FC",
        },
        appSuccess: "#22A06B",
        appWarning: "#F59E0B",
        appDanger: "#DC2626",
        appTextPrimary: "#1F2937",
        appTextSecondary: "#6B7280",
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
        hover: "0 10px 15px -3px rgba(109, 91, 208, 0.04), 0 4px 6px -4px rgba(109, 91, 208, 0.04)",
      }
    },
  },
  plugins: [],
};


