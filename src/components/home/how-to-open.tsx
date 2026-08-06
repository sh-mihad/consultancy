import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StepCard } from "@/components/public/step-card"
import type { ISiteSettings } from "@/models/SiteSettings"

export function HowToOpen({ howTo }: { howTo: ISiteSettings["howTo"] }) {
  const steps = howTo?.steps ?? []
  if (steps.length === 0) return null

  return (
    <section className="section">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          {howTo.eyebrow ? <p className="eyebrow mb-3">{howTo.eyebrow}</p> : null}
          <h2 className="heading-2 text-balance">{howTo.heading}</h2>
          {howTo.description ? <p className="lead mt-4">{howTo.description}</p> : null}
        </div>

        <ol className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {steps.map((step, i) => (
            <li key={`${step.title}-${i}`}>
              <StepCard step={i + 1} title={step.title} description={step.description} />
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl bg-muted p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-heading text-lg font-semibold">
              Not sure which structure fits your business?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              We will walk you through the options before you commit to anything.
            </p>
          </div>
          <Button asChild size="lg" className="h-11 shrink-0 px-6">
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
