import type { Metadata } from "next"

import { BlogForm } from "@/components/admin/blog-form"

export const metadata: Metadata = { title: "New post" }

/** Static "new" wins over the sibling [blogId] segment. */
export default function NewBlogPage() {
  return <BlogForm />
}
