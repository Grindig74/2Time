import React,{useEffect,useMemo,useState,useContext} from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Backdrop from '../components/Backdrop'
import NeonHeader from '../components/NeonHeader'
import { fetchTimerFromCloud, fetchLinkFromCloud, hasFirebaseConfig } from '../lib/firebase'
import { backgroundForTitle } from '../lib/theme'
import TimerCard from '../components/TimerCard'
import { WeatherProvider, WeatherCtx } from '../weather/WeatherContext'
import ForecastDrawer from '../components/ForecastDrawer'
import WeatherIcon from '../components/WeatherIcon'
import { codeToIcon } from '../lib/weather'

function decodeB64Url(input){try{const b64=input.replaceAll('-','+').replaceAll('_','/');const pad=b64.length%4;const b64p=b64+(pad?'='.repeat(4-pad):'');const json=atob(b64p);return JSON.parse(decodeURIComponent(escape(json)))}catch{return null}}

export default function TimerPublicWrap(){
  return(<WeatherProvider><TimerPublic/></WeatherProvider>)
}

function TimerPublic(){
  const { id, sid } = useParams()
  const [sp]=useSearchParams();const d=sp.get('d');const [timer,setTimer]=useState(d?decodeB64Url(d):null)
  const [open,setOpen]=useState(false)
  const { data } = useContext(WeatherCtx)

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
  })()},[id,d,sid])

  const bg=useMemo(()=>timer?.bg||backgroundForTitle(timer?.title||''),[timer])
  // pick forecast for end date if within range
  let endForecast=null
  if(data?.daily?.time && timer?.kind==='abs'){
    const fireDate = new Date(timer.endsAt).toISOString().slice(0,10)
    const idx = data.daily.time.indexOf(fireDate)
    if(idx>=0){ endForecast = { tmin: Math.round(data.daily.temperature_2m_min[idx]), tmax: Math.round(data.daily.temperature_2m_max[idx]), precip: Math.round(data.daily.precipitation_sum[idx]||0), code: data.daily.weather_code[idx] } }
  }

  return(<div><Backdrop/><NeonHeader right={<button onClick={()=>setOpen(true)} className='text-xs bg-white/10 px-2 py-1 rounded'>Погода</button>}/>{!timer&&<div className='px-4 pt-8 opacity-70'>Таймер не найден.</div>}{timer&&(<div className='px-4 pt-6'><div className='glass p-6 rounded-2xl' style={{backgroundImage:bg}}><div className='text-xs opacity-70'>{timer.kind==='abs'?new Date(timer.endsAt).toLocaleString():'длительный таймер'}</div><div className='text-2xl font-bold mb-2'>{timer.title}</div>{endForecast&&(<div className='text-xs opacity-80 mb-2'><WeatherIcon code={codeToIcon(endForecast.code)}/> В день окончания: {endForecast.tmin}…{endForecast.tmax}° · осадки {endForecast.precip} мм</div>)}<TimerCard t={timer}/></div></div>)}<ForecastDrawer open={open} onClose={()=>setOpen(false)}/></div>)
}
