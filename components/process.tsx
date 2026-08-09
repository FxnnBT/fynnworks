import type { Dict } from "@/content/dictionaries"
import { SectionHeading } from "@/components/section-heading"

export function Process({ dict }: { dict: Dict }) {
  return (
    <section id="process" className="section-y scroll-mt-14">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={dict.process.eyebrow}
          title={dict.process.title}
        />

        <ol className="grid gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-2 lg:grid-cols-4">
          {dict.process.steps.map((step, index) => (
            <li
              key={step.name}
              className="group flex flex-col gap-4 bg-background p-8 transition-colors hover:bg-card"
            >
              <span
                aria-hidden
                className="font-display text-5xl leading-none text-muted-foreground/30 transition-colors duration-300 group-hover:text-warm"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg font-medium">{step.name}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
