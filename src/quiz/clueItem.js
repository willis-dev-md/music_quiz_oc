/**
 * Normalizes a Connections clue or Sequences item slot from quiz.json.
 * Supports plain strings (backward compatible) or objects with optional image.
 *
 * @param {string | Record<string, unknown> | null | undefined} raw
 * @returns {{ kind: 'text'|'image'|'mixed', text?: string, src?: string, alt: string, caption?: string }}
 */
export function normalizeSlot(raw) {
  if (raw == null || raw === '') {
    return { kind: 'text', text: '', alt: '' };
  }
  if (typeof raw === 'string') {
    return { kind: 'text', text: raw, alt: '' };
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const src = raw.image ?? raw.src ?? raw.url;
    const text =
      typeof raw.text === 'string'
        ? raw.text
        : raw.label != null
          ? String(raw.label)
          : '';
    const caption =
      typeof raw.caption === 'string' ? raw.caption : undefined;
    const alt =
      typeof raw.alt === 'string'
        ? raw.alt
        : caption || text || 'Image';

    if (src && text) {
      return { kind: 'mixed', src: String(src), alt, text, caption };
    }
    if (src) {
      return { kind: 'image', src: String(src), alt, caption };
    }
    if (text) {
      return { kind: 'text', text, alt: '' };
    }
    return { kind: 'text', text: '', alt: '' };
  }
  return { kind: 'text', text: String(raw), alt: '' };
}
