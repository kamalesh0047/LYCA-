import {useEffect} from "react"
import {onFrame} from "./frameLoop"
/** Reduce buffer detail only; all effects stay animated. */
export function RuntimeQuality(){
 useEffect(()=>{
  const root=document.documentElement;root.classList.remove('fx-economy')
  const device=navigator as Navigator & {deviceMemory?:number}
  const balance=()=>{root.dataset.fxDetail='balanced';window.dispatchEvent(new Event('lyca:quality'))}
  root.dataset.fxDetail='full'
  if((device.hardwareConcurrency>0&&device.hardwareConcurrency<=4)||(device.deviceMemory!==undefined&&device.deviceMemory<=4))balance()
  let stop=()=>{}
  const timer=setTimeout(()=>{let last=0,start=0,sum=0,frames=0;stop=onFrame(now=>{if(!start)start=now;if(last){sum+=now-last;frames++}last=now;if(now-start>2500){if(frames&&sum/frames>28)balance();stop()}},60)},4500)
  return()=>{clearTimeout(timer);stop()}
 },[])
 return null
}
