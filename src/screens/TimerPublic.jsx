import React,{useEffect,useMemo,useState} from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Backdrop from '../components/Backdrop'
import NeonHeader from '../components/NeonHeader'
import { fetchTimerFromCloud, fetchLinkFromCloud, deleteLinkFromCloud, hasFirebaseConfig } from '../lib/firebase'
import { backgroundForTitle } from '../lib/theme'
import TimerCard from '../components/TimerCard'

function decodeB64Url(input){try{const b64=input.replaceAll('-','+').replaceAll('_','/');const pad=b64.length%4;const b64p=b64+(pad?'='.repeat(4-pad):'');const json=atob(b64p);return JSON.parse(decodeURIComponent(escape(json)))}catch{return null}}

export default function TimerPublic(){
  const { id, sid } = useParams()
  const [sp]=useSearchParams();const d=sp.get('d');const [timer,setTimer]=useState(d?decodeB64Url(d):null)

  useEffect(()=>{(async()=>{
    if(d) return
    if(sid && hasFirebaseConfig()){
      const t=await fetchLinkFromCloud(sid)
      if(t){
        setTimer(t)
        if(t.oneTime) try{ await deleteLinkFromCloud(sid) }catch{}
        return
      }
    }
    if(id && hasFirebaseConfig()){
      const t=await fetchTimerFromCloud(id); if(t){setTimer(t); return}
    }
  })()},[id,d,sid])

  const bg=useMemo(()=>timer?.bg||backgroundForTitle(timer?.title||''),[timer])
  return(<div><Backdrop/><NeonHeader/>{!timer&&<div className='px-4 pt-8 opacity-70'>Таймер не найден.</div>}{timer&&(<div className='px-4 pt-6'><div className='glass p-6 rounded-2xl' style={{backgroundImage:bg}}><div className='text-xs opacity-70'>{timer.kind==='abs'?new Date(timer.endsAt).toLocaleString():'длительный таймер'}</div><div className='text-2xl font-bold mb-4'>{timer.title}</div><TimerCard t={timer}/></div></div>)}</div>)
}
