/// <reference types="vitest/config" />
import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import devtoolsJson from "vite-plugin-devtools-json"

export default defineConfig({
  plugins: [
    tailwindcss(),
    !process.env.VITEST && reactRouter(),
    devtoolsJson()
  ],
  resolve: {
    tsconfigPaths: true
  },
  test: {
    globals: true,
    environment: "node",
    include: [
      "src/**/*.{test,spec}.{js,ts,jsx,tsx}",
      "app/**/*.{test,spec}.{js,ts,jsx,tsx}"
    ]
  },
  server: {
    port: Number(process.env.PORT) || 3000
  },
  ssr: {
    noExternal: ["react-spinners"]
  }
})
