import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import Backdrop from '../components/Backdrop'
import NeonHeader from '../components/NeonHeader'
import { fetchTimerFromCloud, hasFirebaseConfig } from '../lib/firebase'
import { backgroundForTitle } from '../lib/theme'

function useHashPayload(){
  const loc = useLocation()
  if (loc.pathname.includes('/t/local') && loc.hash.length > 1){
    try {
      const json = decodeURIComponent(escape(atob(loc.hash.slice(1))))
      return JSON.parse(json)
    } catch { return null }
  }
  return null
}

function Countdown({endsAt}){
  const [, force] = useState(0)
  useEffect(()=>{
    const id = setInterval(()=> force(x=>x+1), 1000)
    return ()=> clearInterval(id)
  },[])
  const now = new Date()
  const end = new Date(endsAt)
  const total = Math.max(0, end - now)
  const days = Math.floor(total / 86400000)
  const hours = Math.floor((total % 86400000)/3600000)
  const mins = Math.floor((total % 3600000)/60000)
  const secs = Math.floor((total % 60000)/1000)
  return <div className="text-5xl font-mono">
    {days}д {String(hours).padStart(2,'0')}:{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
  </div>
}

export default function TimerPublic(){
  const { id } = useParams()
  const localPayload = useHashPayload()
  const [timer, setTimer] = useState(localPayload)

  useEffect(()=>{
    async function run(){
      if (localPayload) return
      if (!hasFirebaseConfig()) return
      const t = await fetchTimerFromCloud(id)
      if (t) setTimer(t)
    }
    run()
  }, [id])

  const bg = useMemo(()=> timer?.bg || backgroundForTitle(timer?.title || ''), [timer])

  return (
    <div>
      <Backdrop/>
      <NeonHeader/>
      {!timer && <div className="px-4 pt-8 opacity-70">Таймер не найден. Возможно, автор ещё не настроил облачный шаринг.</div>}
      {timer && (
        <div className="px-4 pt-6">
          <div className="glass p-6 rounded-2xl" style={{backgroundImage: bg}}>
            <div className="text-xs opacity-70">{new Date(timer.endsAt).toLocaleString()}</div>
            <div className="text-2xl font-bold mb-4">{timer.title}</div>
            <Countdown endsAt={timer.endsAt}/>
          </div>
        </div>
      )}
    </div>
  )
}
