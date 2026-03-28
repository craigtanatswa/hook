/** Zimbabwe (+263): local mobiles start with 0 (e.g. 07…). */

export function normalizePhoneE164(raw: string): string {
  const s = raw.trim().replace(/\s/g, "");
  if (!s) return "";
  if (s.startsWith("+263")) return s;
  if (/^0[17]\d{8}$/.test(s)) return "+263" + s.slice(1);
  if (/^263\d{9}$/.test(s)) return "+" + s;
  return raw.trim();
}

/** Digits only for https://wa.me/{digits} (no +). */
export function normalizeWhatsappDigits(raw: string): string {
  const s = raw.trim().replace(/\s/g, "");
  if (!s) return "";
  if (s.startsWith("+263")) return s.replace("+", "").replace(/\D/g, "");
  if (/^0[17]\d{8}$/.test(s)) return "263" + s.slice(1);
  if (/^263\d{9}$/.test(s)) return s.replace(/\D/g, "");
  return s.replace(/\D/g, "");
}

export function telHref(phone: string): string {
  const e164 = normalizePhoneE164(phone);
  const digits = e164.replace(/\D/g, "");
  if (digits.startsWith("263")) return `tel:+${digits}`;
  if (e164.startsWith("+")) return `tel:${e164}`;
  return `tel:${phone.trim()}`;
}
