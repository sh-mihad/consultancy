import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StepCard } from "@/components/public/step-card"
import type { ISiteSettings } from "@/models/SiteSettings"

export function HowToOpen({ howTo }: { howTo: ISiteSettings["howTo"] }) {
  const steps = howTo?.steps ?? []
  if (steps.length === 0) return null

  return (
    <section className="section-dark relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="engrave pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
      />

      <div className="container-x">
        <div className="max-w-2xl">
          {howTo.eyebrow ? <p className="eyebrow mb-5">{howTo.eyebrow}</p> : null}
          <h2 className="heading-2 text-balance">{howTo.heading}</h2>
          {howTo.description ? <p className="lead mt-5">{howTo.description}</p> : null}
        </div>

        {/* A real sequence, so it is numbered and ordered. */}
        <ol className="mt-14 grid gap-x-10 gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <li key={`${step.title}-${i}`}>
              <StepCard step={i + 1} title={step.title} description={step.description} />
            </li>
          ))}
        </ol>

        <div className="mt-16 flex flex-col gap-6 border border-white/12 bg-white/[0.03] p-8 sm:flex-row sm:items-center sm:justify-between md:px-10 md:py-9">
          <div>
            <p className="font-heading text-xl font-medium">
              Not sure which structure fits your business?
            </p>
            <p className="mt-1.5 text-sm text-primary-foreground/65">
              We will walk you through the options before you commit to anything.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="h-12 shrink-0 bg-accent px-7 text-accent-foreground hover:bg-brand-gold-light"
          >
            <Link href="#contact">
              Talk to an advisor
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
