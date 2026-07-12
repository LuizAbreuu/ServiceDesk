const DEFAULT_DEV_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "https://service-desk-gules.vercel.app",
];

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readAllowedOrigins(): string[] {
  const configured = process.env.ALLOWED_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured && configured.length > 0) {
    return configured;
  }

  return process.env.NODE_ENV === "production" ? [] : DEFAULT_DEV_ORIGINS;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: readRequiredEnv("JWT_SECRET"),
  allowedOrigins: readAllowedOrigins(),
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 10),
  authRateLimitWindowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  apiRateLimitMax: Number(process.env.API_RATE_LIMIT_MAX ?? 300),
  apiRateLimitWindowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
};

export function isOriginAllowed(origin?: string): boolean {
  if (!origin) {
    return true;
  }

  return env.allowedOrigins.includes(origin);
}
