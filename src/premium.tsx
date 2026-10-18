import { useEffect, useRef, useState, type ReactNode } from "react"


/** Grain, vignette, cursor glow, scroll reveals and card spotlights for the whole site. Mount once. */
export function Atmosphere() {
  const glow=useRef<HTMLDivElement>(null)
  const ring=useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = document.documentElement
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
    root.classList.add("fx-ready")

    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target) }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    )
    const spotlightSelector="[data-spotlight],.collection-panel,.industry-card,.office-card,.values-grid article,.network-summary,.process-card,.enquiry-form,.cta-section,.product-line,.button,.film-glass"

    const observed = new WeakSet<Element>()
    const watch=(el:Element)=>{
      if(observed.has(el))return
      observed.add(el)
      if(reduce)el.classList.add("is-in");else io.observe(el)
    }
    const scan=(node:ParentNode)=>node.querySelectorAll(".reveal:not(.is-in), .kinetic:not(.is-in)").forEach(watch)
    scan(document)
    const mo=new MutationObserver(records=>{
      let added=false
      for(const record of records)for(const node of record.addedNodes){
        if(!(node instanceof Element))continue
        added=true
        if(node.matches('.reveal,.kinetic'))watch(node)
        scan(node)
      }

    })
    mo.observe(document.body,{childList:true,subtree:true})

    let raf=0,scrollRaf=0,decay=0,x=0,y=0,sx=0,sy=0,lastY=scrollY,lastT=performance.now()
    const fine=matchMedia('(hover: hover) and (pointer: fine)').matches
    const paint=()=>{
      raf=0;sx+=(x-sx)*.16;sy+=(y-sy)*.16
      if(glow.current)glow.current.style.transform=`translate3d(${sx-310}px,${sy-310}px,0)`
      if(ring.current)ring.current.style.transform=`translate3d(${sx}px,${sy}px,0) translate(-50%,-50%)`
      if(Math.abs(sx-x)>.15||Math.abs(sy-y)>.15)raf=requestAnimationFrame(paint)
    }
    const move=(e:PointerEvent)=>{
      x=e.clientX;y=e.clientY
      if(!root.classList.contains('has-cursor-fx')){sx=x;sy=y;root.classList.add('has-cursor-fx')}
      glow.current?.classList.add('is-active');ring.current?.classList.add('is-active')
      ring.current?.classList.toggle('is-hover',!!(e.target as Element)?.closest('a,button,input,select,textarea,[role=button]'))
      if(!raf)raf=requestAnimationFrame(paint)
      const card=(e.target as Element)?.closest<HTMLElement>(spotlightSelector);if(card){const r=card.getBoundingClientRect();card.style.setProperty("--mx",`${x-r.left}px`);card.style.setProperty("--my",`${y-r.top}px`)}
    }
    const leave=()=>{glow.current?.classList.remove('is-active');ring.current?.classList.remove('is-active');root.classList.remove('has-cursor-fx')}
    const scroll=()=>{
      if(scrollRaf)return
      scrollRaf=requestAnimationFrame(()=>{
        scrollRaf=0;const now=performance.now();const v=Math.max(-20,Math.min(20,(scrollY-lastY)/Math.max(16,now-lastT)));lastY=scrollY;lastT=now
        
        const bar=document.querySelector<HTMLElement>(".fx-progress__bar");if(bar)bar.style.transform=`scaleX(${scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)})`
        clearTimeout(decay);decay=window.setTimeout(()=>root.style.setProperty('--scroll-velocity','0'),100)
      })
    }
    if(fine&&!reduce){window.addEventListener('pointermove',move,{passive:true});document.addEventListener('mouseleave',leave)}
    window.addEventListener('scroll',scroll,{passive:true});scroll()


    return () => {
      io.disconnect(); mo.disconnect();cancelAnimationFrame(raf);cancelAnimationFrame(scrollRaf);clearTimeout(decay);window.removeEventListener("pointermove",move);document.removeEventListener("mouseleave",leave);window.removeEventListener("scroll",scroll);root.classList.remove("has-cursor-fx");root.style.removeProperty("--scroll-velocity")
      root.classList.remove("fx-ready")
    }
  }, [])

  return <>
    <div className="fx-progress" aria-hidden="true"><div className="fx-progress__bar"/></div>
    <div className="fx-cursor-glow" ref={glow} aria-hidden="true"/>
    <div className="fx-cursor-ring" ref={ring} aria-hidden="true"/>
    <div className="fx-vignette" aria-hidden="true" />
  </>
}

/** Splits a line into words that rise in sequence when scrolled into view. */
export function Kinetic({ text, accent, as: Tag = "h2", className = "" }:
  { text: string; accent?: string; as?: "h1" | "h2" | "h3"; className?: string }) {
  let i = 0
  const words = (line: string, isAccent = false) => line.split(" ").map(w =>
    <span className="kinetic__mask" key={`${w}-${i}`}>
      <span className={`kinetic__word${isAccent ? " is-accent is-gradient" : ""}`} style={{ ["--i" as string]: i++ }}>{w}&nbsp;</span>
    </span>)
  return <Tag className={`kinetic ${className}`} aria-label={accent ? `${text} ${accent}` : text}>
    <span aria-hidden="true">{words(text)}{accent && <><br />{words(accent, true)}</>}</span>
  </Tag>
}

/** Automatic ingredient ticker; pauses offscreen to save rendering work. */
export function Marquee({ items, reverse = false, speed=40 }: { items: string[]; reverse?: boolean; speed?:number }) {
  const ref=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    const el=ref.current;if(!el)return
    const io=new IntersectionObserver(([entry])=>{el.dataset.offscreen=String(!entry.isIntersecting)},{rootMargin:'80px'})
    io.observe(el)
    let down=false,dragging=false,startX=0,startY=0,offset=0,base=0
    const pointerDown=(e:PointerEvent)=>{if(e.button!==0)return;down=true;dragging=false;startX=e.clientX;startY=e.clientY;base=offset}
    const pointerMove=(e:PointerEvent)=>{
      if(!down)return
      const dx=e.clientX-startX,dy=e.clientY-startY
      if(!dragging&&Math.abs(dy)>Math.abs(dx)+8){down=false;return}
      if(!dragging&&Math.abs(dx)>8){dragging=true;el.classList.add('is-dragging');el.setPointerCapture(e.pointerId)}
      if(dragging){offset=base+dx;el.style.setProperty('--drag-x',`${offset}px`)}
    }
    const pointerUp=()=>{down=false;dragging=false;el.classList.remove('is-dragging')}
    el.addEventListener('pointerdown',pointerDown);window.addEventListener('pointermove',pointerMove,{passive:true});window.addEventListener('pointerup',pointerUp);el.addEventListener('pointercancel',pointerUp)
    return()=>{io.disconnect();el.removeEventListener('pointerdown',pointerDown);window.removeEventListener('pointermove',pointerMove);window.removeEventListener('pointerup',pointerUp);el.removeEventListener('pointercancel',pointerUp)}
  },[])
  const row = items.map((t, n) => <span key={n} className="marquee__item">{t}<i aria-hidden="true">✦</i></span>)
  return <div ref={ref} style={{["--marquee-speed" as string]:`${speed}s`}} className={`marquee${reverse ? " marquee--reverse" : ""}`} aria-label={items.join(", ")}>
    <div className="marquee__track" aria-hidden="true">{row}{row}{row}</div>
    <i className="marquee__fade marquee__fade--l" aria-hidden="true"/><i className="marquee__fade marquee__fade--r" aria-hidden="true"/>
  </div>
}

/** Counts up to a number once visible. */
export function CountUp({ to, pad = 2, label }: { to: number; pad?: number; label: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [n, setN] = useState(0)
  const [done,setDone]=useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(to);setDone(true); return }
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const start = performance.now(), dur = 1600
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur)
        setN(Math.round(to * (1 - Math.pow(1 - p, 4))))
        if (p < 1) raf = requestAnimationFrame(tick);else setDone(true)
      }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    io.observe(el)
    return () => {io.disconnect();cancelAnimationFrame(raf)}
  }, [to])
  return <div className={`stat stat--count${done?" is-done":""}`} ref={ref}>
    <i className="stat__glow" aria-hidden="true"/>
    <strong aria-label={String(to)}>{String(n).padStart(pad, "0")}</strong><span>{label}</span>
  </div>
}
