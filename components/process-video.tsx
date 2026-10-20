"use client"

import { Pause, Play } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { Dict } from "@/content/dictionaries"

/** Zelfde grens als Tailwinds sm: daaronder de 4:5-versie. */
const WIDE = "(min-width: 40rem)"

/**
 * Speelt stil en in een lus, maar alleen zolang hij in beeld is.
 * preload="none" houdt de video buiten de eerste paginalading; hij staat
 * onderaan de homepage. Wie minder beweging wil, krijgt een stilstaand beeld
 * en de afspeelknop. Die knop is er voor iedereen: bewegend beeld dat vanzelf
 * start moet te pauzeren zijn (WCAG 2.2.2).
 */
export function ProcessVideo({ video }: { video: Dict["process"]["video"] }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  // Zelf gepauzeerd blijft gepauzeerd, ook als je weg en terug scrollt.
  const stopped = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // React zet `muted` bij hydratie niet altijd op het element, en zonder
    // muted weigert de browser play() zonder klik.
    el.muted = true
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stopped.current = true
      el.poster = `${video.src}-${matchMedia(WIDE).matches ? "16x9" : "4x5"}.jpg`
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (stopped.current) return
        if (entry.isIntersecting) play(el)
        else el.pause()
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [video.src])

  function toggle() {
    const el = ref.current
    if (!el) return
    stopped.current = !el.paused
    if (el.paused) play(el)
    else el.pause()
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-line">
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        aria-label={video.label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="block aspect-[4/5] w-full bg-background object-cover sm:aspect-video"
      >
        <source media={WIDE} src={`${video.src}-16x9.mp4`} type="video/mp4" />
        <source src={`${video.src}-4x5.mp4`} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? video.pause : video.play}
        className="absolute right-3 bottom-3 flex size-11 items-center justify-center rounded-full border border-line bg-background/70 text-muted-foreground backdrop-blur-md transition-colors hover:text-foreground"
      >
        {playing ? (
          <Pause aria-hidden className="size-4" />
        ) : (
          <Play aria-hidden className="size-4" />
        )}
      </button>
    </div>
  )
}

function play(el: HTMLVideoElement) {
  // Weigert als pause() ertussen komt (weggescrold voor hij liep) of als de
  // browser autoplay blokkeert. Dan blijft hij stil en staat de knop op
  // afspelen, precies wat je dan wilt zien.
  el.play().catch(() => {})
}
