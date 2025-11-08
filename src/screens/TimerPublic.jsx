import React,{useEffect,useMemo,useState} from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Backdrop from '../components/Backdrop'
import NeonHeader from '../components/NeonHeader'
import { fetchTimerFromCloud, fetchLinkFromCloud, hasFirebaseConfig } from '../lib/firebase'
import { backgroundForTitle } from '../lib/theme'
import TimerCard from '../components/TimerCard'
import { WeatherProvider } from '../weather/WeatherContext'
import ForecastDrawer from '../components/ForecastDrawer'

function decodeB64Url(input){try{const b64=input.replaceAll('-','+').replaceAll('_','/');const pad=b64.length%4;const b64p=b64+(pad?'='.repeat(4-pad):'');const json=atob(b64p);return JSON.parse(decodeURIComponent(escape(json)))}catch{return null}}

export default function TimerPublicWrap(){
  return(<WeatherProvider><TimerPublic/></WeatherProvider>)
}

function TimerPublic(){
  const { id, sid } = useParams()
  const [sp]=useSearchParams();const d=sp.get('d');const [timer,setTimer]=useState(d?decodeB64Url(d):null)
  const [open,setOpen]=useState(false)

  useEffect(()=>{(async()=>{
    if(d) return
    if(sid && hasFirebaseConfig()){
      const L=await fetchLinkFromCloud(sid)
      if(L){
        if(L.type==='ptr' && L.timerId){
          const t=await fetchTimerFromCloud(L.timerId)
          if(t){ setTimer(t); return }
          setTimer(null); return
        } else {
          setTimer(L); return
        }
      }
    }
    if(id && hasFirebaseConfig()){
      const t=await fetchTimerFromCloud(id); if(t){setTimer(t); return}
    }
  })()},[id,d,sid])

  const bg=useMemo(()=>timer?.bg||backgroundForTitle(timer?.title||''),[timer])
  return(<div><Backdrop/><NeonHeader right={<button onClick={()=>setOpen(true)} className='text-xs bg-white/10 px-2 py-1 rounded'>Погода</button>}/>{!timer&&<div className='px-4 pt-8 opacity-70'>Таймер не найден.</div>}{timer&&(<div className='px-4 pt-6'><div className='glass p-6 rounded-2xl' style={{backgroundImage:bg}}><div className='text-xs opacity-70'>{timer.kind==='abs'?new Date(timer.endsAt).toLocaleString():'длительный таймер'}</div><div className='text-2xl font-bold mb-4'>{timer.title}</div><TimerCard t={timer}/></div></div>)}<ForecastDrawer open={open} onClose={()=>setOpen(false)}/></div>)
}
