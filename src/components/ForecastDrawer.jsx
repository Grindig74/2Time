import React from 'react'
import { WeatherCtx } from '../weather/WeatherContext'
import WeatherIcon from './WeatherIcon'
import { codeToIcon } from '../lib/weather'

function dayName(dstr){
  const d=new Date(dstr); return d.toLocaleDateString('ru-RU',{weekday:'short', day:'2-digit'})
}

export default function ForecastDrawer({open,onClose}){
  const { data, place, loading, setManualLocation, refresh, error } = React.useContext(WeatherCtx)

  // КРИТИЧЕСКОЕ: когда закрыт — не монтируем вообще, чтобы не было шанса перекрыть экран
  if(!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}/>
      <div className="absolute bottom-0 left-0 right-0 bg-[#0b0f1a] border-t border-white/10 rounded-t-2xl p-4 z-50">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-semibold">Погода — {place||'—'}</div>
          <div className="flex gap-2">
            <button onClick={()=>refresh()} className="text-xs bg-white/10 px-2 py-1 rounded">Обновить</button>
            <button onClick={onClose} className="text-xs bg-white/10 px-2 py-1 rounded">Закрыть</button>
          </div>
        </div>

        <div className="mb-3">
          <input
            placeholder="Сменить город (напр. Амстердам)"
            className="w-full glass px-3 py-2 rounded"
            onKeyDown={async(e)=>{
              if(e.key==='Enter'){
                const ok=await setManualLocation(e.currentTarget.value)
                if(ok) e.currentTarget.value=''
              }
            }}
          />
          <div className="text-xs opacity-70 mt-1">Нажми Enter для применения</div>
        </div>

        {error && <div className="text-sm text-amber-300 mb-2">{error}</div>}
        {loading && <div className="opacity-80 mb-2">Загружаю…</div>}

        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.daily.time.map((t,i)=>(
              <div key={t} className="glass p-3 rounded-xl">
                <div className="text-sm opacity-80">{dayName(t)}</div>
                <div className="text-xl font-semibold flex items-center">
                  <WeatherIcon code={codeToIcon(data.daily.weather_code[i])}/>
                  {Math.round(data.daily.temperature_2m_min[i])}…{Math.round(data.daily.temperature_2m_max[i])}°
                </div>
                <div className="text-xs opacity-70">Осадки: {Math.round(data.daily.precipitation_sum[i]||0)} мм</div>
                <div className="text-xs opacity-70">Код: {data.daily.weather_code[i]}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
