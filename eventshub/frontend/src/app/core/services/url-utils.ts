export function resolveCodespacesServiceUrl(port: number): string {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  if (hostname.endsWith('.app.github.dev')) {
    const baseHost = hostname.replace(/-\d+\.app\.github\.dev$/, '');
    return `${protocol}//${baseHost}-${port}.app.github.dev`;
  }

  return `${protocol}//${hostname}:${port}`;
}
