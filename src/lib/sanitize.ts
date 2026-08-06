import DOMPurify from "isomorphic-dompurify"

/**
 * Sanitize admin-authored HTML before it reaches dangerouslySetInnerHTML.
 *
 * The content comes from Tiptap and an authenticated admin, but "authenticated"
 * is not the same as "trusted" — a stored XSS here would run on every visitor's
 * browser. Always pass rich text through this, never render it raw.
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return ""

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "mark",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "blockquote", "code", "pre",
      "a", "img",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td",
      "span", "div",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title", "colspan", "rowspan"],
    // Block javascript: and data: URIs in href/src.
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|#|\/)/i,
    ADD_ATTR: ["target"],
  })
}
