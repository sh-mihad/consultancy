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
import { ArrowUpDown, Search } from "lucide-react"

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
 * Shared admin table, backed by TanStack Table v8.
 *
 * Note the version: v9 is installed-and-available upstream but is a full API
 * rewrite (`useTable` + feature composition), and every shadcn data-table
 * example targets v8. This project pins v8 deliberately — see CLAUDE.md.
 *
 * Five admin screens are the same list shape, so this handles sorting,
 * filtering and empty state once rather than five times.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search…",
  searchColumn,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyAction,
  toolbar,
}: {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  /** Column id to filter on. Omit to hide the search box. */
  searchColumn?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  toolbar?: React.ReactNode
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [filter, setFilter] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  // Drive the column filter from our own input so the toolbar layout stays
  // under our control rather than TanStack's.
  React.useEffect(() => {
    if (!searchColumn) return
    table.getColumn(searchColumn)?.setFilterValue(filter)
  }, [filter, searchColumn, table])

  const rows = table.getRowModel().rows
  const isEmpty = data.length === 0
  const noMatches = !isEmpty && rows.length === 0

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

      {isEmpty ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : (
        <div className="card-surface overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => {
                    const canSort = header.column.getCanSort()
                    return (
                      <TableHead key={header.id} style={{ width: header.getSize() }}>
                        {header.isPlaceholder ? null : canSort ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-2 h-7 data-[sorted=true]:text-foreground"
                            data-sorted={Boolean(header.column.getIsSorted())}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
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

            <TableBody>
              {noMatches ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No results for “{filter}”.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
