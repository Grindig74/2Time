import React from 'react'
import { WeatherCtx } from '../weather/WeatherContext'
import CityPicker from './CityPicker'
import WIcon from './WIcon'

function dayName(dstr){
  const d=new Date(dstr); return d.toLocaleDateString('ru-RU',{weekday:'short', day:'2-digit'})
}
export default function ForecastDrawer({open,onClose}){
  const { data, place, loading, setManualLocation, refresh } = React.useContext(WeatherCtx)
  return (
    <div className={`fixed inset-0 ${open?'pointer-events-auto':'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/50 transition-opacity ${open?'opacity-100':'opacity-0'}`} onClick={onClose}/>
      <div className={`absolute bottom-0 left-0 right-0 bg-[#0b0f1a] border-t border-white/10 rounded-t-2xl p-4 transition-transform ${open?'translate-y-0':'translate-y-full'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-semibold">Погода — {place||'—'}</div>
          <div className="flex gap-2">
            <button onClick={refresh} className="text-xs bg-white/10 px-2 py-1 rounded">Обновить</button>
            <button onClick={onClose} className="text-xs bg-white/10 px-2 py-1 rounded">Закрыть</button>
          </div>
        </div>

        <CityPicker onPick={(p)=>setManualLocation(p.name, p.lat, p.lon)}/>

        {loading && <div className="opacity-70">Загружаю…</div>}
        {!loading && data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {data.daily.time.map((t,i)=>(
              <div key={t} className="glass p-3 rounded-xl">
                <div className="text-sm opacity-80">{dayName(t)}</div>
                <div className="text-xl font-semibold flex items-center gap-2">
                  <WIcon code={data.daily.weather_code[i]}/> {Math.round(data.daily.temperature_2m_min[i])}…{Math.round(data.daily.temperature_2m_max[i])}°
                </div>
                <div className="text-xs opacity-70">Осадки: {Math.round(data.daily.precipitation_sum[i]||0)} мм</div>
                <div className="text-xs opacity-70">Восход: {new Date(data.daily.sunrise[i]).toLocaleTimeString()}</div>
                <div className="text-xs opacity-70">Закат: {new Date(data.daily.sunset[i]).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
