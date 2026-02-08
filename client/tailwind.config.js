/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'spy-green': '#00ff41',
                'spy-red': '#ff0000',
                'spy-yellow': '#ffcc00',
                'spy-blue': '#00d4ff',
                'terminal-green': '#00ff41',
                'dark-bg': '#0a0a0a',
                'dark-panel': '#111111',
                'dark-border': '#1a1a1a',
            },
        },
    },
}
