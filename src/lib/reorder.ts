/**
 * Shared payload shape for drag-and-drop reordering.
 *
 * Both `PATCH /api/menus` and `PATCH /api/menus/[menuId]/pages` accept
 * `{ items: [{ id, order }] }` and write it in a single bulk operation, so a
 * drag that shifts twenty rows costs one request rather than twenty.
 */

export type ReorderItem = { id: string; order: number }

export type ParseResult =
  | { ok: true; items: ReorderItem[] }
  | { ok: false; error: string }

const OBJECT_ID = /^[a-f\d]{24}$/i

export function parseReorderPayload(body: unknown): ParseResult {
  const items = (body as { items?: unknown } | null)?.items

  if (!Array.isArray(items)) {
    return { ok: false, error: "Expected { items: [{ id, order }] }." }
  }

  if (items.length === 0) {
    return { ok: false, error: "No items to reorder." }
  }

  // Cap the batch so a malformed or hostile client can't queue an unbounded
  // bulkWrite against the database.
  if (items.length > 500) {
    return { ok: false, error: "Too many items in one reorder." }
  }

  const parsed: ReorderItem[] = []

  for (const item of items) {
    const id = (item as ReorderItem)?.id
    const order = (item as ReorderItem)?.order

    if (typeof id !== "string" || !OBJECT_ID.test(id) || !Number.isInteger(order)) {
      return { ok: false, error: "Every item needs a valid id and integer order." }
    }

    parsed.push({ id, order })
  }

  const unique = new Set(parsed.map((i) => i.id))
  if (unique.size !== parsed.length) {
    return { ok: false, error: "Duplicate ids in reorder payload." }
  }

  return { ok: true, items: parsed }
}
