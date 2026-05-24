/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["192.168.1.3:3000", "localhost:3000"]
    }
  }
}
module.exports = nextConfig
