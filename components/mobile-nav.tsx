"use client"

import { Menu, X } from "lucide-react"

/** Ankerlink in het menu. Zelfde vorm als de lijst in site-header.tsx. */
type NavLink = { href: string; label: string }

export function MobileNav({
  links,
  label,
}: {
  links: NavLink[]
  label: string
}) {
  return (
    // Native <details>, net als de FAQ: open/dicht, toetsenbord en schermlezer
    // krijg je van de browser, zonder state en zonder bibliotheek.
    <details className="group sm:hidden [&[open]>summary>.icon-open]:hidden [&[open]>summary>.icon-close]:block">
      <summary
        aria-label={label}
        className="-ml-2 flex size-11 cursor-pointer list-none items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden"
      >
        <Menu aria-hidden className="icon-open size-5" />
        <X aria-hidden className="icon-close hidden size-5" />
      </summary>

      {/* Onder de balk, over de pagina heen — de header is fixed, dus dit hangt
          mee zonder dat er ruimte van de hero af gaat. */}
      <ul
        // Zonder dit blijft het menu open staan nadat je op een link tikt, en
        // dekt het precies de sectie af waar je net heen sprong.
        onClick={(event) =>
          event.currentTarget.closest("details")?.removeAttribute("open")
        }
        className="absolute inset-x-0 top-14 flex flex-col border-b border-line bg-background/95 backdrop-blur-md"
      >
        {links.map((link) => (
          <li key={link.href} className="border-t border-line">
            <a
              href={link.href}
              className="flex min-h-12 items-center px-5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </details>
  )
}
