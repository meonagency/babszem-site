// Biztonsági fejlécek. A böngésző nem hív harmadik felet (a Places hívás szerveroldali),
// ezért a CSP szigorú; a Next beágyazott szkriptjei miatt a script-src 'unsafe-inline'-t kap.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    // A képek és a logó neve a méretet tartalmazza: 30 napig gyorsítótárazhatók, utána háttérben frissülnek
    const staticCache = [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=604800" }];
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/fotok/:path*", headers: staticCache },
      { source: "/veluma/:path*", headers: staticCache },
      { source: "/veluma-logo.svg", headers: staticCache },
    ];
  },
  // Ajánlatgenerátor: a Chromium bináris ne kerüljön a bundle-be, a betűk menjenek a függvénnyel
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/api/ajanlat": ["./app/api/ajanlat/fonts/**", "./node_modules/@sparticuz/chromium/bin/**"],
  },
};

export default nextConfig;
