import React,{useEffect,useMemo,useState} from 'react'
import Backdrop from '../components/Backdrop';import NeonHeader from '../components/NeonHeader';import TimerCard,{ remainingMsBig } from '../components/TimerCard'
import { loadState, saveState, uid } from '../lib/storage';import { backgroundForTitle } from '../lib/theme';import { saveTimerToCloud, saveLinkToCloud, hasFirebaseConfig } from '../lib/firebase'
import { bigAddStr, briefHuman, hhmmss, YEAR, SOFT_YEARS } from '../lib/format'

const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const genSlug = (len=7)=>Array.from({length:len},()=>SLUG_CHARS[Math.floor(Math.random()*SLUG_CHARS.length)]).join('')

const toPublicPayload = (t)=>{
  const base = { title:t.title||'', kind:t.kind, bg:t.bg||'' }
  if(t.kind==='abs') return { ...base, endsAt:t.endsAt }
  return { ...base, durationMsStr:t.durationMsStr, createdAtMs:t.createdAtMs||Date.now() }
}

export default function App(){
  const [timers,setTimers]=useState(()=>loadState('timers',[]))
  const [folders,setFolders]=useState(()=>loadState('folders',[]))
  const [activeFolder,setActiveFolder]=useState(null)
  const [creating,setCreating]=useState(false)
  const [newT,setNewT]=useState({title:'',kind:'abs',endsAt:'',durationMsStr:'',folderId:null,bg:'',createdAtMs:Date.now()})
  const [reminderFor,setReminderFor]=useState(null)

  useEffect(()=>{setTimers(ts=>ts.map(t=> t.kind? t : {...t, kind:'abs', createdAtMs:t.createdAtMs||Date.now()} ))},[])

  useEffect(()=>{
    const id=setInterval(()=>{
      setTimers(ts=>ts.map(t=>{
        const left = remainingMsBig(t)
        if(!t.completed && left===0n) return {...t, completed:true, completedAt:new Date().toISOString()}
        return t
      }))
    },1000)
    return()=>clearInterval(id)
  },[])

  useEffect(()=>saveState('timers',timers),[timers])
  useEffect(()=>saveState('folders',folders),[folders])

  const filtered=useMemo(()=>timers.filter(t=>activeFolder?t.folderId===activeFolder:true),[timers,activeFolder])
  const activeSorted = [...filtered.filter(t=>!t.completed)].sort((a,b)=>{
    const da = remainingMsBig(a), db = remainingMsBig(b)
    if(da!==db) return da<db ? -1 : 1
    return (a.title||'').localeCompare((b.title||''),'ru')
  })
  const completedSorted = [...filtered.filter(t=>t.completed)].sort((a,b)=> (new Date(b.completedAt)-new Date(a.completedAt)) )

  function addFolder(){const name=prompt('Название папки');if(!name)return;const emoji=prompt('Эмодзи')||'🗂️';setFolders([...folders,{id:uid(),name,emoji}])}
  const renameFolder=id=>{const name=prompt('Новое название папки');if(!name)return;setFolders(folders.map(f=>f.id===id?{...f,name}:f))}
  const emojiFolder=id=>{const emoji=prompt('Новый эмодзи');if(!emoji)return;setFolders(folders.map(f=>f.id===id?{...f,emoji}:f))}
  const deleteFolder=id=>{if(!confirm('Удалить папку? Таймеры останутся без папки.'))return;setFolders(folders.filter(f=>f.id!==id));setTimers(timers.map(t=>t.folderId===id?{...t,folderId:null}:t));if(activeFolder===id)setActiveFolder(null)}

  async function saveNewTimer(){
    if(!newT.title){alert('Название?');return}
    if(newT.kind==='abs' && !newT.endsAt){alert('Выбери дату/время или жми пресеты');return}
    if(newT.kind==='dur' && !newT.durationMsStr){alert('Пустая длительность');return}
    const id=uid(); const bg=newT.bg||backgroundForTitle(newT.title)
    const base = { id, title:newT.title, folderId:newT.folderId||null, bg, reminderMode:'off',reminderEveryMin:0,reminderAt:'09:00', completed:false, completedAt:null }
    const t = (newT.kind==='dur')
      ? { ...base, kind:'dur', durationMsStr:newT.durationMsStr, createdAtMs:newT.createdAtMs||Date.now() }
      : { ...base, kind:'abs', endsAt:newT.endsAt, createdAtMs:Date.now() }

    if(newT.kind==='dur'){
      const years = BigInt(newT.durationMsStr) / YEAR
      if(years >= SOFT_YEARS){
        const ok = confirm('Очень длинный таймер (≥ 1000 лет). Добавить всё равно?')
        if(!ok) return
      }
    }

    setTimers([t,...timers]); setCreating(false)
    if(hasFirebaseConfig()){try{await saveTimerToCloud(id,t)}catch(e){console.warn('Cloud save failed',e)}}
  }

  function removeTimer(id){if(!confirm('Удалить таймер?'))return;setTimers(timers.filter(t=>t.id!==id))}
  function onDragStartTimer(e,id){e.dataTransfer.setData('text/timer-id', id)}
  function onDropToFolder(folderId){return (e)=>{const id=e.dataTransfer.getData('text/timer-id');if(!id)return;e.preventDefault();setTimers(ts=>ts.map(t=>t.id===id?{...t,folderId}:t))}}

  async function copyShareLink(t){
    const one = confirm('Сделать одноразовую ссылку? Нажми «Отмена» — будет обычная.')
    if(hasFirebaseConfig()){
      try{
        const payload = { ...toPublicPayload(t), oneTime: !!one }
        for(let i=0;i<5;i++){
          const slug = genSlug(7+i) // слегка увеличиваем длину при ретраях
          try{
            await saveLinkToCloud(slug, payload)
            const url = `${location.origin}/s/${slug}`
            await navigator.clipboard.writeText(url)
            alert((one?'Одноразовая':'Короткая')+' ссылка скопирована: '+url)
            return
          }catch(e){
            // вероятная коллизия — пробуем снова
            if(i===4) throw e
          }
        }
      }catch(e){
        console.warn('Short link failed, fallback', e)
      }
    }
    // fallback: local
    const b64=btoa(unescape(encodeURIComponent(JSON.stringify(toPublicPayload(t))))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','')
    const url=`${location.origin}/t/local?d=${b64}`
    await navigator.clipboard.writeText(url)
    alert('Ссылка скопирована: '+url)
  }

  return (<div>
    <Backdrop/><NeonHeader/>
    <div className="px-4 pb-2 flex items-center gap-2 overflow-x-auto">
      <button onClick={addFolder} className="glass px-3 py-2 rounded-lg text-sm hover:shadow-neon">+ Папка</button>
      {folders.map(f=>(
        <div key={f.id} className="flex items-center gap-1" onDragOver={(e)=>e.preventDefault()} onDrop={onDropToFolder(f.id)}>
          <button className={`glass px-3 py-2 rounded-lg text-sm ${activeFolder===f.id?'ring-1 ring-neon shadow-neon':''}`} onClick={()=>setActiveFolder(f.id)}>
            {f.emoji||'🗂️'} {f.name}
          </button>
          <button title="Изменить" className="px-2 py-2 text-xs opacity-70 hover:opacity-100"
                  onClick={()=>{const act=prompt('Действие: rename | emoji | delete','rename');if(!act)return;if(act==='rename')renameFolder(f.id);else if(act==='emoji')emojiFolder(f.id);else if(act==='delete')deleteFolder(f.id);}}>⋯</button>
        </div>
      ))}
      <div onDragOver={(e)=>e.preventDefault()} onDrop={onDropToFolder(null)}>
        <button className={`glass px-3 py-2 rounded-lg text-sm ${activeFolder===null?'ring-1 ring-neon':''}`} onClick={()=>setActiveFolder(null)}>Все</button>
      </div>
    </div>

    <div className="px-4 py-2 flex gap-2">
      <button onClick={()=>setCreating(true)} className="glass px-3 py-2 rounded-lg hover:shadow-neon">+ Таймер</button>
    </div>

    <div className="grid gap-4 px-4">
      {activeSorted.map(t=>(
        <div key={t.id} className="relative glass p-4 rounded-xl" style={{backgroundImage:t.bg||backgroundForTitle(t.title)}} draggable onDragStart={(e)=>onDragStartTimer(e,t.id)}>
          <div className="text-xs opacity-70">{t.kind==='abs'?new Date(t.endsAt).toLocaleString():'длительный таймер'}</div>
          <div className="text-xl font-semibold mb-2">{t.title}</div>
          <TimerCard t={t}/>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={()=>copyShareLink(t)} className="text-xs bg-white/10 px-2 py-1 rounded">Поделиться</button>
            <button onClick={()=>removeTimer(t.id)} className="text-xs bg-white/10 px-2 py-1 rounded">Удалить</button>
          </div>
        </div>
      ))}
    </div>

    {completedSorted.length>0 && (
      <div className="opacity-75 mt-6 px-4">
        <div className="text-xs mb-2">Завершённые</div>
        <div className="grid gap-4">
          {completedSorted.map(t=>(
            <div key={t.id} className="relative glass p-4 rounded-xl opacity-60" style={{backgroundImage:t.bg||backgroundForTitle(t.title)}}>
              <div className="text-xs">{t.kind==='abs'?new Date(t.endsAt).toLocaleString():'длительный таймер'}</div>
              <div className="text-xl font-semibold mb-2">{t.title}</div>
              <div className="text-xs">Завершён: {new Date(t.completedAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    )}

    {creating&&(<NewTimerModal newT={newT} setNewT={setNewT} onClose={()=>setCreating(false)} onSave={saveNewTimer} />)}
  </div>)
}

function NewTimerModal({newT,setNewT,onClose,onSave}){
  const [tab,setTab] = React.useState('quick')
  const addMs=(ms)=> setNewT(s=>({ ...s, kind:'dur', durationMsStr: bigAddStr(s.durationMsStr, String(ms)), endsAt:'', createdAtMs: Date.now() }))
  const durationMs = BigInt(newT.kind==='dur' ? (newT.durationMsStr||'0') : '0')
  const nowNum = Date.now()
  const nowStr = new Date(nowNum).toLocaleString()
  const addStrFull = (durationMs < 2n*24n*60n*60n*1000n) ? ('+ '+hhmmss(durationMs)) : ('+ '+briefHuman(durationMs))
  const MAX_RANGE = 8640000000000000
  let fireAt='—'
  try{
    if (durationMs > 0n) {
      const durNum = Number(durationMs <= 9007199254740991n ? durationMs : 9007199254740991n)
      const sum = nowNum + durNum
      fireAt = sum <= MAX_RANGE ? new Date(sum).toLocaleString() : 'очень далёкая дата'
    }
  }catch(e){ fireAt='очень далёкая дата' }

  const softWarn = (durationMs / (365n*24n*60n*60n*1000n)) >= 1000n

  return (<div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
    <div className="glass w-full max-w-md p-4 rounded-2xl">
      <h2 className="text-xl font-semibold mb-3">Новый таймер</h2>
      <label className="block text-sm opacity-80 mb-1">Название</label>
      <input className="w-full glass px-3 py-2 rounded-lg mb-3" placeholder="Напр., Поездка к морю" value={newT.title} onChange={e=>setNewT({...newT,title:e.target.value})}/>

      <div className="flex gap-2 mb-3">
        <button className={`px-3 py-1 rounded ${tab==='quick'?'bg-white/20':'bg-white/10'}`} onClick={()=>setTab('quick')}>Быстро</button>
        <button className={`px-3 py-1 rounded ${tab==='date'?'bg-white/20':'bg-white/10'}`} onClick={()=>setTab('date')}>По дате</button>
      </div>

      {tab==='quick' && (<>
        <div className="flex flex-wrap gap-2 mb-3">
          {[30e3,5*60e3,15*60e3,30*60e3,60*60e3,24*60*60e3,7*24*60*60e3,30*24*60*60e3].map((ms,i)=>(
            <button key={i} onClick={()=>addMs(ms)} className="px-2 py-1 bg-white/10 rounded">
              {['+30с','+5м','+15м','+30м','+1ч','+1д','+1н','+1м'][i]}
            </button>
          ))}
        </div>

        <div className="hint rounded-lg p-3 text-sm mb-3">
          <div className="opacity-70">Сейчас</div>
          <div className="font-mono">{nowStr}</div>
          {durationMs>0n && (<>
            <div className="opacity-70 mt-2">Добавишь</div>
            <div className="font-mono">{addStrFull}</div>
            <div className="opacity-70 mt-2">Сработает</div>
            <div className="font-mono">{fireAt}</div>
          </>)}
        </div>

        {softWarn && <div className="text-xs text-amber-300 mb-2">Это больше 1000 лет — всё ок, просто предупреждаю.</div>}
      </>)}

      {tab==='date' && (<>
        <label className="block text-sm opacity-80 mb-1">Дата и время окончания</label>
        <input type="datetime-local" className="w-full glass px-3 py-2 rounded-lg mb-3" value={newT.endsAt||''} onChange={e=>setNewT(s=>({...s,kind:'abs', endsAt:e.target.value}))}/>
      </>)}

      <label className="block text-sm opacity-80 mb-1">Фон (опционально)</label>
      <input type="file" accept="image/*" onChange={(e)=>{const f=e.target.files?.[0];if(!f)return;const url=URL.createObjectURL(f);setNewT(s=>({...s,bg:`url(${url})`}))}} className="mb-3"/>
      <div className="h-24 rounded-lg" style={{backgroundImage:newT.bg}}/>

      <div className="mt-4 flex gap-2 justify-end">
        <button onClick={onClose} className="px-3 py-2 rounded-lg bg-white/10">Отмена</button>
        <button onClick={onSave} className="px-3 py-2 rounded-lg bg-white/20 hover:shadow-neon">Сохранить</button>
      </div>
    </div>
  </div>)
}
