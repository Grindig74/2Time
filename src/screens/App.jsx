
import React,{useEffect,useMemo,useState,useContext} from 'react'
import ForecastDrawer from '../components/ForecastDrawer'
import Backdrop from '../components/Backdrop'
import NeonHeader from '../components/NeonHeader'
import TimerCard,{ remainingMsBig } from '../components/TimerCard'
import { WeatherProvider, WeatherCtx } from '../weather/WeatherContext'
import { loadState, saveState, uid } from '../lib/storage'
import { backgroundForTitle } from '../lib/theme'
import { bigAddStr } from '../lib/format'

export default function AppWrap(){ return (<WeatherProvider><App/></WeatherProvider>) }

function App(){
  const [timers,setTimers]=useState(()=>loadState('timers',[]))
  const [creating,setCreating]=useState(false)
  const [newT,setNewT]=useState({title:'',kind:'abs',endsAt:'',durationMsStr:'',bg:'',createdAtMs:Date.now()})
  const [forecastOpen,setForecastOpen]=useState(false)
  const { place } = useContext(WeatherCtx)

  useEffect(()=>{ document.body.dataset.blockOverlay = (!forecastOpen && !creating) ? '1':'0' },[forecastOpen,creating])
  useEffect(()=>{const id=setInterval(()=>{setTimers(ts=>ts.map(t=>{const left=remainingMsBig(t); if(!t.completed && left===0n) return {...t,completed:true,completedAt:new Date().toISOString()}; return t}))},1000); return()=>clearInterval(id)},[])
  useEffect(()=>saveState('timers',timers),[timers])

  async function saveNewTimer(){
    if(!newT.title) return alert('Название?')
    if(newT.kind==='abs' && !newT.endsAt) return alert('Выбери дату/время или пресеты')
    const id=uid(); const t=(newT.kind==='dur')?{id,title:newT.title,kind:'dur',durationMsStr:newT.durationMsStr,createdAtMs:newT.createdAtMs||Date.now(),bg:newT.bg}:{id,title:newT.title,kind:'abs',endsAt:newT.endsAt,createdAtMs:Date.now(),bg:newT.bg}
    setTimers([t,...timers]); setCreating(false); setNewT({title:'',kind:'abs',endsAt:'',durationMsStr:'',bg:'',createdAtMs:Date.now()})
  }

  return (<div>
    <Backdrop/>
    <NeonHeader right={<button onClick={()=>setForecastOpen(true)} className='text-xs bg-white/10 px-2 py-1 rounded'>{place||'Погода'}</button>}/>
    <div className="px-4 py-2"><button onClick={()=>setCreating(true)} className="glass px-3 py-2 rounded-lg">+ Таймер</button></div>
    <div className="grid gap-4 px-4">
      {timers.filter(t=>!t.completed).map(t=>(
        <div key={t.id} className="glass p-4 rounded-xl"><div className="text-xl font-semibold mb-2">{t.title}</div><TimerCard t={t}/></div>
      ))}
    </div>
    {creating && <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"><div className="glass p-4 rounded-2xl w-full max-w-md">
      <input className="w-full glass px-3 py-2 rounded-lg mb-3" value={newT.title} onChange={e=>setNewT({...newT,title:e.target.value})} placeholder="Название"/>
      <div className="flex flex-wrap gap-2 mb-3">
        {[30e3,5*60e3,15*60e3,30*60e3,60*60e3].map((ms,i)=>(<button key={i} onClick={()=>setNewT(s=>({...s,kind:'dur',durationMsStr:bigAddStr(s.durationMsStr,String(ms)),endsAt:''}))} className="px-2 py-1 bg-white/10 rounded">+{['30с','5м','15м','30м','1ч'][i]}</button>))}
      </div>
      <input type="datetime-local" className="w-full glass px-3 py-2 rounded-lg mb-3" value={newT.endsAt||''} onChange={e=>setNewT(s=>({...s,kind:'abs',endsAt:e.target.value,durationMsStr:''}))}/>
      <div className="flex justify-end gap-2"><button onClick={()=>{setCreating(false)}} className="px-3 py-2 bg-white/10 rounded-lg">Отмена</button><button onClick={saveNewTimer} className="px-3 py-2 bg-white/20 rounded-lg">Сохранить</button></div>
    </div></div>}
    {forecastOpen && <ForecastDrawer open onClose={()=>setForecastOpen(false)}/>}
  </div>)
}
