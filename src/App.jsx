import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import Scene from './Scene.jsx'
import ProjectViewer from './ProjectViewer.jsx'

const ease = [0.16, 1, 0.3, 1]
const pad = 'px-3.5 min-[360px]:px-5 sm:px-8 lg:px-14'

function useMobile() {
  const [m, setM] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const r = () => setM(window.innerWidth < 768)
    window.addEventListener('resize', r)
    return () => window.removeEventListener('resize', r)
  }, [])
  return m
}

function Cursor() {
  const x = useMotionValue(-100), y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 400, damping: 30 }), sy = useSpring(y, { stiffness: 400, damping: 30 })
  const [big, setBig] = useState(false)
  useEffect(() => {
    const mv = (e) => { x.set(e.clientX); y.set(e.clientY); setBig(!!e.target.closest?.('a,button,[data-hover]')) }
    window.addEventListener('mousemove', mv)
    return () => window.removeEventListener('mousemove', mv)
  }, [])
  return (
    <motion.div style={{ x: sx, y: sy }} className="fixed top-0 left-0 z-[90] pointer-events-none hidden md:block mix-blend-difference">
      <motion.div animate={{ scale: big ? 3.5 : 1 }} transition={{ duration: 0.3 }} className="-translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white" />
    </motion.div>
  )
}

const Label = ({ n, t }) => (
  <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-white/45 mb-4 sm:mb-6 md:mb-10">{n} — {t}</p>
)

// Line-mask reveal
// `now` animates on mount (a fully-masked child never registers as "in view")
const Lines = ({ children, className = '', delay = 0, now }) => (
  <span className={`block overflow-hidden ${className}`}>
    <motion.span className="block" initial={{ y: '105%' }} {...(now ? { animate: { y: 0 } } : { whileInView: { y: 0 }, viewport: { once: true, margin: '-40px' } })} transition={{ duration: 1.1, delay, ease }}>{children}</motion.span>
  </span>
)

// Words light up as you scroll through
function ScrollText({ text }) {
  const ref = useRef()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.4'] })
  const words = text.split(' ')
  return (
    <p ref={ref} className="text-xl min-[360px]:text-2xl min-[480px]:text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.18] sm:leading-[1.12] tracking-tight flex flex-wrap break-words">
      {words.map((w, i) => {
        const s = i / words.length
        return <Word key={i} p={scrollYProgress} r={[s, s + 1 / words.length]} italic={w.startsWith('_')}>{w.replace(/_/g, '')}</Word>
      })}
    </p>
  )
}
function Word({ children, p, r, italic }) {
  const o = useTransform(p, r, [0.12, 1])
  const y = useTransform(p, r, [8, 0])
  return <motion.span style={{ opacity: o, y }} className={`mr-[0.25em] ${italic ? 'font-serif italic font-normal' : ''}`}>{children}</motion.span>
}

function Magnetic({ children, href, solid }) {
  const x = useSpring(0, { stiffness: 200, damping: 14 }), y = useSpring(0, { stiffness: 200, damping: 14 })
  return (
    <motion.a href={href} style={{ x, y }} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * 0.3); y.set((e.clientY - r.top - r.height / 2) * 0.3) }}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      className={`group relative inline-flex items-center gap-2 sm:gap-3 overflow-hidden rounded-full px-4 min-[360px]:px-6 sm:px-8 py-2.5 min-[360px]:py-3.5 sm:py-4 text-[10px] min-[360px]:text-xs sm:text-sm uppercase tracking-[0.14em] min-[360px]:tracking-[0.18em] ${solid ? 'bg-white text-black' : 'border border-white/25 text-white'}`}>
      <span className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${solid ? 'bg-neutral-300' : 'bg-white'}`} />
      <span className={`relative ${solid ? '' : 'group-hover:text-black transition-colors duration-500'}`}>{children}</span>
    </motion.a>
  )
}

function Rotator({ words }) {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI((v) => (v + 1) % words.length), 2200); return () => clearInterval(t) }, [])
  return (
    <span className="relative inline-flex overflow-hidden h-[1.4em] items-center text-[#141414]/80">
      <AnimatePresence mode="wait">
        <motion.span key={i} initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-100%', opacity: 0 }} transition={{ duration: 0.5, ease }}>{words[i]}</motion.span>
      </AnimatePresence>
    </span>
  )
}

// Designed semicircle around the portrait: draws in, then words pop one by one
const ARC = { w: 1500, h: 1283, cx: 750, cy: 1040, r: 700, start: 0, dur: 2.2 }
const arcWords = [[0.08, 'Strategy'], [0.2, 'Finance'], [0.32, 'Operations'], [0.68, 'Systems'], [0.8, 'Analytics'], [0.92, 'Data']]
const arcD = (r) => `M ${ARC.cx - r} ${ARC.cy} A ${r} ${r} 0 0 1 ${ARC.cx + r} ${ARC.cy}`
function Arc({ style }) {
  const { w, h, cx, cy, r, start, dur } = ARC
  const done = start + dur
  const ticks = Array.from({ length: 61 }, (_, i) => i / 60)
  return (
    <motion.div style={style} className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[74svh] lg:h-[80svh] aspect-[1500/1283] hidden sm:block pointer-events-none">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible">
        {/* outer dashed orbit, slowly marching */}
        <motion.path d={arcD(r + 46)} fill="none" stroke="#141414" strokeOpacity="0.6" strokeWidth="3.2" strokeDasharray="5 13" strokeLinecap="round"
          initial={{ opacity: 0, strokeDashoffset: 0 }} animate={{ opacity: 1, strokeDashoffset: -340 }}
          transition={{ opacity: { duration: 1, delay: start + 0.2 }, strokeDashoffset: { duration: 20, repeat: Infinity, ease: 'linear' } }} />
        {/* main arc */}
        <motion.path d={arcD(r)} fill="none" stroke="#141414" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: dur, delay: start, ease: [0.45, 0, 0.25, 1] }} />
        {/* inner scale of ticks, revealed alongside the draw */}
        {ticks.map((t, i) => {
          const a = Math.PI * (1 - t), long = i % 5 === 0
          const r1 = r - 18, r2 = r - (long ? 46 : 30)
          return <motion.line key={i} x1={cx + r1 * Math.cos(a)} y1={cy - r1 * Math.sin(a)} x2={cx + r2 * Math.cos(a)} y2={cy - r2 * Math.sin(a)}
            stroke="#141414" strokeOpacity={long ? 0.45 : 0.2} strokeWidth={long ? 2 : 1.2}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: start + dur * (0.1 + t * 0.8) }} />
        })}
        {/* glint that keeps travelling once drawn */}
        <motion.circle r="5" fill="#141414" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.9, 0.9, 0] }} transition={{ duration: 6, delay: done, repeat: Infinity, times: [0, 0.1, 0.9, 1] }}>
          <animateMotion dur="6s" begin={`${done}s`} repeatCount="indefinite" path={arcD(r)} />
        </motion.circle>
        {arcWords.map(([t, word], i) => {
          const a = Math.PI * (1 - t), nx = Math.cos(a), ny = -Math.sin(a)
          const x = cx + r * nx, y = cy + r * ny
          const d = done - 0.3 + i * 0.18
          const side = nx < -0.2 ? 'end' : nx > 0.2 ? 'start' : 'middle'
          const pop = { type: 'spring', stiffness: 260, damping: 16, delay: d }
          return (
            <g key={word}>
              <motion.circle cx={x} cy={y} fill="none" stroke="#141414" strokeWidth="1.5"
                initial={{ r: 10, opacity: 0 }} animate={{ r: [10, 34], opacity: [0.45, 0] }} transition={{ duration: 2.2, delay: d + 0.3, repeat: Infinity, repeatDelay: 1.6, ease: 'easeOut' }} />
              <motion.circle cx={x} cy={y} r="17" fill="#141414" fillOpacity="0.08" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={pop} />
              <motion.circle cx={x} cy={y} r="10" fill="#141414" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={pop} />
              <motion.line x1={x + nx * 22} y1={y + ny * 22} x2={x + nx * 62} y2={y + ny * 62} stroke="#141414" strokeOpacity="0.55" strokeWidth="2.2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: d + 0.1, ease }} />
              <motion.text x={x + nx * 78} y={y + ny * 78 + 11} textAnchor={side} className="font-sans font-semibold uppercase" fontSize="34" letterSpacing="3.5" fill="#141414" fillOpacity="0.9"
                initial={{ opacity: 0, scale: 0.8, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ ...pop, delay: d + 0.2 }}>{word}</motion.text>
            </g>
          )
        })}
      </svg>
    </motion.div>
  )
}

function Hero() {
  const ref = useRef()
  // 'start start' → 'end start': fully reversible, so it animates both leaving and returning
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const sp = useSpring(p, { stiffness: 90, damping: 22, mass: 0.3 })
  const imgScale = useTransform(sp, [0, 1], [1, 0.82])
  const imgY = useTransform(sp, [0, 1], ['0%', '-12%'])
  const imgBlur = useTransform(sp, [0.2, 0.9], ['blur(0px)', 'blur(10px)'])
  const imgOp = useTransform(sp, [0.5, 1], [1, 0.2])
  const nameY = useTransform(sp, [0, 1], ['0%', '-140%'])
  const nameSpread = useTransform(sp, [0, 1], ['-0.045em', '0.06em'])
  const nameOp = useTransform(sp, [0.4, 0.9], [1, 0])
  const topY = useTransform(sp, [0, 0.6], [0, -80])
  const topOp = useTransform(sp, [0, 0.45], [1, 0])
  const mx = useMotionValue(0), my = useMotionValue(0)
  const px = useSpring(useTransform(mx, [-1, 1], [-14, 14]), { stiffness: 50, damping: 20 })
  const rot = useSpring(useTransform(mx, [-1, 1], [-4, 4]), { stiffness: 50, damping: 20 })
  const nx = useSpring(useTransform(mx, [-1, 1], [10, -10]), { stiffness: 50, damping: 20 })
  useEffect(() => {
    const m = (e) => { mx.set((e.clientX / window.innerWidth) * 2 - 1); my.set((e.clientY / window.innerHeight) * 2 - 1) }
    window.addEventListener('mousemove', m)
    return () => window.removeEventListener('mousemove', m)
  }, [])
  // replay the arc animation each time the hero is scrolled back into view
  const [replay, setReplay] = useState(0)
  useEffect(() => {
    let away = false
    const f = () => {
      if (window.scrollY > window.innerHeight * 0.7) away = true
      else if (away && window.scrollY < window.innerHeight * 0.25) { away = false; setReplay((n) => n + 1) }
    }
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  const letters = 'BALAKRISHNA'.split('')

  return (
    <section id="top" ref={ref} data-theme="light" className="relative z-10 text-[#141414] min-h-[100svh] overflow-hidden flex flex-col justify-between">
      {/* soft light behind the portrait */}
      {/* soft light behind the portrait */}
      <motion.div style={{ opacity: imgOp }} className="absolute left-1/2 bottom-[10%] -translate-x-1/2 w-[120vw] sm:w-[80vw] max-w-[900px] aspect-square rounded-full bg-[radial-gradient(circle,rgba(20,20,20,0.07),transparent_62%)] pointer-events-none z-0" />

      {/* top copy - z-[5] sits behind the portrait photo z-[12] */}
      <motion.div style={{ y: topY, opacity: topOp }} className={`relative sm:absolute inset-x-0 top-0 ${pad} pt-10 min-[360px]:pt-12 sm:pt-24 lg:pt-28 grid grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-6 items-start z-[5]`}>
        <div className="col-span-2 lg:col-span-5">
          <Lines now delay={0.9} className="font-mono text-[9px] min-[360px]:text-[10px] sm:text-[11px] uppercase tracking-[0.2em] min-[360px]:tracking-[0.3em] font-medium text-[#2b2b2b]">Digital Portfolio</Lines>
          <h2 className="mt-2 sm:mt-4 text-xl min-[320px]:text-2xl min-[400px]:text-3xl sm:text-4xl lg:text-[2.9rem] xl:text-5xl font-semibold tracking-tight leading-[1.08]">
            <Lines now delay={1}>Where business &amp; management learning</Lines>
            <Lines now delay={1.08} className="font-serif italic font-normal text-[#141414]/50">meets tech.</Lines>
          </h2>
        </div>
        <div className="col-span-2 lg:col-span-3 lg:col-start-10 lg:text-right">
          <div className="text-xs min-[360px]:text-[13px] sm:text-sm font-medium text-[#2b2b2b] leading-relaxed max-w-[28ch] min-[360px]:max-w-[30ch] lg:ml-auto">
            <Lines now delay={1.1}>BBA Honors student at</Lines>
            <Lines now delay={1.15}>T. A. Pai Management Institute, Bengaluru,</Lines>
            <Lines now delay={1.2}>building robust projects with</Lines>
            <Lines now delay={1.25}>React, Next.js and MongoDB, and more.</Lines>
          </div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.8, ease }}
            className="mt-3 sm:mt-5 flex flex-wrap lg:justify-end items-center gap-2 relative z-20 pointer-events-auto">
            <a href="#projects" className="lg:hidden inline-flex items-center gap-1.5 rounded-full bg-[#141414] text-[#ece8e1] px-3 py-1 font-mono text-[9px] min-[360px]:text-[10px] uppercase tracking-[0.15em] min-[360px]:tracking-[0.2em]">View work →</a>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7, duration: 1 }}
          className="col-span-2 lg:hidden mt-1 flex items-center gap-2 font-mono text-[9px] min-[360px]:text-[10px] uppercase tracking-[0.15em] min-[360px]:tracking-[0.25em] text-[#141414]/50 flex-wrap relative z-0">
          <span className="h-px w-6 sm:w-8 bg-[#141414]/30" />
          Currently exploring <Rotator words={['AI', 'Web apps', 'Product', 'Business']} />
        </motion.div>
      </motion.div>

      {/* name sits where the upper body fades - solid under-layer */}
      <motion.div style={{ y: nameY, opacity: nameOp, x: nx }} className="absolute inset-x-0 bottom-[3.5%] sm:bottom-[5%] lg:bottom-[7%] px-2 sm:px-6 pointer-events-none select-none z-[8]">
        <motion.h1 style={{ letterSpacing: nameSpread }} aria-label="Balakrishna"
          className="flex justify-center font-semibold leading-[0.8] text-[14.8vw] sm:text-[14.2vw] lg:text-[12.4vw] 2xl:text-[13.5rem] text-[#141414] whitespace-nowrap">
          {letters.map((l, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.04em]">
              <motion.span className="inline-block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.2, delay: 0.55 + i * 0.045, ease }}>{l}</motion.span>
            </span>
          ))}
        </motion.h1>
      </motion.div>

      <Arc key={replay} style={{ opacity: topOp }} />
      {/* portrait - z-[12] sits IN FRONT of text, so Currently Exploring goes behind the head */}
      <motion.div style={{ scale: imgScale, y: imgY, x: px, rotate: rot, filter: imgBlur, opacity: imgOp }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[56svh] min-[360px]:h-[58svh] min-[390px]:h-[60svh] sm:h-[74svh] lg:h-[80svh] aspect-[1100/1283] max-w-[88vw] min-[360px]:max-w-[92vw] sm:max-w-[95vw] origin-bottom pointer-events-none z-[12]">
        <motion.img src="/bala-cutout.webp" alt="Balakrishna K R" draggable={false}
          initial={{ y: 120, opacity: 0, scale: 1.08, filter: 'blur(14px)' }} animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.8, delay: 0.25, ease }}
          className="w-full h-full object-contain object-bottom grayscale contrast-[1.05]"
          style={{ maskImage: 'linear-gradient(to bottom, black 48%, transparent 88%)', WebkitMaskImage: 'linear-gradient(to bottom, black 48%, transparent 88%)' }} />
      </motion.div>

      {/* outline copy over the portrait */}
      <motion.div style={{ y: nameY, opacity: nameOp, x: nx }} className="absolute inset-x-0 bottom-[3.5%] sm:bottom-[5%] lg:bottom-[7%] px-2 sm:px-6 pointer-events-none select-none z-[20]">
        <motion.h1 style={{ letterSpacing: nameSpread }} aria-hidden
          className="flex justify-center font-semibold leading-[0.8] text-[14.8vw] sm:text-[14.2vw] lg:text-[12.4vw] 2xl:text-[13.5rem] text-transparent [-webkit-text-stroke:1px_#141414] sm:[-webkit-text-stroke:1.5px_#141414] whitespace-nowrap">
          {letters.map((l, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.04em]">
              <motion.span className="inline-block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.2, delay: 0.55 + i * 0.045, ease }}>{l}</motion.span>
            </span>
          ))}
        </motion.h1>
      </motion.div>

      {/* bottom meta row */}
      <motion.a href="#about" style={{ opacity: topOp }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }}
        className="absolute left-1/2 -translate-x-1/2 bottom-1 sm:bottom-2 flex flex-col items-center gap-1 font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.3em] sm:tracking-[0.35em] text-[#141414]/45 hover:text-[#141414] transition-colors z-[25]">
        <span className="relative w-px h-5 sm:h-9 bg-[#141414]/15 overflow-hidden">
          <motion.span className="absolute inset-x-0 top-0 h-1/2 bg-[#141414]" animate={{ y: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }} />
        </span>
        Explore
      </motion.a>
    </section>
  )
}

const stack = [
  { g: 'Frontend', items: ['React', 'Next.js', 'Tailwind CSS', 'Three.js'] },
  { g: 'Backend & Data', items: ['Node / API Routes', 'MongoDB', 'Supabase', 'Python', 'MySQL'] },
  { g: 'Integrations', items: ['AI / LLM APIs', 'NextAuth · Google', 'Payment Gateways', '2D & 3D Maps'] },
  { g: 'Infrastructure', items: ['Vercel', 'Firebase', 'VPS', 'Nginx'] },
]

const pillars = [
  ['Business', 'A BBA Honors foundation in markets, finance and management means every build starts with why it matters.'],
  ['Technology', 'React, Next.js and MongoDB, with backend experience in Supabase, Python and MySQL, for feature-rich projects.'],
  ['Delivery', 'Production deployments across Vercel, Firebase and custom VPS environments configured with Nginx.'],
]

function Dock({ items }) {
  const [show, setShow] = useState(false)
  const [active, setActive] = useState('')
  useEffect(() => {
    const f = () => {
      setShow(window.scrollY > window.innerHeight * 0.6)
      let cur = ''
      items.forEach((id) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) cur = id })
      setActive(cur)
    }
    f(); window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [items])
  return (
    <div className={`fixed bottom-3 sm:bottom-6 inset-x-0 z-40 flex justify-center px-2 ${show ? '' : 'pointer-events-none'}`}>
      <motion.nav initial={false} animate={{ y: show ? 0 : 100, opacity: show ? 1 : 0 }} transition={{ duration: 0.7, ease }}
        className="flex items-center gap-0.5 min-[360px]:gap-1 rounded-full border border-white/15 bg-[#0d0d0d]/85 backdrop-blur-xl p-1 sm:p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.6)] max-w-full overflow-x-auto">
        <a href="#top" aria-label="Back to top" className="w-7 h-7 min-[360px]:w-8 min-[360px]:h-8 sm:w-9 sm:h-9 shrink-0 grid place-items-center rounded-full font-mono text-[9px] min-[360px]:text-[10px] text-white/60 hover:text-white">↑</a>
        {items.map((id) => (
          <a key={id} href={`#${id}`} className={`relative px-2 min-[360px]:px-2.5 sm:px-4 h-7 min-[360px]:h-8 sm:h-9 shrink-0 grid place-items-center rounded-full font-mono text-[9px] min-[360px]:text-[10px] sm:text-[11px] uppercase tracking-[0.1em] min-[360px]:tracking-[0.15em] transition-colors duration-300 ${active === id ? 'text-black' : 'text-white/60 hover:text-white'}`}>
            {active === id && <motion.span layoutId="dock-pill" className="absolute inset-0 rounded-full bg-white" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
            <span className="relative">{id}</span>
          </a>
        ))}
      </motion.nav>
    </div>
  )
}

function Pillar({ t, d, i }) {
  return (
    <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 1.1, delay: i * 0.12, ease }}
      className="group border-t border-white/15 pt-4 sm:pt-6 relative">
      <motion.span className="absolute -top-px left-0 h-px bg-white" initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ duration: 1.4, delay: 0.3 + i * 0.12, ease }} />
      <p className="font-mono text-[10px] sm:text-[11px] text-white/40">0{i + 1}</p>
      <h3 className="mt-3 sm:mt-6 text-xl min-[360px]:text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">{t}</h3>
      <p className="mt-2 sm:mt-4 text-xs min-[360px]:text-sm sm:text-base text-white/60 leading-relaxed max-w-sm">{d}</p>
    </motion.div>
  )
}

function ContactForm({ open, onClose }) {
  const [sent, setSent] = useState(false)
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open])
  const submit = (e) => {
    e.preventDefault()
    const d = new FormData(e.currentTarget)
    window.location.href = `mailto:hello@example.com?subject=${encodeURIComponent(d.get('subject') || 'Hello from your portfolio')}&body=${encodeURIComponent(`${d.get('message')}\n\n— ${d.get('name')} (${d.get('email')})`)}`
    setSent(true)
  }
  const field = 'w-full bg-transparent border-b border-white/20 focus:border-white outline-none py-3 sm:py-4 text-base sm:text-xl placeholder:text-white/25 transition-colors'
  return (
    <motion.div initial={false} animate={{ clipPath: open ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)' }} transition={{ duration: 0.9, ease }}
      className={`fixed inset-0 z-[60] bg-[#0b0b0b] overflow-y-auto ${open ? '' : 'pointer-events-none'}`}>
      <div className={`${pad} py-4 sm:py-6 flex justify-between items-center font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em]`}>
        <span className="text-white/50">04 — Contact</span>
        <button onClick={onClose} className="hover:text-white text-white/70 px-2 py-1 rounded border border-white/15">Close ✕</button>
      </div>
      <div className={`${pad} pt-6 sm:pt-10 md:pt-16 pb-16 sm:pb-20 max-w-[1500px] mx-auto grid lg:grid-cols-12 gap-8 sm:gap-14`}>
        <div className="lg:col-span-5">
          <h2 className="text-4xl min-[360px]:text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.95]">Let's<br /><span className="font-serif italic font-normal text-white/45">connect.</span></h2>
          <p className="mt-4 sm:mt-6 text-xs min-[360px]:text-sm sm:text-base text-white/55 max-w-sm">Have an idea, a project or just want to talk tech and business? Drop a message.</p>
        </div>
        <form onSubmit={submit} className="lg:col-span-7 flex flex-col gap-3 sm:gap-4">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 sm:gap-y-4">
            <input required name="name" placeholder="Your name" className={field} />
            <input required type="email" name="email" placeholder="Your email" className={field} />
          </div>
          <input name="subject" placeholder="Subject" className={field} />
          <textarea required name="message" rows={4} placeholder="Your message" className={`${field} resize-none`} />
          <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-4 sm:gap-6">
            <button type="submit" className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white text-black px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm uppercase tracking-[0.16em] sm:tracking-[0.18em]">
              <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] bg-neutral-300" />
              <span className="relative">Send message →</span>
            </button>
            {sent && <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white/50">Opening your mail app…</span>}
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default function App() {
  const mobile = useMobile()
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 70, damping: 22 })
  const [menu, setMenu] = useState(false)
  const [form, setForm] = useState(false)
  const [light, setLight] = useState(true)
  useEffect(() => {
    // background follows whichever section sits at the middle of the viewport
    const f = () => {
      let t = 'light'
      document.querySelectorAll('[data-theme]').forEach((el) => { if (el.getBoundingClientRect().top < window.innerHeight * 0.5) t = el.dataset.theme })
      setLight(t === 'light')
    }
    f(); window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  const nav = ['about', 'stack', 'projects', 'contact']

  return (
    <div className="grain relative text-[#e8e8e6]">
      <Cursor />
      <div className="fixed inset-0 z-0 transition-colors duration-700" style={{ backgroundColor: light ? '#ece8e1' : '#0a0a0a' }} />
      <Scene scroll={smooth} mobile={mobile} light={light} />
      <motion.div style={{ scaleX: smooth }} className="fixed top-0 left-0 right-0 h-px bg-white origin-left z-50" />

      {/* NAV */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.8, ease }}
        className={`absolute md:fixed top-0 inset-x-0 z-40 ${pad} py-4 sm:py-6 flex justify-between items-center mix-blend-difference`}>
        <a href="#top" className="font-mono text-[10px] min-[360px]:text-xs uppercase tracking-[0.16em] min-[360px]:tracking-[0.25em] truncate max-w-[150px] min-[320px]:max-w-none">Balakrishna K R</a>
        <div className="hidden md:flex gap-10 font-mono text-xs uppercase tracking-[0.2em]">
          {nav.map((l) => (
            <a key={l} href={`#${l}`} className="group relative overflow-hidden h-4 block">
              <span className="block group-hover:-translate-y-full transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]">{l}</span>
              <span className="block absolute top-full group-hover:-translate-y-full transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]">{l}</span>
            </a>
          ))}
        </div>
        <button className="md:hidden font-mono text-[10px] min-[360px]:text-xs uppercase tracking-[0.18em] px-2.5 py-1 rounded border border-white/20 active:bg-white/20" onClick={() => setMenu(!menu)}>{menu ? 'Close' : 'Menu'}</button>
      </motion.nav>
      <motion.div initial={false} animate={{ clipPath: menu ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)' }} transition={{ duration: 0.8, ease }}
        className={`fixed inset-0 z-50 bg-[#0d0d0d] md:hidden flex flex-col justify-between ${pad} pt-6 pb-12`}>
        <div className="flex justify-between items-center">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/50">Navigation</span>
          <button className="font-mono text-xs uppercase tracking-[0.2em] text-white px-3 py-1.5 rounded-full border border-white/20" onClick={() => setMenu(false)}>Close ✕</button>
        </div>
        <div className="flex flex-col gap-3 my-auto">
          {nav.map((l, i) => (
            <a key={l} href={`#${l}`} onClick={() => setMenu(false)} className="overflow-hidden block py-1">
              <motion.span className="block text-4xl min-[360px]:text-5xl font-semibold capitalize tracking-tight" animate={{ y: menu ? 0 : '100%' }} transition={{ duration: 0.8, delay: menu ? 0.25 + i * 0.06 : 0, ease }}>{l}</motion.span>
            </a>
          ))}
        </div>
        <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em]">Balakrishna K R · Portfolio</p>
      </motion.div>

      <Hero />
      <Dock items={nav} />

      {/* ABOUT — scroll-lit manifesto */}
      <section id="about" data-theme="dark" className={`relative z-10 ${pad} pt-8 min-[360px]:pt-10 sm:pt-28 md:pt-44 pb-8 min-[360px]:pb-10 sm:pb-20 max-w-[1500px] mx-auto`}>
        <Label n="01" t="About" />
        <ScrollText text="I'm a BBA Honors student at T. A. Pai Management Institute, Bengaluru with a strong parallel focus on _modern _technology. I bring _business and _management learning together with _tech — taking requirements and turning them into _robust products." />
        <div className="grid md:grid-cols-3 gap-5 sm:gap-10 md:gap-8 mt-6 min-[360px]:mt-8 sm:mt-24 md:mt-36">
          {pillars.map(([t, d], i) => <Pillar key={t} t={t} d={d} i={i} />)}
        </div>
      </section>

      {/* CAPABILITIES */}
      <section data-theme="light" className={`light relative z-10 ${pad} py-8 min-[360px]:py-10 sm:py-20 md:py-32 max-w-[1500px] mx-auto`}>
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-10">
          <div className="lg:col-span-5">
            <h2 className="text-3xl min-[360px]:text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
              <Lines>Complex</Lines><Lines delay={0.08}>functionality,</Lines><Lines delay={0.16} className="font-serif italic font-normal text-white/50">built in.</Lines>
            </h2>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2, ease }}
              className="mt-5 sm:mt-8 p-3.5 min-[360px]:p-4.5 sm:p-6 rounded-r-2xl bg-white/[0.04] sm:bg-white/[0.05] border border-white/10 border-l-[3.5px] sm:border-l-4 border-l-white shadow-[0_8px_30px_rgba(20,20,20,0.03)] w-full max-w-xl">
              <p className="text-sm min-[360px]:text-base sm:text-xl md:text-2xl lg:text-[1.38rem] xl:text-[1.55rem] text-white/85 leading-snug sm:leading-[1.36] tracking-tight">
                Features that make projects which are <span className="text-white font-semibold underline decoration-white/30 underline-offset-[5px] decoration-2">smart, connected, secure</span> and <span className="font-serif italic font-normal text-white">ready to use.</span>
              </p>
            </motion.div>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-px bg-white/10 border border-white/10 rounded-xl overflow-hidden">
            {[['AI integration', 'Intelligent features, from LLM assistants to automation.'], ['2D & 3D maps', 'Interactive geospatial rendering that turns data into insight.'],
              ['Payment gateways', 'Secure checkout flows that let products earn.'], ['Google auth', 'Sign-in and sessions via NextAuth, done properly.']].map(([t, d], i) => (
              <motion.div key={t} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.1 }}
                className="group bg-black/60 backdrop-blur p-4 min-[360px]:p-5 sm:p-7 md:p-9 min-h-[140px] sm:min-h-[200px] flex flex-col justify-between hover:bg-white/[0.06] transition-colors duration-500" data-hover>
                <div className="flex justify-between font-mono text-[10px] sm:text-[11px] text-white/40"><span>0{i + 1}</span><span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">→</span></div>
                <div className="mt-3 sm:mt-4">
                  <h3 className="text-base min-[360px]:text-lg sm:text-2xl font-semibold">{t}</h3>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-white/60">{d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STACK */}
      <section id="stack" data-theme="dark" className={`relative z-10 ${pad} py-8 min-[360px]:py-10 sm:py-20 md:py-32 max-w-[1500px] mx-auto`}>
        <Label n="02" t="Stack" />
        <div className="border-t border-white/15">
          {stack.map((s, i) => (
            <motion.div key={s.g} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.9, delay: i * 0.06, ease }}
              className="group relative grid md:grid-cols-12 gap-2 sm:gap-3 md:gap-4 py-3.5 min-[360px]:py-4 sm:py-7 md:py-10 border-b border-white/15 items-baseline overflow-hidden" data-hover>
              <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]" />
              <span className="relative md:col-span-1 font-mono text-[10px] sm:text-[11px] text-white/40 group-hover:text-black/50 transition-colors duration-500 md:pl-3">0{i + 1}</span>
              <h3 className="relative md:col-span-5 text-lg min-[360px]:text-xl sm:text-4xl md:text-5xl font-semibold tracking-tight group-hover:text-black transition-colors duration-500">{s.g}</h3>
              <p className="relative md:col-span-6 text-xs sm:text-sm text-white/60 group-hover:text-black/70 transition-colors duration-500 md:text-right md:pr-3 break-words">{s.items.join('  ·  ')}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <ProjectViewer />

      {/* CONTACT */}
      <section id="contact" data-theme="dark" className={`relative z-10 ${pad} pt-8 min-[360px]:pt-10 sm:pt-24 md:pt-32 pb-12 sm:pb-16 max-w-[1500px] mx-auto`}>
        <Label n="04" t="Contact" />
        <h2 className="text-4xl min-[360px]:text-5xl sm:text-[13vw] lg:text-[11vw] 2xl:text-[13rem] font-semibold tracking-[-0.04em] leading-[0.92] sm:leading-[0.88]">
          <Lines>Contact</Lines>
        </h2>
        <div className="mt-6 min-[360px]:mt-8 sm:mt-14 flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-10">
          <div>
            <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-white/40">Let's connect ↘</p>
            <button onClick={() => setForm(true)} className="group mt-3 sm:mt-6 inline-flex items-center gap-3 sm:gap-4 text-xl min-[360px]:text-2xl sm:text-3xl font-semibold tracking-tight text-left">
              <span className="relative">Open contact form<span className="absolute left-0 -bottom-1 h-px w-full bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]" /></span>
              <span className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 grid place-items-center rounded-full border border-white/25 group-hover:bg-white group-hover:text-black group-hover:-rotate-45 transition-all duration-500 text-sm sm:text-base">→</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Magnetic href="mailto:hello@example.com" solid>Email me</Magnetic>
            <Magnetic href="https://www.linkedin.com/">LinkedIn</Magnetic>
            <Magnetic href="https://github.com/">GitHub</Magnetic>
          </div>
        </div>
        <footer className="mt-12 min-[360px]:mt-16 sm:mt-28 md:mt-36 pt-6 border-t border-white/15 flex flex-col sm:flex-row gap-3 justify-between font-mono text-[10px] sm:text-[11px] text-white/40 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
          <span>© {new Date().getFullYear()} Balakrishna K R</span><span>T. A. Pai Management Institute · Bengaluru</span>
          <a href="#top" className="hover:text-white transition-colors">Back to top ↑</a>
        </footer>
      </section>
      <ContactForm open={form} onClose={() => setForm(false)} />
    </div>
  )
}
