// Cookie consent state, stored in a first-party cookie so the server can read it too.

export const CONSENT_COOKIE = "hhe_consent";
export const CONSENT_CHANGE_EVENT = "hhe-consent-change";
export const OPEN_COOKIE_SETTINGS_EVENT = "hhe-open-cookie-settings";

export type ConsentValue = "accepted" | "declined";

export function getConsent(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split(/;\s*/)
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);
  return raw === "accepted" || raw === "declined" ? raw : null;
}

export function setConsent(value: ConsentValue) {
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${180 * 24 * 60 * 60}; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent<ConsentValue>(CONSENT_CHANGE_EVENT, { detail: value }));
}

/** Re-open the cookie banner (used by the "Cookie settings" link in the footer). */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
}
