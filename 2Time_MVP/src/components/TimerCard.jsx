import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { backgroundForTitle } from '../lib/theme'

function timeLeft(target){
  const now = new Date()
  const end = new Date(target)
  let diff = Math.max(0, end - now)
  const days = Math.floor(diff / (1000*60*60*24)); diff -= days*86400000
  const hours = Math.floor(diff / (1000*60*60)); diff -= hours*3600000
  const mins = Math.floor(diff / (1000*60)); diff -= mins*60000
  const secs = Math.floor(diff / 1000)
  return { days, hours, mins, secs }
}

export default function TimerCard({t}){
  const bg = useMemo(()=> t.bg || backgroundForTitle(t.title), [t])
  const tl = timeLeft(t.endsAt)
  const idLink = t.id ? `/t/${t.id}` : '#'
  return (
    <motion.div layout className="glass p-4 rounded-xl hover:shadow-neon2 transition-shadow" style={{backgroundImage: bg}}>
      <div className="text-xs opacity-70">{new Date(t.endsAt).toLocaleString()}</div>
      <div className="text-xl font-semibold mb-2">{t.title}</div>
      <div className="text-3xl font-mono">
        {tl.days}д {tl.hours.toString().padStart(2,'0')}:{tl.mins.toString().padStart(2,'0')}:{tl.secs.toString().padStart(2,'0')}
      </div>
      <div className="flex gap-2 mt-3">
        <Link to={idLink} className="px-3 py-1 rounded-lg bg-white/10">Открыть</Link>
        <Link to={`/?folder=${t.folderId||''}`} className="px-3 py-1 rounded-lg bg-white/10">Папка</Link>
      </div>
    </motion.div>
  )
}
