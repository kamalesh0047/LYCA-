import { useEffect, useLayoutEffect, useRef, useState, useId } from "react"
import { Link } from "react-router"
import { ArrowDown, ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react"
import logo from "../assets/lyca-logo.png"
import { images } from "./data"
import { glideTo } from "./motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
gsap.registerPlugin(ScrollTrigger)

export function useReducedMotion(){
 const [reduce,setReduce]=useState(()=>typeof window!=="undefined"&&matchMedia("(prefers-reduced-motion: reduce)").matches)
 useEffect(()=>{const query=matchMedia("(prefers-reduced-motion: reduce)");const update=()=>setReduce(query.matches);query.addEventListener("change",update);update();return()=>query.removeEventListener("change",update)},[])
 return reduce
}

/** The supplied logo is rendered intact; a colour matrix removes its paper backdrop. */
export function LogoMark({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "")
  return <svg className={`logo-mark ${className}`} viewBox="0 0 160 160" role="img" aria-label="LYCA Food Ingredients Supplies logo">
    <defs><filter id={id} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .83  0 0 0 0 .94  0 0 0 0 .43  -.72 -.72 -.72 0 2.16" /><feComposite in2="SourceAlpha" operator="in" /></filter></defs>
    <image href={logo} width="160" height="160" filter={`url(#${id})`} />
  </svg>
}

const vertex = `attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`
const fragment = `precision highp float;
varying vec2 uv;uniform vec2 resolution;uniform float time;uniform float scroll;uniform float transition;uniform float intensity;uniform vec2 pointer;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
 vec2 p=uv;vec2 asp=vec2(resolution.x/resolution.y,1.);float t=time*.05;
 float fog=fbm((p-pointer*.035)*asp*2.2+vec2(t*.6,-t*.25)+scroll*.9);
 float fog2=fbm((p-pointer*.02)*asp*3.6-vec2(t*.3,t*.45)+scroll*.4);
 vec2 light=vec2(.80+pointer.x*.06,1.10+pointer.y*.03);
 vec2 d=(p-light)*asp;float ang=atan(d.y,d.x);
 float rays=pow(.5+.5*sin(ang*26.+t*2.5+fbm(vec2(ang*5.,t*.8))*4.),3.)*(1.-smoothstep(.05,1.5,length(d)));
 float silk=exp(-pow((p.y-.42-sin(p.x*4.+t*2.+scroll*1.4)*.11)*4.,2.));
 vec3 deep=vec3(.045,.016,.095),violet=vec3(.34,.12,.58),lime=vec3(.58,.66,.32);
 vec3 col=deep;
 col+=violet*(fog*.36+fog2*.16)*(.55+intensity*.7);
 col+=mix(violet,lime,.22)*rays*(.10+intensity*.26);
 col+=vec3(.09,.03,.15)*silk;
 col+=lime*.06*(1.-smoothstep(0.,.9,length((p-vec2(.15,.2))*asp)))*fog2;
 float v=1.-smoothstep(.3,1.25,length((p-.5)*asp*1.1));col*=.5+.5*v;
 col+=(hash(p*resolution+fract(time))-.5)*.012;
 gl_FragColor=vec4(col,1.);
}`
const iris = `precision mediump float; varying vec2 uv;uniform vec2 resolution;uniform float time;uniform float scroll;uniform float transition;uniform float intensity;
void main(){float t=transition;vec2 p=(uv-.5)*vec2(resolution.x/resolution.y,1.);float r=length(p);
float cover=smoothstep(0.,.38,t)*(1.-smoothstep(.58,1.,t));
float ring=exp(-abs(r-(t*2.4-.15))*18.)*sin(t*3.14159);
float alpha=clamp(cover+ring*.7,0.,1.);vec3 color=mix(vec3(.24,.055,.40),vec3(.48,.18,.70),clamp(r*.8,0.,1.));gl_FragColor=vec4(color,alpha);
}`

/** Restrained silk lighting; photography carries the main animation. */
export function WebGLWorld({ overlay = false }: { overlay?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [generation,setGeneration]=useState(0)
  const reduce = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas || reduce) return
    const gl = canvas.getContext("webgl", { alpha: overlay, antialias: false, powerPreference: "high-performance" })
    if (!gl) {canvas.dataset.webgl="unavailable";return}
    const shader = (kind: number, source: string) => {
      const s = gl.createShader(kind)!
      gl.shaderSource(s, source); gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null }
      return s
    }
    const vs = shader(gl.VERTEX_SHADER, vertex), fs = shader(gl.FRAGMENT_SHADER, overlay ? iris : fragment)
    if (!vs || !fs) { if(vs)gl.deleteShader(vs);if(fs)gl.deleteShader(fs);return }
    const program = gl.createProgram()!
    gl.attachShader(program, vs);gl.attachShader(program, fs);gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);return}
    gl.useProgram(program)
    canvas.dataset.webgl="active";canvas.style.opacity="1"
    const buffer = gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW)
    const pos=gl.getAttribLocation(program,"position");gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0)
    const uniforms = { resolution:gl.getUniformLocation(program,"resolution"),time:gl.getUniformLocation(program,"time"),scroll:gl.getUniformLocation(program,"scroll"),transition:gl.getUniformLocation(program,"transition"),intensity:gl.getUniformLocation(program,"intensity"),pointer:gl.getUniformLocation(program,"pointer") }
    let raf=0,last=0,currentScroll=0,targetScroll=0,currentIntensity=.22,targetIntensity=.22,transitionStart=-10000
    let px=0,py=0,tpx=0,tpy=0
    const move=(e:PointerEvent)=>{tpx=e.clientX/innerWidth-.5;tpy=.5-e.clientY/innerHeight}
    const portal=(e:Event)=>{targetScroll=(e as CustomEvent<number>).detail;const t=Math.max(0,Math.min(1,(targetScroll-.90)/.1));targetIntensity=1-t*t*(3-2*t)*.8}
    const leave=()=>{targetIntensity=.22;targetScroll=0}
    const navigate=()=>{transitionStart=performance.now()}
    let stillFrame=true
    const resize=()=>{ stillFrame=true;const dpr=Math.min(.5,640/Math.max(innerWidth,innerHeight));canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);gl.viewport(0,0,canvas.width,canvas.height);if(canvas.dataset.motion==="static")raf=window.setTimeout(()=>render(performance.now()),0) }
    const size=new ResizeObserver(resize);size.observe(canvas);resize()
    window.addEventListener("pointermove",move,{passive:true});window.addEventListener("lyca:portal",portal);window.addEventListener("lyca:portal-leave",leave);window.addEventListener("lyca:transition",navigate)
    let contextLost=false
    const lost=(e:Event)=>{e.preventDefault();contextLost=true;canvas.style.opacity="0"}
    const restored=()=>setGeneration(value=>value+1)
    canvas.addEventListener("webglcontextlost",lost);canvas.addEventListener("webglcontextrestored",restored)
    let economy=document.documentElement.classList.contains("fx-economy")
    const render=(now:number)=>{
      if(document.hidden){raf=0;return}
      if(economy&&last>0&&!stillFrame){raf=0;canvas.dataset.motion="static";return}
      canvas.dataset.motion="animated"
      raf=window.setTimeout(()=>render(performance.now()),60)
      if(contextLost||now-last<55)return
      stillFrame=false;last=now;currentScroll+=(targetScroll-currentScroll)*.18;currentIntensity+=(targetIntensity-currentIntensity)*.08;px+=(tpx-px)*.05;py+=(tpy-py)*.05
      const t=Math.min(1,(now-transitionStart)/1050)
      if(overlay&&t>=1){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);return}
      gl.useProgram(program);gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);gl.uniform1f(uniforms.time,now*.001);gl.uniform1f(uniforms.scroll,currentScroll);gl.uniform1f(uniforms.intensity,currentIntensity);gl.uniform1f(uniforms.transition,t<1?t:0);gl.uniform2f(uniforms.pointer,px,py);gl.drawArrays(gl.TRIANGLES,0,6)
    }
    const visibility=()=>{if(document.hidden){clearTimeout(raf);raf=0}else if(!raf)render(performance.now())}
    const quality=()=>{economy=document.documentElement.classList.contains("fx-economy");if(!economy&&!raf)render(performance.now())}
    window.addEventListener("lyca:quality",quality)
    document.addEventListener("visibilitychange",visibility)
    render(performance.now())
    return()=>{window.removeEventListener("lyca:quality",quality);document.removeEventListener("visibilitychange",visibility);clearTimeout(raf);window.removeEventListener("pointermove",move);size.disconnect();canvas.removeEventListener("webglcontextlost",lost);canvas.removeEventListener("webglcontextrestored",restored);window.removeEventListener("lyca:portal",portal);window.removeEventListener("lyca:portal-leave",leave);window.removeEventListener("lyca:transition",navigate);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs)}
  },[overlay,reduce,generation])
  return <canvas ref={ref} className={overlay ? "webgl-iris" : "webgl-world"} aria-hidden="true" />
}

export function Dust({count=36}:{count?:number}){
 const ref=useRef<HTMLCanvasElement>(null)
 const reduce=useReducedMotion()
 useEffect(()=>{
  const c=ref.current;if(!c||reduce)return
  const ctx=c.getContext('2d');if(!ctx)return
  const sprite=document.createElement('canvas');sprite.width=sprite.height=24
  const brush=sprite.getContext('2d')!;const g=brush.createRadialGradient(12,12,0,12,12,12)
  g.addColorStop(0,'rgba(231,214,247,.6)');g.addColorStop(1,'rgba(231,214,247,0)');brush.fillStyle=g;brush.fillRect(0,0,24,24)
  type Particle={x:number;y:number;r:number;vx:number;vy:number;a:number;tw:number}
  let timer=0,w=0,h=0,px=0,py=0,last=0,economy=document.documentElement.classList.contains('fx-economy')
  let particles:Particle[]=[]
  const seed=()=>{w=c.width=Math.round(innerWidth*.5);h=c.height=Math.round(innerHeight*.5);particles=Array.from({length:innerWidth<700?14:count},()=>({x:Math.random()*w,y:Math.random()*h,r:2+Math.random()*4,vx:(Math.random()-.5)*.08,vy:-.04-Math.random()*.1,a:.2+Math.random()*.5,tw:Math.random()*6.28}))}
  const move=(e:PointerEvent)=>{px=e.clientX/innerWidth-.5;py=e.clientY/innerHeight-.5}
  const loop=(t:number)=>{
   if(document.hidden||economy){timer=0;return}timer=window.setTimeout(()=>loop(performance.now()),60)
   const dt=Math.min(5,(t-last)/16.667||1);last=t;ctx.clearRect(0,0,w,h)
   for(const p of particles){p.x+=(p.vx-px*.12)*dt;p.y+=(p.vy-py*.12)*dt;if(p.y< -10){p.y=h+10;p.x=Math.random()*w}if(p.x< -10)p.x=w+10;if(p.x>w+10)p.x=-10;ctx.globalAlpha=p.a*(.6+.4*Math.sin(t*.0015+p.tw));ctx.drawImage(sprite,p.x-p.r,p.y-p.r,p.r*2,p.r*2)}
   ctx.globalAlpha=1
  }
  const visibility=()=>{clearTimeout(timer);timer=0;if(!document.hidden&&!economy){last=performance.now();loop(last)}}
  const quality=()=>{economy=document.documentElement.classList.contains('fx-economy');visibility()}
  seed();window.addEventListener('resize',seed);window.addEventListener('pointermove',move,{passive:true});document.addEventListener('visibilitychange',visibility);window.addEventListener('lyca:quality',quality);loop(performance.now())
  return()=>{clearTimeout(timer);window.removeEventListener('resize',seed);window.removeEventListener('pointermove',move);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('lyca:quality',quality)}
 },[count,reduce])
 return reduce?null:<canvas ref={ref} className="fx-dust" aria-hidden="true"/>
}

export function Letterbox(){
 const reduce=useReducedMotion()
 const [stage,setStage]=useState<'title'|'open'|'done'>(()=>{try{return sessionStorage.getItem('lyca:opened')?'done':'title'}catch{return 'title'}})
 const opening=useRef(stage!=='done')
 useEffect(()=>{
  if(!opening.current)return
  if(reduce){setStage('done');return}
  const root=document.documentElement;root.classList.add('is-cold-open')
  const a=setTimeout(()=>setStage('open'),1900)
  const b=setTimeout(()=>{setStage('done');opening.current=false;try{sessionStorage.setItem('lyca:opened','1')}catch{};root.classList.remove('is-cold-open')},3300)
  return()=>{clearTimeout(a);clearTimeout(b);root.classList.remove('is-cold-open')}
 },[reduce])
 useEffect(()=>{
  let timer=0
  const bars=()=>{if(reduce)return;document.documentElement.classList.add('is-cutting');clearTimeout(timer);timer=window.setTimeout(()=>document.documentElement.classList.remove('is-cutting'),1100)}
  window.addEventListener('lyca:transition',bars)
  return()=>{clearTimeout(timer);window.removeEventListener('lyca:transition',bars);document.documentElement.classList.remove('is-cutting')}
 },[reduce])
 return <><div className="film-bars" aria-hidden="true"><i/><i/></div>{stage!=='done'&&!reduce&&<div className={`title-card ${stage==='open'?'is-opening':''}`} aria-hidden="true"><div className="title-card__mark"><LogoMark/></div><div className="title-card__name"><span>L</span><span>Y</span><span>C</span><span>A</span><b>.</b></div><p>FOOD INGREDIENTS SUPPLIES · A WORLD OF INGREDIENTS</p><i className="title-card__line"/></div>}</>
}

const chapters = [
 {title:"Nature, in its\npurest form.", tag:"FRUIT & JUICE", image:images.mango, detail:"Concentrates, purees and pulps. A brighter beginning for your next creation.", to:"juice-concentrates", hue:"#f2a93b"},
 {title:"A deeper\nkind of flavour.", tag:"COFFEE", image:images.coffee, detail:"Distinctive character. Rich aroma. Discover coffee ingredients for your formulation.", to:"coffee-cocoa", hue:"#8a5a3a"},
 {title:"Beautifully\nversatile.", tag:"DAIRY", image:images.dairy, detail:"Texture, richness and possibility for beverages, bakery and beyond.", to:"dairy-ingredients", hue:"#e9e3ff"},
 {title:"A little colour.\nEndless possibility.", tag:"FRUIT PREPARATIONS", image:images.berries, detail:"Fruit-forward ideas for dairy, desserts and the things you love to create.", to:"fruit-preparations", hue:"#c23b6e"},
 {title:"Create something\nextraordinary.", tag:"YOUR NEXT INGREDIENT", image:images.citrus, detail:"A world of ingredients. A team that connects them to your ambition.", to:"", hue:"#d3ed78"},
]

export function InwardHero() {
 const ref=useRef<HTMLElement>(null)
 const trigger=useRef<ScrollTrigger | null>(null)
 const [active,setActive]=useState(0)
 const activeRef=useRef(0)
 const reduce=useReducedMotion()
 useLayoutEffect(()=>{
  if(reduce||!ref.current)return
  const root=ref.current
  const cards=gsap.utils.toArray<HTMLElement>(".film-card",root)
  const copies=gsap.utils.toArray<HTMLElement>(".film-copy",root)
  const photos=cards.map(card=>card.querySelector("img")!)
  const line=root.querySelector<HTMLElement>(".film-progress i")
  const stage=root.querySelector<HTMLElement>(".film-stage")!
  stage.style.setProperty("--chapter-hue",chapters[0].hue)
  const state={frame:0}
  let pointerX=0,pointerY=0,smoothX=0,smoothY=0,velocity=0,lastFrame=0
  const onMove=(e:PointerEvent)=>{pointerX=e.clientX/innerWidth-.5;pointerY=e.clientY/innerHeight-.5}
  window.addEventListener("pointermove",onMove,{passive:true})
  const draw=()=>{
   const mobile=innerWidth<700
   const step=mobile?innerWidth*.91:innerWidth*.5
   velocity+=((state.frame-lastFrame)*60-velocity)*.2;lastFrame=state.frame
   cards.forEach((card,i)=>{
    const d=i-state.frame,ad=Math.abs(d)
    const opacity=d<0?Math.max(0,1+d*1.4):d>1.9?0:1
    if(opacity===0){card.style.visibility='hidden';card.style.willChange='auto';return}
    card.style.visibility='visible';card.style.opacity=String(opacity*(1-Math.min(ad*.12,.2)));card.style.willChange='transform'
    card.style.filter='none'
    card.style.transform=`translate3d(${d*step+smoothX*-18*(1-Math.min(ad,1))}px,${smoothY*-10*(1-Math.min(ad,1))}px,${-ad*(mobile?80:170)}px) rotateY(${d*(mobile?-5:-13)+smoothX*4}deg) rotateX(${smoothY*-3}deg) rotateZ(${d*1.4}deg) skewX(${(-velocity*.35).toFixed(2)}deg) scale(${1-Math.min(ad*.08,.28)})`
    photos[i].style.transform=`translate3d(${d*-4+smoothX*-2.5}%,${smoothY*-2}%,0) scale(${1.12+(1-Math.min(ad,1))*.04})`
   })
   const index=Math.min(chapters.length-1,Math.round(state.frame))
   if(activeRef.current!==index){activeRef.current=index;setActive(index);stage.style.setProperty('--chapter-hue',chapters[index].hue)}
   copies.forEach((copy,i)=>{const distance=Math.abs(i-state.frame);copy.style.opacity=String(Math.max(0,1-distance*2));copy.style.visibility=distance>=.5?'hidden':'visible';copy.style.transform=`translateY(${(i-state.frame)*34}px)`;copy.style.filter="none"})
   if(line)line.style.transform=`scaleX(${state.frame/(chapters.length-1)})`
   stage.style.setProperty('--frame',String(state.frame))
   window.dispatchEvent(new CustomEvent('lyca:portal',{detail:state.frame/(chapters.length-1)}))
  }
  let raf=0,heroVisible=true
  const observer=new IntersectionObserver(([entry])=>{heroVisible=entry.isIntersecting},{threshold:0})
  observer.observe(root)
  const idle=()=>{
   raf=0
   if(document.hidden||!heroVisible)return
   const nx=smoothX+(pointerX-smoothX)*.12,ny=smoothY+(pointerY-smoothY)*.12
   smoothX=nx;smoothY=ny;draw()
   if(Math.abs(pointerX-smoothX)>.003||Math.abs(pointerY-smoothY)>.003)raf=requestAnimationFrame(idle)
  }
  const queuePointer=()=>{if(!raf&&heroVisible)raf=requestAnimationFrame(idle)}
  window.addEventListener('pointermove',queuePointer,{passive:true})
  const ctx=gsap.context(()=>{
   gsap.to(state,{frame:chapters.length-1,ease:'none',onUpdate:draw,scrollTrigger:{trigger:root,start:'top top',end:'bottom bottom',scrub:.9,invalidateOnRefresh:true,onRefresh:draw}})
  },root)
  trigger.current=ScrollTrigger.getAll().find(t=>t.trigger===root)||null
  draw()
  const refresh=()=>ScrollTrigger.refresh()
  const timer=setTimeout(refresh,850)
  window.addEventListener('resize',refresh)
  return()=>{clearTimeout(timer);cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener("pointermove",queuePointer);window.removeEventListener("pointermove",onMove);stage.removeAttribute("style");window.removeEventListener('resize',refresh);ctx.revert();cards.forEach(card=>card.removeAttribute("style"));photos.forEach(photo=>photo.removeAttribute("style"));copies.forEach(copy=>copy.removeAttribute("style"));line?.removeAttribute("style");trigger.current=null;window.dispatchEvent(new Event('lyca:portal-leave'))}
 },[reduce])
 const go=(index:number)=>{
  const st=trigger.current;if(st)glideTo(st.start+(st.end-st.start)*index/(chapters.length-1))
 }
 return <section ref={ref} className={`film-story ${reduce?'film-reduced':''}`} aria-label="Ingredient photo journey">
  <div className="film-stage">
   <div className="film-light-leak" aria-hidden="true"><i/><i/></div>
   <div className="film-kicker wrap"><span><i className="rec-dot"/>LYCA / FOOD INGREDIENTS SUPPLIES</span><span>ROOTED IN NATURE. MADE FOR POSSIBILITY.</span></div>
   <div className="film-heading wrap"><h1><span className="line"><span>Good things</span></span><span className="line"><span>start <em>within.</em></span></span></h1><p>Exceptional ingredients.<br/>Extraordinary possibilities.</p></div>
   <div className="film-gallery" aria-label="Ingredient collections">{chapters.map((c,i)=><article className="film-card" key={c.tag} aria-hidden={!reduce&&active!==i} inert={!reduce&&active!==i}>
    <img src={c.image} alt={c.tag.toLowerCase()+" ingredient photography"} decoding="async" loading={i<2?"eager":"lazy"} fetchPriority={i===0?'high':'low'} />
    <span className="film-card__flare" aria-hidden="true"/>
    <div className="film-glass"><span>0{i+1} / {c.tag}</span><h2>{c.title}</h2><Link to={c.to?`/products#${c.to}`:'/products'} aria-label={`Explore ${c.tag.toLowerCase()}`}><ArrowUpRight size={23}/></Link></div>
   </article>)}</div>
   <div className="film-details wrap">{chapters.map((c,i)=><div className="film-copy" key={c.tag} aria-hidden={!reduce&&active!==i}><p className="eyebrow">{c.tag}</p><p>{c.detail}</p></div>)}<Link className="button button--primary" to="/products">Explore ingredients <ArrowUpRight size={17}/></Link></div>
   {!reduce&&<div className="film-controls wrap"><button className="film-scroll" onClick={()=>active<4?go(active+1):document.getElementById('discover')?.scrollIntoView({behavior:'smooth'})}>SCROLL TO DISCOVER <ArrowDown size={15}/></button><div className="film-pagination"><button disabled={active===0} onClick={()=>go(active-1)} aria-label="Previous ingredient"><ArrowLeft size={18}/></button><span>0{active+1} <small>/ 05</small></span><button disabled={active===4} onClick={()=>go(active+1)} aria-label="Next ingredient"><ArrowRight size={18}/></button></div><div className="film-progress"><i/></div></div>}
  </div>
 </section>
}
