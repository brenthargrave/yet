interface ImportMeta {
  env: {
    VITE_API_ENV: "dev" | "test" | "prod"
    VITE_HOST: string
    VITE_SENTRY_DSN: string
    VITE_SENTRY_DEBUG?: boolean
    VITE_LOG?: boolean
  }
}
