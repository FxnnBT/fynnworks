import type { Dict, Lang } from "@/content/dictionaries"
import { ContactForm } from "@/components/contact-form"
import { SITE } from "@/lib/site"

export function Contact({ dict, lang }: { dict: Dict; lang: Lang }) {
  return (
    <section id="contact" className="section-y scroll-mt-14">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-14 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <p className="eyebrow mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-warm" />
              {dict.contact.eyebrow}
            </p>
            <h2 className="text-section">{dict.contact.title}</h2>
            <p className="mt-6 max-w-sm text-muted-foreground">
              {dict.contact.lead}
            </p>

            <p className="mt-10 text-sm text-muted-foreground">
              {dict.contact.directLabel}
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="group mt-1 inline-block font-display text-2xl transition-colors hover:text-warm"
            >
              {SITE.email}
              <span className="block h-px w-full origin-left scale-x-0 bg-warm transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
            </a>
          </div>

          <div className="md:col-span-7">
            <ContactForm
              dict={dict.contact}
              lang={lang}
              privacyLabel={dict.legal.privacy}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
