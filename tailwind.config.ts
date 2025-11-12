import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

const config: Config = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './@@@/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            transitionDuration: {
                1200: '1200ms',
                1500: '1500ms',
                3000: '3000ms',
            },
            transitionDelay: {
                2000: '2000ms',
                3000: '3000ms',
            },
        },
    },
    plugins: [forms],
};

export default config;
