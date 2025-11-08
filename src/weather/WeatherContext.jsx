import React from 'react'
import { geolocate, reverseGeocode, fetchWeather } from '../lib/weather'
import { loadState, saveState } from '../lib/storage'

export const WeatherCtx = React.createContext({})

export function WeatherProvider({children}){
  const [coords,setCoords]=React.useState(()=>loadState('weather.coords',null))
  const [place,setPlace]=React.useState(()=>loadState('weather.place',null))
  const [data,setData]=React.useState(null)
  const [loading,setLoading]=React.useState(false)
  const [error,setError]=React.useState(null)

  const setManualLocation = async (name, lat, lon)=>{
    setCoords({lat,lon}); setPlace(name)
    saveState('weather.coords',{lat,lon}); saveState('weather.place',name)
    await refresh({lat,lon})
  }

  const refresh = async (override=null)=>{
    const c = override || coords
    if(!c) return
    try{
      setLoading(true); setError(null)
      const j = await fetchWeather(c.lat, c.lon, 16)
      setData(j)
    }catch(e){ setError('Ошибка погоды') }
    finally{ setLoading(false) }
  }

  React.useEffect(()=>{(async()=>{
    if(coords){ refresh(); return }
    const g = await geolocate()
    if(g){ setCoords(g); saveState('weather.coords',g); const name=await reverseGeocode(g.lat,g.lon); if(name){ setPlace(name); saveState('weather.place',name) } ; refresh(g); return }
    const fallback={lat:55.1644, lon:61.4368}
    setCoords(fallback); saveState('weather.coords',fallback)
    const name='Челябинск, Россия'; setPlace(name); saveState('weather.place',name)
    refresh(fallback)
  })()},[])

  const value={ coords, place, data, loading, error, refresh, setManualLocation }
  return <WeatherCtx.Provider value={value}>{children}</WeatherCtx.Provider>
}
