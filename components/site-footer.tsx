import type { Dict } from "@/content/dictionaries"
import { SITE } from "@/lib/site"

export function SiteFooter({ dict }: { dict: Dict }) {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-display text-lg text-foreground">{SITE.name}</p>
        <p>{dict.footer.tagline}</p>
        <p className="font-mono text-xs">
          © {new Date().getFullYear()} {SITE.name}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  )
}
