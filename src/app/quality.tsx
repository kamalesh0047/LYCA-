import {useEffect} from "react"
export function RuntimeQuality(){
 useEffect(()=>{
  const root=document.documentElement
  const setEconomy=()=>{if(!root.classList.contains('fx-economy')){root.classList.add('fx-economy');window.dispatchEvent(new Event('lyca:quality'))}}
  const device=navigator as Navigator & {deviceMemory?:number}
  if((device.hardwareConcurrency>0&&device.hardwareConcurrency<=4)||(device.deviceMemory!==undefined&&device.deviceMemory<=4)){setEconomy();return}
  let raf=0,last=0,total=0,frames=0,start=0
  const measure=(now:number)=>{
   if(document.hidden){last=0;start=0;total=0;frames=0;raf=requestAnimationFrame(measure);return}
   if(!start)start=now
   if(last){total+=now-last;frames++}last=now
   if(now-start>=2500){if(frames===0||total/frames>28)setEconomy();return}
   raf=requestAnimationFrame(measure)
  }
  const timer=setTimeout(()=>{raf=requestAnimationFrame(measure)},4500)
  return()=>{clearTimeout(timer);cancelAnimationFrame(raf)}
 },[])
 return null
}
