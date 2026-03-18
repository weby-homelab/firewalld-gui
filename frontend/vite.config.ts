import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["firewalld-gui.srvrs.top", "niftywall.srvrs.top"],
    host: true,
    port: 5173
  }
})
