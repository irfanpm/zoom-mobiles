/**
 * Open a URL in a new tab as reliably as possible from a user-gesture handler.
 *
 * `window.open` is frequently caught by popup blockers. A synthetic anchor
 * click is treated as a genuine user navigation and is almost never blocked.
 * If even that fails, we fall back to navigating the current tab so the link
 * always works (the customer can hit back to return).
 */
export function openExternal(url: string) {
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    // Last resort — same-tab navigation (never blocked)
    window.location.href = url;
  }
}
