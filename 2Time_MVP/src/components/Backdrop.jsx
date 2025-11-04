import React, { useMemo } from 'react'
import { timeGradient } from '../lib/theme'

function Stars(){
  const stars = useMemo(() => {
    return Array.from({length: 60}).map((_,i)=>({
      left: Math.random()*100, top: Math.random()*100, d: 2+Math.random()*2, delay: Math.random()*3
    }))
  },[])
  return <div className="starfield">
    {stars.map((s,i)=> (
      <div key={i} className="star" style={{left: s.left+'%', top: s.top+'%', width: s.d, height:s.d, animationDelay: s.delay+'s'}}/>
    ))}
  </div>
}

function Clouds(){
  return <div className="clouds">
    <div className="cloud"/>
    <div className="cloud"/>
    <div className="cloud"/>
  </div>
}

export default function Backdrop(){
  const grad = timeGradient()
  const hour = new Date().getHours()
  const isNight = hour < 6 || hour >= 20
  const isDawn = hour >=6 && hour <9
  return (
    <div className="fixed inset-0 -z-10" style={{background: grad}}>
      {isNight && <Stars/>}
      {isDawn && <Clouds/>}
    </div>
  )
}
