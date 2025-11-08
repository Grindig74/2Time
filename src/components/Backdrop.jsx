import React from 'react'
import { WeatherCtx } from '../weather/WeatherContext'
import { gradientBySun, timeGradient } from '../lib/theme'

function Stars(){const stars=React.useMemo(()=>Array.from({length:70}).map(()=>({left:Math.random()*100,top:Math.random()*100,d:2+Math.random()*2,delay:Math.random()*3})),[]);return <div className='starfield'>{stars.map((s,i)=>(<div key={i} className='star' style={{left:s.left+'%',top:s.top+'%',width:s.d,height:s.d,animationDelay:s.delay+'s'}}/>))}</div>}
function Clouds({density=1}){const clouds=React.useMemo(()=>Array.from({length:3+Math.round(3*density)}).map(()=>({top:(10+Math.random()*60)+'%', width:(40+Math.random()*40)+'vw', dur:(80+Math.random()*60)+'s'})),[density]);return <div className='clouds'>{clouds.map((c,i)=>(<div key={i} className='cloud' style={{top:c.top,width:c.width,animationDuration:c.dur}}/>))}</div>}
function Rain(){const drops=React.useMemo(()=>Array.from({length:140}).map(()=>({left:Math.random()*100,delay:Math.random()*1.2})),[]);return <div className='rain'>{drops.map((d,i)=>(<div key={i} className='drop' style={{left:d.left+'%',animationDelay:d.delay+'s'}}/>))}</div>}
function Snow(){const flakes=React.useMemo(()=>Array.from({length:90}).map(()=>({left:Math.random()*100,delay:Math.random()*8})),[]);return <div className='snow'>{flakes.map((d,i)=>(<div key={i} className='flake' style={{left:d.left+'%',animationDelay:d.delay+'s'}}/>))}</div>}

function Moon({phaseFrac=0}){
  // 0=new, 0.5=full. Simple mask for phase.
  const clip = Math.max(0, Math.min(1, phaseFrac))
  const offset = (clip-0.5)*90 // px shift of shadow
  return (<>
    <div className='moon'/>
    <div className='moon-mask' style={{transform:`translateX(${offset}px)`}}/>
  </>)
}

export default function Backdrop(){
  const { data } = React.useContext(WeatherCtx)
  const now = new Date()
  const sunrise = data?.daily?.sunrise?.[0]
  const sunset  = data?.daily?.sunset?.[0]
  const grad = (sunrise && sunset) ? gradientBySun(sunrise, sunset, now) : timeGradient(now)

  // Hourly cloud cover now
  let density = 0.5, symbol = null
  if(data?.hourly){
    // find nearest hour
    const idx = data.hourly.time ? data.hourly.time.findIndex(t=> Math.abs(new Date(t).getTime()-now.getTime())<60*60*1000 ) : -1
    if(idx>=0){
      const cc = data.hourly.cloud_cover?.[idx]
      if(typeof cc === 'number') density = Math.min(1, Math.max(0, cc/100))
    }
  }
  const code = data?.current?.weather_code
  if(code!=null){
    if([51,53,55,61,63,65,80,81,82].includes(code)) symbol='rain'
    if([56,57,66,67,71,73,75,77,85,86].includes(code)) symbol='snow'
  }

  // Moon phase today (0..1). Open-Meteo returns -1..1: convert
  let moon = null
  const mp = data?.daily?.moon_phase?.[0]
  if(typeof mp === 'number'){ moon = (mp+1)/2 } // normalize to [0..1]

  const isNight = sunrise && sunset ? (now < new Date(sunrise) || now > new Date(sunset)) : (now.getHours()<6 || now.getHours()>=20)

  return <div className='fixed inset-0 -z-10' style={{background:grad}}>
    {isNight && <Stars/>}
    <Clouds density={density}/>
    {symbol==='rain' && <Rain/>}
    {symbol==='snow' && <Snow/>}
    {isNight && moon!=null && <Moon phaseFrac={moon}/>}
  </div>
}
