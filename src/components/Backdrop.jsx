import React from 'react'
import { dayNightGradient } from '../lib/theme'
import { WeatherCtx } from '../weather/WeatherContext'

function Stars({count=60}){const stars=React.useMemo(()=>Array.from({length:count}).map(()=>({left:Math.random()*100,top:Math.random()*100,d:2+Math.random()*2,delay:Math.random()*3})),[count]);return <div className='starfield'>{stars.map((s,i)=>(<div key={i} className='star' style={{left:s.left+'%',top:s.top+'%',width:s.d,height:s.d,animationDelay:s.delay+'s'}}/>))}</div>}
function Clouds({alpha=1}){return <div className='clouds' style={{opacity:Math.max(0.25, Math.min(1, alpha))}}><div className='cloud'/><div className='cloud'/><div className='cloud'/></div>}
function Rain(){const drops=React.useMemo(()=>Array.from({length:120}).map(()=>({left:Math.random()*100,delay:Math.random()*1.2})),[]);return <div className='rain'>{drops.map((d,i)=>(<div key={i} className='drop' style={{left:d.left+'%',animationDelay:d.delay+'s'}}/>))}</div>}
function Snow(){const flakes=React.useMemo(()=>Array.from({length:80}).map(()=>({left:Math.random()*100,delay:Math.random()*8})),[]);return <div className='snow'>{flakes.map((d,i)=>(<div key={i} className='flake' style={{left:d.left+'%',animationDelay:d.delay+'s'}}/>))}</div>}
function Moon({phase=0}){
  // phase: 0..1 ; 0 = new, 0.5 = full
  const pct = Math.max(0, Math.min(1, phase))
  const isWaning = phase>0.5
  const clip = isWaning ? (2*(pct-0.5)) : (2*pct)
  return <div className='moon' style={{background:'radial-gradient(60% 60% at 40% 40%, rgba(255,255,255,0.9), rgba(255,255,255,0.5))'}}>
    <div style={{position:'absolute', inset:0, borderRadius:'50%', overflow:'hidden'}}>
      {/* Night mask to simulate phase */}
      <div style={{position:'absolute', top:0, bottom:0, left: isWaning? `${clip*100}%`:'0%', right: isWaning? '0%': `${clip*100}%`, background:'#0b0f1a'}}/>
    </div>
  </div>
}

export default function Backdrop(){
  const { mood, sunrise, sunset, moonPhase, cloudNow } = React.useContext(WeatherCtx)
  const grad=dayNightGradient({sunrise,sunset})
  const h=new Date().getHours()
  const isNight = (()=>{ if(sunrise && sunset){ const now=Date.now(); return now < new Date(sunrise).getTime() || now > new Date(sunset).getTime() } return (h<6||h>=20) })()
  const cloudAlpha = (cloudNow||0)/100

  return <div className='fixed inset-0 -z-10' style={{background:grad}}>
    {isNight && <Stars count={Math.round(60*(1-cloudAlpha))}/>}
    {(mood==='clouds' || cloudAlpha>0.25) && <Clouds alpha={0.6+0.4*cloudAlpha}/>}
    {mood==='rain' && <Rain/>}
    {mood==='snow' && <Snow/>}
    {isNight && <Moon phase={(moonPhase ?? 0.5)}/>}
  </div>
}
