import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion'
import projects from './projects'

const ease = [0.16, 1, 0.3, 1]

function Cover({ p, i }) {
  // Full screenshot framed on a dark tinted gradient; colours muted to sit in the palette
  if (p.image) return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: `radial-gradient(120% 90% at 20% 0%, ${p.tint}, transparent 60%), radial-gradient(90% 80% at 100% 100%, ${p.tint}aa, transparent 55%), #0b0b0d` }}>
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
      <div className="absolute left-[9%] right-[9%] top-[11%] rounded-lg overflow-hidden border border-white/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] bg-[#0b0b0d] group-hover:-translate-y-1.5 transition-transform duration-700">
        <div className="flex items-center gap-1.5 px-3 h-6 border-b border-white/10 bg-white/[0.04]">
          {[0, 1, 2].map((k) => <span key={k} className="w-1.5 h-1.5 rounded-full bg-white/25" />)}
        </div>
        <div className="relative">
          <img src={p.image} alt={p.title} draggable={false} className="block w-full h-auto saturate-[0.45] brightness-[0.85] contrast-[1.05] group-hover:saturate-[0.8] group-hover:brightness-100 transition-[filter] duration-700" />
          <div className="absolute inset-0 mix-blend-soft-light opacity-70" style={{ background: `linear-gradient(135deg, ${p.tint}, #000)` }} />
        </div>
      </div>
    </div>
  )
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#121214] flex flex-col justify-between p-6 sm:p-10 border border-white/5" style={{ background: `radial-gradient(120% 90% at 30% 10%, ${p.tint || '#181b24'}, transparent 65%), #0b0b0d` }}>
      <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
      <div className="relative z-10 flex items-center justify-between font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/40">
        <span>Slide 0{i + 1}</span>
        <span className="px-2.5 py-0.5 rounded-full border border-white/10 bg-white/[0.03]">Coursework</span>
      </div>
      <div className="relative z-10 my-auto text-center py-6">
        <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-white/40 mb-2 sm:mb-3">TAPMI Bengaluru</p>
        <h4 className="font-serif italic text-2xl sm:text-4xl lg:text-5xl text-white/80">{p.title}</h4>
        <p className="mt-3 text-xs sm:text-sm text-white/50 max-w-md mx-auto">Slides, research &amp; project media will be showcased here.</p>
      </div>
      <div className="relative z-10 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-white/30 pt-4 border-t border-white/10">
        <span>Status · In Progress</span>
        <span>2025</span>
      </div>
      <span className="absolute bottom-2 right-4 font-serif italic text-[7rem] md:text-[10rem] leading-none text-white/[0.04] pointer-events-none select-none">0{i + 1}</span>
    </div>
  )
}

function Card({ p, i, progress, n, onOpen }) {
  // each card's position relative to viewport centre drives a 3D turn
  const center = n === 1 ? 0 : i / (n - 1)
  const d = useTransform(progress, (v) => v - center)
  const rotateY = useTransform(d, [-0.5, 0, 0.5], [-28, 0, 28])
  const scale = useTransform(d, [-0.5, 0, 0.5], [0.86, 1, 0.86])
  const imgX = useTransform(d, [-0.5, 0.5], ['-12%', '12%'])
  const op = useTransform(d, [-0.6, 0, 0.6], [0.35, 1, 0.35])
  return (
    <motion.article style={{ rotateY, scale, opacity: op, transformPerspective: 1400 }} onClick={() => onOpen(i)} data-hover
      className="group shrink-0 w-[84vw] sm:w-[60vw] lg:w-[46vw] max-w-[760px] cursor-pointer">
      <div className="dark-scope relative aspect-[16/10] rounded-xl overflow-hidden border border-white/10">
        <motion.div style={{ x: p.image ? 0 : imgX }} className={`absolute ${p.image ? 'inset-0' : 'inset-[-12%]'}`}><Cover p={p} i={i} /></motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent via-40% to-transparent" />
        <div className="absolute top-2.5 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-between font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/70">
          <span>0{i + 1} / 0{n}</span><span>{p.year}</span>
        </div>
        <div className="absolute bottom-3 sm:bottom-5 right-3 sm:right-5 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white text-black grid place-items-center scale-0 group-hover:scale-100 transition-transform duration-500 text-xs sm:text-base">↗</div>
      </div>
      <div className="mt-3 sm:mt-5 flex items-start justify-between gap-3 sm:gap-6">
        <div className="min-w-0 flex-1">
          <h3 className="text-base min-[360px]:text-xl sm:text-3xl md:text-4xl font-semibold tracking-tight truncate">{p.title}</h3>
          <p className="mt-1 font-mono text-[9px] min-[360px]:text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-white/45">{p.tag}</p>
        </div>
        <div className="hidden sm:flex flex-wrap justify-end gap-1.5 max-w-[50%]">
          {p.stack.slice(0, 3).map((s) => <span key={s} className="px-2.5 py-1 rounded-full border border-white/15 text-[11px] text-white/60">{s}</span>)}
        </div>
      </div>
    </motion.article>
  )
}

export default function ProjectViewer({ id = 'projects', label = '05 — Selected Work', title = 'My projects', items = projects }) {
  const section = useRef(), track = useRef()
  const [open, setOpen] = useState(null)
  const [dist, setDist] = useState(0)
  const [active, setActive] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const n = items.length

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const m = () => {
      if (track.current) setDist(Math.max(0, track.current.scrollWidth - window.innerWidth))
    }
    m()
    window.addEventListener('resize', m)
    const t = setTimeout(m, 350)
    return () => {
      window.removeEventListener('resize', m)
      clearTimeout(t)
    }
  }, [items])

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 })
  const x = useTransform(p, [0, 1], [0, -dist])
  useMotionValueEvent(scrollYProgress, 'change', (v) => setActive(Math.min(n - 1, Math.round(v * (n - 1)))))

  // Jump the page so the chosen project centres (user can also just scroll / drag)
  const goTo = (i) => {
    const el = section.current
    if (!el) return
    const top = el.offsetTop + (el.offsetHeight - window.innerHeight) * (i / Math.max(1, n - 1))
    window.scrollTo({ top, behavior: 'smooth' })
  }

  useEffect(() => {
    const k = (e) => {
      if (e.key === 'Escape') setOpen(null)
      const r = section.current?.getBoundingClientRect()
      if (!r || open !== null || r.top > 10 || r.bottom < window.innerHeight - 10) return
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(Math.min(n - 1, active + 1)) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(Math.max(0, active - 1)) }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [active, open, n])

  // Dragging the track converts into page scroll
  const drag = useRef(null)
  const onDown = (e) => { drag.current = { x: e.clientX, y: window.scrollY, moved: false } }
  const onMove = (e) => {
    if (!drag.current || !section.current) return
    const dx = e.clientX - drag.current.x
    if (Math.abs(dx) > 4) drag.current.moved = true
    const ratio = (section.current.offsetHeight - window.innerHeight) / Math.max(1, dist)
    window.scrollTo({ top: drag.current.y - dx * ratio })
  }
  const onUp = () => { setTimeout(() => (drag.current = null), 0) }
  const openCard = (i) => { if (!drag.current?.moved) setOpen(i) }

  return (
    <>
      <section id={id} data-theme="dark" ref={section} className="relative z-10" style={{ height: `${100 + n * (isMobile ? 24 : 40)}svh` }}>
        <div className="sticky top-0 h-[100svh] flex flex-col justify-center overflow-hidden py-3 sm:py-0">
          <div className="px-3.5 min-[360px]:px-5 sm:px-8 lg:px-14 mb-3 min-[360px]:mb-5 sm:mb-8 md:mb-12 flex items-end justify-between gap-3 sm:gap-6">
            <div>
              <p className="font-mono text-[9px] min-[360px]:text-[11px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-white/45 mb-2 sm:mb-4">{label}</p>
              <h2 className="text-2xl min-[360px]:text-3xl sm:text-6xl lg:text-7xl font-semibold tracking-tight">{title}</h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden md:block font-mono text-xs text-white/50 w-16 text-right">
                <AnimatePresence mode="wait">
                  <motion.span key={active} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} className="inline-block text-white">0{active + 1}</motion.span>
                </AnimatePresence> / 0{n}
              </div>
              {[[-1, '←'], [1, '→']].map(([d, l]) => (
                <button key={d} onClick={() => goTo(Math.max(0, Math.min(n - 1, active + d)))} aria-label={d < 0 ? 'Previous' : 'Next'}
                  className="w-8 h-8 min-[360px]:w-10 min-[360px]:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border border-white/20 text-xs sm:text-base hover:bg-white hover:text-black transition-colors flex items-center justify-center">{l}</button>
              ))}
            </div>
          </div>

          <motion.div ref={track} style={{ x }} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
            className="flex gap-4 sm:gap-6 md:gap-10 px-[8vw] sm:px-[20vw] lg:px-[27vw] w-max select-none cursor-grab active:cursor-grabbing touch-pan-y">
            {items.map((pr, i) => <Card key={pr.title} p={pr} i={i} n={n} progress={p} onOpen={openCard} />)}
          </motion.div>

          <div className="px-3.5 min-[360px]:px-5 sm:px-8 lg:px-14 mt-4 min-[360px]:mt-6 sm:mt-10 flex items-center gap-3 sm:gap-4">
            <div className="relative h-px flex-1 bg-white/15 overflow-hidden">
              <motion.div style={{ scaleX: p }} className="absolute inset-0 bg-white origin-left" />
            </div>
            <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/40 hidden sm:block">Scroll · Drag · ← →</span>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {open !== null && items[open] && (
          <motion.div className="dark-scope fixed inset-0 z-[80] flex items-end md:items-center justify-center p-2 min-[360px]:p-3 md:p-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setOpen(null)} />
            <motion.div initial={{ y: 80, opacity: 0, rotateX: 12 }} animate={{ y: 0, opacity: 1, rotateX: 0 }} exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.8, ease }} style={{ transformPerspective: 1200 }}
              className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-t-2xl md:rounded-2xl border border-white/10 bg-[#111] grid md:grid-cols-[1.2fr_1fr] shadow-2xl">
              <div className="aspect-video md:aspect-auto md:min-h-[480px] overflow-hidden">
                <motion.div className="w-full h-full" initial={{ scale: 1.25 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease }}><Cover p={items[open]} i={open} /></motion.div>
              </div>
              <motion.div className="p-4 min-[360px]:p-6 md:p-10 flex flex-col" initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }}>
                {[
                  <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/45">{items[open].tag} · {items[open].year}</p>,
                  <h3 className="text-xl min-[360px]:text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight mt-2 sm:mt-3 break-words">{items[open].title}</h3>,
                  <p className="text-xs min-[360px]:text-sm sm:text-base text-white/65 mt-3 sm:mt-5 leading-relaxed">{items[open].description}</p>,
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-4 sm:mt-6">{items[open].stack.map((s) => <span key={s} className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs border border-white/15">{s}</span>)}</div>,
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-6 sm:pt-10">
                    {items[open].live ? (
                      <a href={items[open].live} target="_blank" rel="noreferrer" className="px-4 min-[360px]:px-6 py-2 min-[360px]:py-3 rounded-full bg-white text-black text-xs sm:text-sm font-medium hover:bg-white/80 transition-colors">Visit live ↗</a>
                    ) : (
                      <span className="px-4 min-[360px]:px-6 py-2 min-[360px]:py-3 rounded-full bg-white/10 text-white/70 text-xs sm:text-sm font-mono uppercase tracking-[0.15em] border border-white/15">Coming Soon · TAPMI</span>
                    )}
                    {items[open].code && <a href={items[open].code} target="_blank" rel="noreferrer" className="px-4 min-[360px]:px-6 py-2 min-[360px]:py-3 rounded-full border border-white/20 text-xs sm:text-sm hover:bg-white/10 transition-colors">Source</a>}
                  </div>,
                ].map((el, k) => <motion.div key={k} variants={{ h: { opacity: 0, y: 20 }, s: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } }} className={k === 4 ? 'mt-auto' : ''}>{el}</motion.div>)}
              </motion.div>
              <button onClick={() => setOpen(null)} aria-label="Close" className="absolute top-3 right-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/70 border border-white/20 hover:bg-white hover:text-black transition-colors z-20 flex items-center justify-center text-xs sm:text-sm">✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


