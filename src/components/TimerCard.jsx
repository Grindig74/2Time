import React from 'react'
import { SEC, MIN, HOUR, DAY, YEAR } from '../lib/format'

export function remainingMsBig(t){
  const now = BigInt(Date.now())
  if(t.kind === 'dur'){
    const created = BigInt(t.createdAtMs||Date.now())
    const dur = BigInt(t.durationMsStr||'0')
    const passed = now - created
    return dur > passed ? (dur - passed) : 0n
  } else {
    const end = BigInt(new Date(t.endsAt).getTime())
    return end > now ? (end - now) : 0n
  }
}

function formatBig(msBig){
  let x = msBig
  const y = x / YEAR; x = x % YEAR
  const d = x / DAY;  x = x % DAY
  const h = x / HOUR; x = x % HOUR
  const m = x / MIN;  x = x % MIN
  const s = x / SEC
  const hh = String(Number(h)).padStart(2,'0')
  const mm = String(Number(m)).padStart(2,'0')
  const ss = String(Number(s)).padStart(2,'0')
  const prefix = y>0n ? `${y}г ${d}д ` : `${d}д `
  return `${prefix}${hh}:${mm}:${ss}`
}

export default function TimerCard({t}){
  const [, setN] = React.useState(0)
  React.useEffect(()=>{const id=setInterval(()=>setN(x=>x+1),1000);return()=>clearInterval(id)},[])
  const left = remainingMsBig(t)
  return <div className="text-3xl font-mono mt-1">{formatBig(left)}</div>
}
