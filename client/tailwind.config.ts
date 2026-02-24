/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            boxShadow: {
                'orb': 'inset 0 -10px 20px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.1)'
            }
        },
    },
    plugins: [],
}
