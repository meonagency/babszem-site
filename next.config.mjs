/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Ajánlatgenerátor: a Chromium bináris ne kerüljön a bundle-be, a betűk menjenek a függvénnyel
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/api/ajanlat": ["./app/api/ajanlat/fonts/**", "./node_modules/@sparticuz/chromium/bin/**"],
  },
};

export default nextConfig;
