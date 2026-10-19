import { useEffect, useLayoutEffect, useRef, useState, useId } from "react"
import { Link } from "react-router"
import { ArrowDown, ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react"
import logo from "../assets/lyca-logo.png"
import { images } from "./data"
import {onFrame} from "./frameLoop"
import {noisePixels} from "./noiseTexture"
import {FocusPhoto} from "./focusPhoto"
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
    <defs><filter id={id} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .831  0 0 0 0 1  0 0 0 0 .302  -.72 -.72 -.72 0 2.16" /><feComposite in2="SourceAlpha" operator="in" /></filter></defs>
    <image href={logo} width="160" height="160" filter={`url(#${id})`} />
  </svg>
}

const vertex=`attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`
const fragment=`precision mediump float;
varying vec2 uv;uniform vec2 resolution;uniform float time,scroll,intensity;uniform vec2 pointer;uniform sampler2D noiseMap;
void main(){
 vec2 p=uv,asp=vec2(resolution.x/resolution.y,1.);float t=time*.05;
 float fog=texture2D(noiseMap,(p-pointer*.035)*asp*.65+vec2(t*.06,-t*.025)+scroll*.09).r;
 float fog2=texture2D(noiseMap,(p-pointer*.02)*asp*.95-vec2(t*.03,t*.045)+scroll*.04).r;
 vec2 light=vec2(.8+pointer.x*.06,1.1+pointer.y*.03),d=(p-light)*asp;float angle=atan(d.y,d.x);
 float bend=texture2D(noiseMap,vec2(angle*.17,t*.08)).r;
 float rays=pow(.5+.5*sin(angle*26.+t*2.5+bend*4.),3.)*(1.-smoothstep(.05,1.5,length(d)));
 float silk=exp(-pow((p.y-.42-sin(p.x*4.+t*2.+scroll*1.4)*.11)*4.,2.));
 vec3 violet=vec3(.353,.278,.882),lime=vec3(.831,1.,.302),col=vec3(.29,.22,.76);
 col+=violet*(fog*.36+fog2*.16)*(.55+intensity*.7)+mix(violet,lime,.22)*rays*(.10+intensity*.26)+vec3(.035,.025,.09)*silk;
 col+=lime*.06*(1.-smoothstep(0.,.9,length((p-vec2(.15,.2))*asp)))*fog2;
 col*=.86+.14*(1.-smoothstep(.3,1.25,length((p-.5)*asp*1.1)));
 col+=violet*.075*sin(p.x*2.+t)*fog2;
 col+=(texture2D(noiseMap,p*resolution/128.+vec2(fract(time*.12))).g-.5)*.035;
 gl_FragColor=vec4(col,1.);
}`
export function WebGLWorld(){
 const ref=useRef<HTMLCanvasElement>(null)
 const [generation,setGeneration]=useState(0)
 const reduce=useReducedMotion()
 useEffect(()=>{
  const canvas=ref.current;if(!canvas||reduce)return
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'high-performance'});if(!gl){canvas.dataset.webgl='unavailable';return}
  const shader=(kind:number,source:string)=>{const item=gl.createShader(kind)!;gl.shaderSource(item,source);gl.compileShader(item);if(!gl.getShaderParameter(item,gl.COMPILE_STATUS)){gl.deleteShader(item);return null}return item}
  const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);if(!vs||!fs)return
  const program=gl.createProgram()!;gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return
  gl.useProgram(program)
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW)
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0)
  // Dust is one batched point draw in this same canvas, not a second full-screen layer.
  const dustVertex=shader(gl.VERTEX_SHADER,`attribute vec2 pointPosition;attribute vec2 pointStyle;varying float alpha;void main(){gl_Position=vec4(pointPosition,0.,1.);gl_PointSize=pointStyle.x;alpha=pointStyle.y;}`)!
  const dustFragment=shader(gl.FRAGMENT_SHADER,`precision mediump float;varying float alpha;void main(){float d=length(gl_PointCoord-.5);float a=(1.-smoothstep(0.,.5,d))*alpha;gl_FragColor=vec4(.996,.996,.988,a);}`)!
  const dustProgram=gl.createProgram()!;gl.attachShader(dustProgram,dustVertex);gl.attachShader(dustProgram,dustFragment);gl.linkProgram(dustProgram)
  const pointPosition=gl.getAttribLocation(dustProgram,'pointPosition'),pointStyle=gl.getAttribLocation(dustProgram,'pointStyle')
  const pointBuffer=gl.createBuffer();const points=new Float32Array(90*4)
  const particles=Array.from({length:90},()=>({x:Math.random()*2-1,y:Math.random()*2-1,size:4+Math.random()*15,a:.15+Math.random()*.5,phase:Math.random()*Math.PI*2,vx:(Math.random()-.5)*.0002,vy:.0001+Math.random()*.0005}))
  gl.bindBuffer(gl.ARRAY_BUFFER,pointBuffer);gl.bufferData(gl.ARRAY_BUFFER,points.byteLength,gl.DYNAMIC_DRAW)
  let dustTime=0,lastParticleCount=0
  const drawDust=(now:number)=>{
   const dt=Math.min(4,(now-dustTime)/16.667||1);dustTime=now
   const count=innerWidth<700?45:90,scale=canvas.width/innerWidth
   for(let i=0;i<count;i++){const p=particles[i];p.x+=(p.vx-x*.0003)*dt;p.y+=(p.vy+y*.0003)*dt;if(p.y>1.1)p.y=-1.1;if(p.y< -1.1)p.y=1.1;if(p.x>1.1)p.x=-1.1;if(p.x< -1.1)p.x=1.1;points[i*4]=p.x;points[i*4+1]=p.y;points[i*4+2]=Math.max(1.5,p.size*scale);points[i*4+3]=p.a*(.6+.4*Math.sin(now*.0015+p.phase))*.65}
   gl.useProgram(dustProgram);gl.bindBuffer(gl.ARRAY_BUFFER,pointBuffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,points)
   gl.enableVertexAttribArray(pointPosition);gl.vertexAttribPointer(pointPosition,2,gl.FLOAT,false,16,0);gl.enableVertexAttribArray(pointStyle);gl.vertexAttribPointer(pointStyle,2,gl.FLOAT,false,16,8)
   gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.drawArrays(gl.POINTS,0,count);gl.disable(gl.BLEND);gl.disableVertexAttribArray(pointStyle)
   if(count!==lastParticleCount){canvas.dataset.particles=String(count);lastParticleCount=count}
  }
  const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,128,128,0,gl.RGBA,gl.UNSIGNED_BYTE,noisePixels());gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);gl.uniform1i(gl.getUniformLocation(program,'noiseMap'),0)
  const u=(name:string)=>gl.getUniformLocation(program,name)
  const locations={resolution:u('resolution'),time:u('time'),scroll:u('scroll'),intensity:u('intensity'),pointer:u('pointer')}
  let current=0,target=0,px=0,py=0,x=0,y=0,lost=false,light=.22
  const resize=()=>{const budget=document.documentElement.dataset.fxDetail==='balanced'?384:512;const scale=Math.min(.7,budget/Math.max(innerWidth,innerHeight));canvas.width=Math.round(innerWidth*scale);canvas.height=Math.round(innerHeight*scale);gl.viewport(0,0,canvas.width,canvas.height)}
  const move=(e:PointerEvent)=>{x=e.clientX/innerWidth-.5;y=.5-e.clientY/innerHeight}
  const portal=(e:Event)=>{target=(e as CustomEvent<number>).detail}
  const leave=()=>{target=0}
  const onLost=(e:Event)=>{e.preventDefault();lost=true;canvas.style.opacity='0'}
  const restored=()=>setGeneration(value=>value+1)
  canvas.addEventListener('webglcontextlost',onLost);canvas.addEventListener('webglcontextrestored',restored)
  window.addEventListener('resize',resize);window.addEventListener('lyca:quality',resize);window.addEventListener('pointermove',move,{passive:true});window.addEventListener('lyca:portal',portal);window.addEventListener('lyca:portal-leave',leave);resize()
  canvas.dataset.webgl='active';canvas.dataset.motion='animated';canvas.style.opacity='1'
  const stop=onFrame(now=>{if(lost)return;current+=(target-current)*.18;light+=((target>0?1:.22)-light)*.08;px+=(x-px)*.08;py+=(y-py)*.08;gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);gl.uniform2f(locations.resolution,canvas.width,canvas.height);gl.uniform1f(locations.time,now*.001);gl.uniform1f(locations.scroll,current);gl.uniform1f(locations.intensity,light);gl.uniform2f(locations.pointer,px,py);gl.drawArrays(gl.TRIANGLES,0,6);drawDust(now)},30)
  return()=>{stop();window.removeEventListener('resize',resize);window.removeEventListener('lyca:quality',resize);window.removeEventListener('pointermove',move);window.removeEventListener('lyca:portal',portal);window.removeEventListener('lyca:portal-leave',leave);canvas.removeEventListener('webglcontextlost',onLost);canvas.removeEventListener('webglcontextrestored',restored);gl.deleteTexture(texture);gl.deleteBuffer(pointBuffer);gl.deleteProgram(dustProgram);gl.deleteShader(dustVertex);gl.deleteShader(dustFragment);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs)}
 },[reduce,generation])
 return <canvas ref={ref} className="webgl-world" aria-hidden="true"/>
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
 return <><div className="transition-lens" aria-hidden="true"/><div className="film-bars" aria-hidden="true"><i/><i/></div>{stage!=='done'&&!reduce&&<div className={`title-card ${stage==='open'?'is-opening':''}`} aria-hidden="true"><div className="title-card__mark"><LogoMark/></div><div className="title-card__name"><span>L</span><span>Y</span><span>C</span><span>A</span><b>.</b></div><p>FOOD INGREDIENTS SUPPLIES · A WORLD OF INGREDIENTS</p><i className="title-card__line"/></div>}</>
}

const chapters = [
 {title:"Nature, in its\npurest form.", tag:"FRUIT & JUICE", image:images.mango, detail:"Concentrates, purees and pulps. A brighter beginning for your next creation.", to:"juice-concentrates", hue:"#d4ff4d"},
 {title:"A deeper\nkind of flavour.", tag:"COFFEE", image:images.coffee, detail:"Distinctive character. Rich aroma. Discover coffee ingredients for your formulation.", to:"coffee-cocoa", hue:"#9a8df0"},
 {title:"Beautifully\nversatile.", tag:"DAIRY", image:images.dairy, detail:"Texture, richness and possibility for beverages, bakery and beyond.", to:"dairy-ingredients", hue:"#fefefc"},
 {title:"A little colour.\nEndless possibility.", tag:"FRUIT PREPARATIONS", image:images.berries, detail:"Fruit-forward ideas for dairy, desserts and the things you love to create.", to:"fruit-preparations", hue:"#5a47e1"},
 {title:"Create something\nextraordinary.", tag:"YOUR NEXT INGREDIENT", image:images.citrus, detail:"A world of ingredients. A team that connects them to your ambition.", to:"", hue:"#d4ff4d"},
]

export function InwardHero() {
 const ref=useRef<HTMLElement>(null)
 const trigger=useRef<ScrollTrigger | null>(null)
 const [active,setActive]=useState(0)
 const activeRef=useRef(0)
 const reduce=useReducedMotion()
 useEffect(()=>{
  // Decode upcoming photos during idle time, before a scroll makes them visible.
  const root=ref.current;if(!root)return
  let cancelled=false,idle=0
  let timer:ReturnType<typeof setTimeout>|undefined
  const images=Array.from(root.querySelectorAll<HTMLImageElement>('.film-photo img'))
  const warm=()=>{
   const image=images.shift();if(cancelled||!image)return
   image.loading='eager'
   void image.decode().catch(()=>{}).finally(()=>{if(!cancelled)schedule()})
  }
  const schedule=()=>{
   if('requestIdleCallback' in window)idle=window.requestIdleCallback(warm,{timeout:1500})
   else timer=globalThis.setTimeout(warm,100)
  }
  schedule()
  return()=>{cancelled=true;if(idle)window.cancelIdleCallback(idle);clearTimeout(timer)}
 },[])
 useLayoutEffect(()=>{
  if(reduce||!ref.current)return
  const root=ref.current
  const cards=gsap.utils.toArray<HTMLElement>(".film-card",root)
  const copies=gsap.utils.toArray<HTMLElement>(".film-copy",root)
  const photos=cards.map(card=>card.querySelector<HTMLElement>(".film-photo")!)
  const flares=cards.map(card=>card.querySelector<HTMLElement>(".film-card__flare")!)
  const shades=cards.map(card=>card.querySelector<HTMLElement>('.film-card__shade')!)
  const softPhotos=cards.map(card=>card.querySelector<HTMLElement>(".film-photo__soft")!)
  const line=root.querySelector<HTMLElement>(".film-progress i")
  const stage=root.querySelector<HTMLElement>(".film-stage")!
  stage.style.setProperty("--chapter-hue",chapters[0].hue)
  const state={frame:0}
  // Commit one carousel update per display frame, even when scroll and pointer arrive together.
  let dirty=true,lastPortal=-1,viewportWidth=innerWidth
  const write=(el:HTMLElement,key:'transform'|'opacity'|'visibility'|'willChange',value:string)=>{if(el.style[key]!==value)el.style[key]=value}
  let pointerX=0,pointerY=0,smoothX=0,smoothY=0,velocity=0,lastFrame=0
  const onMove=(e:PointerEvent)=>{pointerX=e.clientX/innerWidth-.5;pointerY=e.clientY/innerHeight-.5}
  window.addEventListener("pointermove",onMove,{passive:true})
  const draw=()=>{
   const mobile=viewportWidth<700
   const step=mobile?viewportWidth*.91:viewportWidth*.5
   velocity+=((state.frame-lastFrame)*60-velocity)*.2;lastFrame=state.frame
   cards.forEach((card,i)=>{
    const d=i-state.frame,ad=Math.abs(d)
    const opacity=d<0?Math.max(0,1+d*1.4):d>1.9?0:1
    if(opacity===0){write(card,'visibility','hidden');write(card,'willChange','auto');return}
    write(card,'visibility','visible');write(card,'opacity',String(opacity));write(card,'willChange','transform')
    write(softPhotos[i],'opacity',String(Math.min(ad,1)));write(shades[i],'opacity',String(Math.min(ad,1)*.18))
    card.style.transform=`translate3d(${d*step+smoothX*-18*(1-Math.min(ad,1))}px,${smoothY*-10*(1-Math.min(ad,1))}px,${-ad*(mobile?80:170)}px) rotateY(${d*(mobile?-5:-13)+smoothX*4}deg) rotateX(${smoothY*-3}deg) rotateZ(${d*1.4}deg) skewX(${(-velocity*.35).toFixed(2)}deg) scale(${1-Math.min(ad*.08,.28)})`
    photos[i].style.transform=`translate3d(${d*-4+smoothX*-2.5}%,${smoothY*-2}%,0) scale(${1.12+(1-Math.min(ad,1))*.04})`
   })
   const index=Math.min(chapters.length-1,Math.round(state.frame))
   if(activeRef.current!==index){activeRef.current=index;setActive(index);stage.style.setProperty('--chapter-hue',chapters[index].hue)}
   copies.forEach((copy,i)=>{const distance=Math.abs(i-state.frame);write(copy,'visibility',distance>=.5?'hidden':'visible');if(distance<.5){write(copy,'opacity',String(Math.max(0,1-distance*2)));write(copy,'transform',`translateY(${(i-state.frame)*34}px)`)}})
   if(line)line.style.transform=`scaleX(${state.frame/(chapters.length-1)})`
   flares.forEach((flare,i)=>{if(cards[i].style.visibility!=='hidden')write(flare,'transform',`translateX(${state.frame*8}%)`)})
   if(lastPortal!==state.frame){lastPortal=state.frame;window.dispatchEvent(new CustomEvent('lyca:portal',{detail:state.frame/(chapters.length-1)}))}
  }
  let heroVisible=true
  const observer=new IntersectionObserver(([entry])=>{heroVisible=entry.isIntersecting;if(heroVisible)dirty=true},{threshold:0})
  observer.observe(root)
  const stopPointer=onFrame(()=>{
   if(!heroVisible)return
   const moving=Math.abs(pointerX-smoothX)>.003||Math.abs(pointerY-smoothY)>.003
   if(!dirty&&!moving)return
   smoothX+=(pointerX-smoothX)*.12;smoothY+=(pointerY-smoothY)*.12
   dirty=false;draw()
  })
  const ctx=gsap.context(()=>{
   gsap.to(state,{frame:chapters.length-1,ease:'none',onUpdate:()=>{dirty=true},scrollTrigger:{trigger:root,start:'top top',end:'bottom bottom',scrub:.9,invalidateOnRefresh:true,onRefresh:()=>{viewportWidth=innerWidth;dirty=true}}})
  },root)
  trigger.current=ScrollTrigger.getAll().find(t=>t.trigger===root)||null
  draw()
  let refreshRaf=0
  const refresh=()=>{cancelAnimationFrame(refreshRaf);refreshRaf=requestAnimationFrame(()=>{viewportWidth=innerWidth;ScrollTrigger.refresh();dirty=true})}
  const timer=setTimeout(refresh,850)
  window.addEventListener('resize',refresh)
  return()=>{clearTimeout(timer);cancelAnimationFrame(refreshRaf);stopPointer();observer.disconnect();window.removeEventListener("pointermove",onMove);stage.removeAttribute("style");window.removeEventListener('resize',refresh);ctx.revert();cards.forEach(card=>card.removeAttribute("style"));photos.forEach(photo=>photo.removeAttribute("style"));[...softPhotos,...shades,...flares].forEach(el=>el.removeAttribute("style"));copies.forEach(copy=>copy.removeAttribute("style"));line?.removeAttribute("style");trigger.current=null;window.dispatchEvent(new Event('lyca:portal-leave'))}
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
    <FocusPhoto src={c.image} alt={c.tag.toLowerCase()+" ingredient photography"} first={i===0}/>
    <span className="film-card__shade" aria-hidden="true"/>
    <span className="film-card__flare" aria-hidden="true"/>
    <div className="film-glass"><span>0{i+1} / {c.tag}</span><h2>{c.title}</h2><Link to={c.to?`/products#${c.to}`:'/products'} aria-label={`Explore ${c.tag.toLowerCase()}`}><ArrowUpRight size={23}/></Link></div>
   </article>)}</div>
   <div className="film-details wrap">{chapters.map((c,i)=><div className="film-copy" key={c.tag} aria-hidden={!reduce&&active!==i}><p className="eyebrow">{c.tag}</p><p>{c.detail}</p></div>)}<Link className="button button--primary" to="/products">Explore ingredients <ArrowUpRight size={17}/></Link></div>
   {!reduce&&<div className="film-controls wrap"><button className="film-scroll" onClick={()=>active<4?go(active+1):document.getElementById('discover')?.scrollIntoView({behavior:'smooth'})}>SCROLL TO DISCOVER <ArrowDown size={15}/></button><div className="film-pagination"><button disabled={active===0} onClick={()=>go(active-1)} aria-label="Previous ingredient"><ArrowLeft size={18}/></button><span>0{active+1} <small>/ 05</small></span><button disabled={active===4} onClick={()=>go(active+1)} aria-label="Next ingredient"><ArrowRight size={18}/></button></div><div className="film-progress"><i/></div></div>}
  </div>
 </section>
}
