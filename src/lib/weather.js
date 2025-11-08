const OM='https://api.open-meteo.com/v1/forecast'
const GEOR='https://geocoding-api.open-meteo.com/v1/reverse'
const GEOS='https://geocoding-api.open-meteo.com/v1/search'

export async function geolocate(){
  return new Promise((resolve)=>{
    if(!('geolocation' in navigator)) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      pos=>resolve({lat:pos.coords.latitude, lon:pos.coords.longitude}),
      ()=>resolve(null),
      { enableHighAccuracy:true, timeout:8000, maximumAge:60000 }
    )
  })
}

export async function reverseGeocode(lat,lon){
  try{
    const url=`${GEOR}?latitude=${lat}&longitude=${lon}&language=ru`
    const r=await fetch(url); const j=await r.json()
    const p=j?.results?.[0]; if(!p) return null
    return p.name + (p.country? ', '+p.country : '')
  }catch{return null}
}

export async function searchCity(q){
  try{
    const url=`${GEOS}?name=${encodeURIComponent(q)}&count=5&language=ru`
    const r=await fetch(url); const j=await r.json()
    return (j?.results||[]).map(p=>({
      name: p.name + (p.country? ', '+p.country : ''),
      lat: p.latitude, lon: p.longitude
    }))
  }catch{return []}
}

export async function fetchWeather(lat,lon,days=16){
  const params=new URLSearchParams({
    latitude:String(lat), longitude:String(lon),
    current:'temperature_2m,weather_code',
    hourly:'temperature_2m,weather_code,cloud_cover',
    daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,moon_phase',
    timezone:'auto', forecast_days:String(days)
  })
  const r=await fetch(`${OM}?${params.toString()}`)
  const j=await r.json()
  return j
}

export function codeToIcon(code){
  // WMO codes → simple glyphs
  if(code==0) return '☀️'
  if([1,2].includes(code)) return '🌤️'
  if([3].includes(code)) return '☁️'
  if([45,48].includes(code)) return '🌫️'
  if([51,53,55,61,63,65,80,81,82].includes(code)) return '🌧️'
  if([56,57,66,67,71,73,75,77,85,86].includes(code)) return '🌨️'
  if([95,96,99].includes(code)) return '⛈️'
  return '☁️'
}
