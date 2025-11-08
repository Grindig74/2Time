import React from 'react'
import { geolocate, reverseGeocode, fetchWeather, searchCity, codeToIcon } from '../lib/weather'
import { loadState, saveState } from '../lib/storage'

export const WeatherCtx = React.createContext({})

export function WeatherProvider({children}){
  const [coords,setCoords]=React.useState(()=>loadState('weather.coords',null))
  const [place,setPlace]=React.useState(()=>loadState('weather.place',null))
  const [data,setData]=React.useState(null)
  const [loading,setLoading]=React.useState(false)
  const [error,setError]=React.useState(null)

  const setManualLocation = async (q)=>{
    const list = await searchCity(q)
    if(!list.length){ setError('Город не найден'); return false }
    const top = list[0]
    setCoords({lat:top.lat, lon:top.lon}); setPlace(top.name)
    saveState('weather.coords',{lat:top.lat, lon:top.lon}); saveState('weather.place',top.name)
    return true
  }

  const refresh = async ()=>{
    if(!coords) return
    try{
      setLoading(true); setError(null)
      const j = await fetchWeather(coords.lat, coords.lon, 16)
      setData(j)
    }catch(e){ setError('Ошибка погоды') }
    finally{ setLoading(false) }
  }

  React.useEffect(()=>{(async()=>{
    if(coords){ refresh(); return }
    const g = await geolocate()
    if(g){ setCoords(g); saveState('weather.coords',g); const name=await reverseGeocode(g.lat,g.lon); if(name){ setPlace(name); saveState('weather.place',name) } ; refresh(); return }
    const fallback={lat:55.1644, lon:61.4368}
    setCoords(fallback); saveState('weather.coords',fallback)
    const name='Челябинск, Россия'; setPlace(name); saveState('weather.place',name)
    refresh()
  })()},[])

  const currentCode = data?.current?.weather_code
  const mood = currentCode!=null ? codeToIcon(currentCode) : null

  // sunrise/sunset today
  let sunrise=null, sunset=null, moonPhase=null, cloudNow=0
  if(data?.daily){
    sunrise=data.daily.sunrise?.[0]||null
    sunset=data.daily.sunset?.[0]||null
    moonPhase=data.daily.moon_phase?.[0] ?? null
  }
  if(data?.hourly){
    // use last hourly sample as "now" cloud cover
    const n = data.hourly.cloud_cover?.length||0
    if(n>0) cloudNow = data.hourly.cloud_cover[n-1]||0
  }

  const value={ coords, place, data, loading, error, refresh, setManualLocation, mood, sunrise, sunset, moonPhase, cloudNow }
  return <WeatherCtx.Provider value={value}>{children}</WeatherCtx.Provider>
}
