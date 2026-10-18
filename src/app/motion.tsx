import { useLayoutEffect, useEffect } from "react"
import { useLocation, useNavigationType } from "react-router"
import { animate, inView, motion, useScroll, useSpring, useReducedMotion } from "motion/react"

const positions = new Map<string, number>()
export function ScrollExperience() {
  const location = useLocation()
  const navigation = useNavigationType()
  useEffect(() => {
    const previous = history.scrollRestoration
    history.scrollRestoration = "manual"
    return () => { history.scrollRestoration = previous }
  }, [])
  useLayoutEffect(() => {
    let raf = 0
    const restore = () => {
      let target = navigation === "POP" ? positions.get(location.key) || 0 : 0
      if (location.hash) {
        let id = location.hash.slice(1)
        try { id = decodeURIComponent(id) } catch { /* tolerate malformed links */ }
        const element = document.getElementById(id)
        if (element) target = element.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(element).scrollMarginTop) || 140)
      }
      window.scrollTo({ top: Math.max(0, target), behavior: "instant" })
    }
    restore()
    raf = requestAnimationFrame(restore)
    const save = () => positions.set(location.key, window.scrollY)
    window.addEventListener("scroll", save, { passive: true })
    return () => { save(); cancelAnimationFrame(raf); window.removeEventListener("scroll", save) }
  }, [location.key, location.hash, navigation])
  return null
}

/** Motion owns reveal transforms; nested panels are not double-animated. */
export function ScrollReveals() {
  const location = useLocation()
  const reduce = useReducedMotion()
  useLayoutEffect(() => {
    const main = document.getElementById("main-content")
    if (!main || reduce) return
    const cleanups: (() => void)[] = []
    const seen = new WeakSet<Element>()
    const scan = () => {
      main.querySelectorAll<HTMLElement>(".reveal").forEach(element => {
        if (seen.has(element)) return
        seen.add(element)
        if (element.parentElement?.closest(".reveal")) return
        const siblings = Array.from(element.parentElement?.children || [])
        const delay = Math.min(siblings.indexOf(element), 3) * .045
        const stop = inView(element, () => {
          const controls = animate(element, { opacity: [0, 1], y: [16, 0] }, { duration: .48, delay, ease: [.22, 1, .36, 1] })
          cleanups.push(() => { controls.stop(); element.style.opacity = ""; element.style.transform = "" })
        }, { margin: "0px 0px -24px 0px" })
        cleanups.push(stop)
      })
    }
    scan()
    const observer = new MutationObserver(scan)
    observer.observe(main, { childList: true, subtree: true })
    return () => { observer.disconnect(); cleanups.forEach(cleanup => cleanup()) }
  }, [location.pathname, reduce])
  return null
}
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 35 })
  const reduce = useReducedMotion()
  return <div className="scroll-progress" aria-hidden="true"><motion.div style={{ scaleX: reduce ? scrollYProgress : progress }} /></div>
}
