import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Il progetto si traccia da sé: senza questo, un lockfile in una cartella
  // superiore farebbe scegliere a Next la radice sbagliata.
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  experimental: {
    // Le Server Action ricevono i form di contatto e il pannello annunci.
    serverActions: { bodySizeLimit: '8mb' },
  },
}

export default nextConfig
