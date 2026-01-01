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
                pop: {
                    pink: '#FF6B6B', // Coral Pink
                    yellow: '#FFD93D', // Vivid Yellow
                    blue: '#4D96FF', // Sky Blue
                    green: '#6BCB77', // Pastel Green
                }
            },
            borderRadius: {
                'pop': '1rem',
                'pop-lg': '1.5rem',
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            boxShadow: {
                'pop': '8px 8px 0px 0px rgba(0,0,0,1)',
                'pop-md': '4px 4px 0px 0px rgba(0,0,0,1)',
                'pop-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
            },
        },
    },
    plugins: [],
};
export default config;

