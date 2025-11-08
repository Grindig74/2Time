const OM='https://api.open-meteo.com/v1/forecast'
const GEOR='https://geocoding-api.open-meteo.com/v1/reverse'
const GEOS='https://geocoding-api.open-meteo.com/v1/search'

export async function geolocate(){return new Promise((resolve)=>{if(!('geolocation' in navigator)) return resolve(null); navigator.geolocation.getCurrentPosition(p=>resolve({lat:p.coords.latitude, lon:p.coords.longitude}),()=>resolve(null),{enableHighAccuracy:true,timeout:8000,maximumAge:60000})})}
export async function reverseGeocode(lat,lon){try{const r=await fetch(`${GEOR}?latitude=${lat}&longitude=${lon}&language=ru`);const j=await r.json();const p=j?.results?.[0];return p? p.name + (p.country? ', '+p.country : '') : null}catch{return null}}
export async function searchCity(q){try{const r=await fetch(`${GEOS}?name=${encodeURIComponent(q)}&count=5&language=ru`);const j=await r.json();return (j?.results||[]).map(p=>({name:p.name+(p.country? ', '+p.country:''),lat:p.latitude,lon:p.longitude}))}catch{return []}}

export async function fetchWeather(lat,lon,days=16){
  const params=new URLSearchParams({
    latitude:String(lat), longitude:String(lon),
    current:'temperature_2m,weather_code',
    hourly:'cloud_cover',
    daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,moon_phase',
    timezone:'auto', forecast_days:String(days)
  })
  const r=await fetch(`${OM}?${params.toString()}`)
  const j=await r.json()
  return j
}

export function codeToIcon(code){
  if(code==0) return 'clear'
  if([1,2,3].includes(code)) return 'clouds'
  if([45,48].includes(code)) return 'fog'
  if([51,53,55,61,63,65,80,81,82].includes(code)) return 'rain'
  if([56,57,66,67,71,73,75,77,85,86].includes(code)) return 'snow'
  if([95,96,99].includes(code)) return 'storm'
  return 'clouds'
}
