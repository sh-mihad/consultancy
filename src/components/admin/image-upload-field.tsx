"use client"

import * as React from "react"
import Image from "next/image"
import { useField } from "formik"
import { ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ACCEPT_ATTR, validateImageFile } from "@/lib/upload"

/**
 * Formik-bound image field: upload a file, get a hosted URL.
 *
 * The field still stores a plain URL string, exactly as the pasted-URL input it
 * replaces did — so no model, schema or API route had to change, and any URL
 * already in the database keeps rendering here with Replace and Remove.
 *
 * Deliberately knows nothing about blogs. Point it at any string field and it
 * works; the remaining six image fields adopt it by passing a different `name`.
 */

type SignatureResponse = {
  cloudName: string
  apiKey: string
  timestamp: number
  signature: string
  folder: string
  uploadUrl: string
}

export function ImageUploadField({
  name,
  label,
  help,
  aspect = "16 / 9",
  disabled,
  onUploadingChange,
}: {
  name: string
  label: string
  help?: string
  /** CSS aspect-ratio for the preview box, e.g. "16 / 9" or "1 / 1". */
  aspect?: string
  disabled?: boolean
  /** Lets the parent disable Save while a file is in flight. */
  onUploadingChange?: (uploading: boolean) => void
}) {
  const [field, meta, helpers] = useField<string>(name)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const value = field.value ?? ""
  const busy = uploading || Boolean(disabled)

  // Set through one helper rather than an effect, so the parent learns about the
  // upload in the same tick the request starts and ends.
  function setBusy(next: boolean) {
    setUploading(next)
    onUploadingChange?.(next)
  }

  async function handleFile(file: File) {
    setError(null)

    const problem = validateImageFile(file)
    if (problem) {
      setError(problem)
      toast.error(problem)
      return
    }

    setBusy(true)

    try {
      const signRes = await fetch("/api/upload/signature", { method: "POST" })
      const signJson = await signRes.json().catch(() => null)

      if (!signRes.ok || !signJson?.success) {
        throw new Error(signJson?.error ?? "Could not start the upload.")
      }

      const sign: SignatureResponse = signJson.data

      // Every field here is covered by the signature. Sending one that isn't —
      // or omitting one that is — fails with a bare "Invalid Signature".
      const body = new FormData()
      body.append("file", file)
      body.append("api_key", sign.apiKey)
      body.append("timestamp", String(sign.timestamp))
      body.append("signature", sign.signature)
      body.append("folder", sign.folder)

      const upRes = await fetch(sign.uploadUrl, { method: "POST", body })
      const upJson = await upRes.json().catch(() => null)

      if (!upRes.ok || !upJson?.secure_url) {
        throw new Error(upJson?.error?.message ?? "The image could not be uploaded.")
      }

      helpers.setValue(upJson.secure_url)
      helpers.setTouched(true)
      toast.success("Image uploaded")
    } catch (err) {
      const message = err instanceof Error ? err.message : "The image could not be uploaded."
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    // Clear the input before doing anything else: without this, picking the same
    // file again fires no change event and the upload silently does nothing.
    event.target.value = ""

    if (file) void handleFile(file)
  }

  function handleRemove() {
    setError(null)
    helpers.setValue("")
    helpers.setTouched(true)
  }

  const fieldError = error ?? (meta.touched ? meta.error : undefined)

  return (
    <div className="space-y-2">
      <Label htmlFor={`${name}-upload`}>{label}</Label>

      {/* Every button below is type="button" on purpose — the default is
          "submit", which would save the whole form on a Replace click. */}
      <input
        ref={inputRef}
        id={`${name}-upload`}
        type="file"
        accept={ACCEPT_ATTR}
        className="sr-only"
        disabled={busy}
        onChange={handleChange}
      />

      {value ? (
        <div className="space-y-2">
          <div
            className="relative w-full max-w-md overflow-hidden rounded-lg border bg-muted"
            style={{ aspectRatio: aspect }}
          >
            <Image
              src={value}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-cover"
            />
            {uploading ? (
              <div className="absolute inset-0 grid place-items-center bg-background/70">
                <LoaderCircle className="size-5 animate-spin text-primary" aria-hidden="true" />
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <Upload />
              Replace
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={busy}
              onClick={handleRemove}
            >
              <Trash2 />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full max-w-md flex-col items-center justify-center gap-2 rounded-lg",
            "border border-dashed bg-muted/40 px-4 py-8 text-sm text-muted-foreground",
            "transition-colors hover:border-primary/40 hover:bg-muted",
            "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {uploading ? (
            <>
              <LoaderCircle className="size-6 animate-spin text-primary" aria-hidden="true" />
              <span>Uploading…</span>
            </>
          ) : (
            <>
              <ImagePlus className="size-6" aria-hidden="true" />
              <span className="font-medium text-foreground">Upload image</span>
              <span className="text-xs">JPEG, PNG, WebP, AVIF or GIF · up to 5 MB</span>
            </>
          )}
        </button>
      )}

      {help ? <p className="text-xs text-muted-foreground">{help}</p> : null}
      {fieldError ? <p className="text-xs text-destructive">{fieldError}</p> : null}
    </div>
  )
}
