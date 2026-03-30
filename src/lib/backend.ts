export function getBackendBaseUrl(): string {
  const configuredUrl = (import.meta.env.VITE_BACKEND_URL || "").trim();

  if (configuredUrl && configuredUrl !== "/") {
    return configuredUrl.endsWith("/") ? configuredUrl.slice(0, -1) : configuredUrl;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}

export function buildBackendUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = getBackendBaseUrl();

  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}
