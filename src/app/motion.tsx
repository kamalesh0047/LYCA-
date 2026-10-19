import { useEffect, useLayoutEffect, type ReactNode } from "react"
import { motion, useScroll, useSpring, useReducedMotion } from "motion/react"
import Lenis from "lenis"
import {onFrame} from "./frameLoop"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import "lenis/dist/lenis.css"

let smooth: Lenis | null = null
const positions = new Map<string, number>()
export function SmoothScrolling() {
  const reduce=useReducedMotion()
  useEffect(()=>{
    if(reduce)return
    const lenis=new Lenis({lerp:.085,smoothWheel:true,syncTouch:false,anchors:true,stopInertiaOnNavigate:true,allowNestedScroll:true})
    smooth=lenis
    lenis.on("scroll",ScrollTrigger.update)
    const stop=onFrame(time=>lenis.raf(time))
    return()=>{stop();lenis.destroy();if(smooth===lenis)smooth=null}
  },[reduce])
  return null
}
export function glideTo(top:number){
  if(smooth)smooth.scrollTo(top,{duration:1.4})
  else window.scrollTo({top,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"})
}
export function jumpTo(top:number){
  if(smooth){smooth.resize();smooth.scrollTo(top,{immediate:true,force:true})}
  else window.scrollTo({top,behavior:"instant"})
}
export function PageScene({ children, routeKey, hash, path, navigation }: {children:ReactNode;routeKey:string;hash:string;path:string;navigation:string}) {
  const reduce=useReducedMotion()
  useLayoutEffect(()=>{
    const previous=history.scrollRestoration;history.scrollRestoration="manual"
    let raf=0
    const restore=()=>{
      let target=navigation==="POP" ? positions.get(routeKey)||0 : 0
      if(hash){let id=hash.slice(1);try{id=decodeURIComponent(id)}catch{};const el=document.getElementById(id);if(el)target=el.getBoundingClientRect().top+scrollY-(parseFloat(getComputedStyle(el).scrollMarginTop)||130)}
      jumpTo(Math.max(0,target))
    }
    restore();raf=requestAnimationFrame(restore)
    const save=()=>positions.set(routeKey,scrollY)
    window.addEventListener("scroll",save,{passive:true})
    return()=>{save();window.removeEventListener("scroll",save);cancelAnimationFrame(raf);history.scrollRestoration=previous}
  },[routeKey,hash,navigation])
  return <motion.main id="main-content" className="route-surface" data-route={path} tabIndex={-1}
    initial={reduce?false:{opacity:0,clipPath:"inset(12% 0 12% 0)",scale:.985}}
    animate={{opacity:1,clipPath:"inset(0% 0 0% 0)",scale:1}}
    exit={reduce?{opacity:1}:{opacity:0,clipPath:"inset(8% 0 8% 0)",scale:1.03,transition:{duration:.32,ease:"easeIn"}}}
    transition={{duration:reduce?0:.7,ease:[.16,1,.3,1]}}
    onAnimationComplete={()=>{const main=document.getElementById("main-content");if(main&&Number(main.style.opacity)===1){main.style.filter="none";main.style.clipPath="none";main.style.removeProperty("transform");if(routeKey!=="default"&&navigation!=="POP")main.focus({preventScroll:true})}}}
  >{children}</motion.main>
}
export function ScrollProgress(){
  const {scrollYProgress}=useScroll();const scale=useSpring(scrollYProgress,{stiffness:160,damping:30});const reduce=useReducedMotion()
  return <div className="scroll-progress" aria-hidden="true"><motion.div style={{scaleX:reduce?scrollYProgress:scale}}/></div>
}
