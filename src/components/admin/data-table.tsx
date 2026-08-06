"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ArrowUpDown, GripVertical, Search } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"

/**
 * Shared admin table, backed by TanStack Table **v8** (see CLAUDE.md — v9 is a
 * full API rewrite and this file targets v8 deliberately).
 *
 * Pass `onReorder` to turn on drag-and-drop ordering. When it's set the table
 * renders a grip column, and column sorting is suppressed — a list you can drag
 * into a manual order and simultaneously sort by title would show one order and
 * save another.
 */

function DragHandle({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, isDragging } = useSortable({ id })

  return (
    <button
      type="button"
      // Listeners live on the handle, not the row, so buttons and links inside
      // the row stay clickable.
      {...attributes}
      {...listeners}
      aria-label={`Reorder ${label}`}
      className={cn(
        "flex size-7 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground",
        "hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
        isDragging && "cursor-grabbing"
      )}
    >
      <GripVertical className="size-4" aria-hidden="true" />
    </button>
  )
}

function SortableRow({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "relative z-10 bg-muted shadow-lg")}
      data-dragging={isDragging || undefined}
    >
      {children}
    </TableRow>
  )
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search…",
  searchColumn,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyAction,
  toolbar,
  getRowId,
  onReorder,
  reorderLabel,
}: {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  searchColumn?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  toolbar?: React.ReactNode
  /** Required when `onReorder` is set — gives each row a stable drag id. */
  getRowId?: (row: TData) => string
  /**
   * Called with the full list of ids in their new order. Return false (or
   * throw) to make the table roll back to the previous order.
   */
  onReorder?: (orderedIds: string[]) => Promise<boolean | void> | boolean | void
  /** Accessible name for a row's drag handle, e.g. row => row.title */
  reorderLabel?: (row: TData) => string
}) {
  const sortable = Boolean(onReorder && getRowId)

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [filter, setFilter] = React.useState("")

  /**
   * Local mirror of `data` so a drag can update the UI immediately and roll
   * back if the request fails. Re-synced whenever the server sends new data.
   */
  const [rows, setRows] = React.useState(data)
  React.useEffect(() => setRows(data), [data])

  const sensors = useSensors(
    // A small drag threshold keeps ordinary clicks on the handle from being
    // swallowed as drags.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(getRowId ? { getRowId: (row: TData) => getRowId(row) } : {}),
  })

  React.useEffect(() => {
    if (!searchColumn) return
    table.getColumn(searchColumn)?.setFilterValue(filter)
  }, [filter, searchColumn, table])

  const ids = React.useMemo(
    () => (getRowId ? rows.map(getRowId) : []),
    [rows, getRowId]
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id || !getRowId || !onReorder) return

    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from === -1 || to === -1) return

    const previous = rows
    const next = arrayMove(rows, from, to)
    setRows(next) // optimistic

    try {
      const result = await onReorder(next.map(getRowId))
      if (result === false) setRows(previous)
    } catch {
      setRows(previous)
    }
  }

  const tableRows = table.getRowModel().rows
  const isEmpty = rows.length === 0
  const noMatches = !isEmpty && tableRows.length === 0

  // Dragging is only meaningful while the list is in its stored order.
  const dragEnabled = sortable && sorting.length === 0 && filter === ""

  const body = (
    <TableBody>
      {noMatches ? (
        <TableRow>
          <TableCell
            colSpan={columns.length + (sortable ? 1 : 0)}
            className="h-24 text-center text-sm text-muted-foreground"
          >
            No results for “{filter}”.
          </TableCell>
        </TableRow>
      ) : (
        tableRows.map((row) => {
          const cells = (
            <>
              {sortable ? (
                <TableCell className="w-10 pr-0">
                  {dragEnabled ? (
                    <DragHandle
                      id={row.id}
                      label={reorderLabel?.(row.original) ?? "row"}
                    />
                  ) : (
                    <span
                      className="flex size-7 items-center justify-center text-muted-foreground/30"
                      title="Clear the search and sorting to reorder"
                    >
                      <GripVertical className="size-4" aria-hidden="true" />
                    </span>
                  )}
                </TableCell>
              ) : null}
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </>
          )

          return dragEnabled ? (
            <SortableRow key={row.id} id={row.id}>
              {cells}
            </SortableRow>
          ) : (
            <TableRow key={row.id}>{cells}</TableRow>
          )
        })
      )}
    </TableBody>
  )

  const tableEl = (
    <div className="card-surface overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {sortable ? <TableHead className="w-10" /> : null}
              {group.headers.map((header) => {
                // Suppress sorting entirely in reorder mode.
                const canSort = header.column.getCanSort() && !sortable
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : canSort ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-2 h-7"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown
                          className={cn(
                            "size-3 opacity-50",
                            header.column.getIsSorted() && "opacity-100"
                          )}
                        />
                      </Button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        {body}
      </Table>
    </div>
  )

  return (
    <div className="space-y-4">
      {(searchColumn || toolbar) && !isEmpty ? (
        <div className="flex flex-wrap items-center gap-3">
          {searchColumn ? (
            <div className="relative max-w-xs flex-1">
              <Search
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
                aria-label={searchPlaceholder}
              />
            </div>
          ) : null}
          {toolbar ? <div className="ml-auto">{toolbar}</div> : null}
        </div>
      ) : null}

      {sortable && !isEmpty && !dragEnabled ? (
        <p className="text-xs text-muted-foreground">
          Clear the search box to drag rows into a new order.
        </p>
      ) : null}

      {isEmpty ? (
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : dragEnabled ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {tableEl}
          </SortableContext>
        </DndContext>
      ) : (
        tableEl
      )}
    </div>
  )
}
