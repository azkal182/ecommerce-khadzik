export interface StoreTheme {
  primary?: string;
  secondary?: string;
  accent?: string;
  bg?: string;
  fg?: string;
  muted?: string;
  border?: string;
  card?: string;
  'card-foreground'?: string;
}

export function storeThemeToCssVars(theme: StoreTheme | null): Record<string, string> {
  return {
    '--color-primary': theme?.primary ?? '#3b82f6',
    '--color-secondary': theme?.secondary ?? '#1d4ed8',
    '--color-accent': theme?.accent ?? '#f59e0b',
    '--color-bg': theme?.bg ?? '#ffffff',
    '--color-fg': theme?.fg ?? '#111827',
    '--color-muted': theme?.muted ?? '#6b7280',
    '--color-border': theme?.border ?? '#e5e7eb',
    '--color-card': theme?.card ?? '#ffffff',
    '--color-card-foreground': theme?.['card-foreground'] ?? '#111827',
  };
}

export function applyStoreTheme(storeSlug: string | null): void {
  if (typeof document === 'undefined') return;

  const body = document.body;

  // Remove existing store theme classes
  body.removeAttribute('data-store');

  // Apply new store theme if provided
  if (storeSlug) {
    body.setAttribute('data-store', storeSlug);
  }
}