const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      transitionDuration: {
        "5000": "5000ms",
        "800": "800ms",
      },
    },
  },
  plugins: [
    // flowbite.plugin(), // currently not necessary and it changes the colours, thus commented out
    require("@tailwindcss/forms"),
  ],
  darkMode: "class"
}

