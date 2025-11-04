import React,{useEffect,useMemo,useState} from 'react'
import Backdrop from '../components/Backdrop';import NeonHeader from '../components/NeonHeader';import FolderBar from '../components/FolderBar';import TimerCard from '../components/TimerCard'
import { loadState, saveState, uid } from '../lib/storage';import { backgroundForTitle } from '../lib/theme';import { saveTimerToCloud, hasFirebaseConfig } from '../lib/firebase'

export default function App(){
  const [timers,setTimers]=useState(()=>loadState('timers',[]))
  const [folders,setFolders]=useState(()=>loadState('folders',[]))
  const [activeFolder,setActiveFolder]=useState(null)
  const [creating,setCreating]=useState(false)
  const [newT,setNewT]=useState({title:'',endsAt:'',folderId:null,bg:''})
  const [reminderFor,setReminderFor]=useState(null)

  useEffect(()=>saveState('timers',timers),[timers]);useEffect(()=>saveState('folders',folders),[folders])
  const[,force]=useState(0);useEffect(()=>{const id=setInterval(()=>force(x=>x+1),1000);return()=>clearInterval(id)},[])
  const filtered=useMemo(()=>timers.filter(t=>activeFolder?t.folderId===activeFolder:true),[timers,activeFolder])

  function addFolder(){const name=prompt('Название папки');if(!name)return;const emoji=prompt('Эмодзи')||'🗂️';setFolders([...folders,{id:uid(),name,emoji}])}
  const renameFolder=id=>{const name=prompt('Новое название папки');if(!name)return;setFolders(folders.map(f=>f.id===id?{...f,name}:f))}
  const emojiFolder=id=>{const emoji=prompt('Новый эмодзи');if(!emoji)return;setFolders(folders.map(f=>f.id===id?{...f,emoji}:f))}
  const deleteFolder=id=>{if(!confirm('Удалить папку? Таймеры останутся без папки.'))return;setFolders(folders.filter(f=>f.id!==id));setTimers(timers.map(t=>t.folderId===id?{...t,folderId:null}:t));if(activeFolder===id)setActiveFolder(null)}

  function addTimer(){setCreating(true);setNewT({title:'',endsAt:'',folderId:activeFolder,bg:''})}function cancelCreate(){setCreating(false)}
  async function saveNewTimer(){if(!newT.title||!newT.endsAt){alert('Заполни название и дату');return}const id=uid();const bg=newT.bg||backgroundForTitle(newT.title);const t={id,title:newT.title,endsAt:newT.endsAt,folderId:newT.folderId||null,bg,reminderMode:'off',reminderEveryMin:0,reminderAt:'09:00'};setTimers([t,...timers]);setCreating(false);if(hasFirebaseConfig()){try{await saveTimerToCloud(id,t)}catch(e){console.warn('Cloud save failed',e)}}}
  const b64url=s=>btoa(s).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');const compress=obj=>b64url(unescape(encodeURIComponent(JSON.stringify(obj))))
  function copyShareLink(t){let url=`${location.origin}/t/${t.id}`;if(!hasFirebaseConfig()){url=`${location.origin}/t/local?d=${compress(t)}`}navigator.clipboard.writeText(url).then(()=>alert('Ссылка скопирована: '+url))}
  function removeTimer(id){if(!confirm('Удалить таймер?'))return;setTimers(timers.filter(t=>t.id!==id))}

  // Drag & Drop
  function onDragStartTimer(e,id){e.dataTransfer.setData('text/timer-id', id)}
  function onDropToFolder(folderId){return (e)=>{const id=e.dataTransfer.getData('text/timer-id');if(!id)return;e.preventDefault();setTimers(ts=>ts.map(t=>t.id===id?{...t,folderId}:t))}}
  function onDragOverAllow(e){e.preventDefault()}

  function moveTimerPrompt(id){
    const choices=['(без папки)',...folders.map(f=>`${f.emoji||''} ${f.name}`)]
    const picked=prompt('Куда переместить?\n'+choices.map((c,i)=>`${i}. ${c}`).join('\n'),'0')
    if(picked===null)return;const idx=parseInt(picked,10);if(Number.isNaN(idx)||idx<0||idx>=choices.length){alert('Не понял выбор');return}
    const folderId=idx===0?null:folders[idx-1].id;setTimers(timers.map(t=>t.id===id?{...t,folderId}:t))
  }

  const presets=[{label:'+30с',ms:30000},{label:'+5м',ms:300000},{label:'+15м',ms:900000},{label:'+30м',ms:1800000},{label:'+1ч',ms:3600000},{label:'+1д',ms:86400000},{label:'+1н',ms:604800000},{label:'+1м',ms:2592000000}]
  const setEndsDelta=ms=>{const dt=new Date(Date.now()+ms);setNewT(s=>({...s,endsAt:dt.toISOString().slice(0,16)}))}

  function openReminder(t){setReminderFor(t)}
  function saveReminderSettings(mode,everyMin,atHHMM){setTimers(ts=>ts.map(x=>x.id===reminderFor.id?{...x,reminderMode:mode,reminderEveryMin:everyMin,reminderAt:atHHMM}:x));setReminderFor(null)}

  function formatICSLocal(dt, tz){ // returns DTSTART;TZID=TZ:YYYYMMDDTHHMMSS
    const yyyy=dt.getFullYear(); const mm=String(dt.getMonth()+1).padStart(2,'0'); const dd=String(dt.getDate()).padStart(2,'0')
    const HH=String(dt.getHours()).padStart(2,'0'); const MM=String(dt.getMinutes()).padStart(2,'0'); const SS=String(dt.getSeconds()).padStart(2,'0')
    return { line:`DTSTART;TZID=${tz}:${yyyy}${mm}${dd}T${HH}${MM}${SS}`, until:`${yyyy}${mm}${dd}T${HH}${MM}${SS}` }
  }

  function downloadICS(timer){
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    const end = new Date(timer.endsAt)
    let start = new Date() // default: now
    if (timer.reminderMode==='daily' && /^\d{2}:\d{2}$/.test(timer.reminderAt||'')){
      const [h,m] = timer.reminderAt.split(':').map(n=>parseInt(n,10))
      start = new Date(); start.setSeconds(0,0); start.setHours(h,m,0,0)
      if (start < new Date()) { start = new Date(start.getTime() + 86400000) } // завтра, если время уже прошло
    }
    const fmtLocal = formatICSLocal(start, tz)
    const until = (d=> d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z')(end)

    let rrule = ''
    if (timer.reminderMode==='daily') {
      rrule = `RRULE:FREQ=DAILY;UNTIL=${until}`
    } else if (timer.reminderMode==='interval' && Number(timer.reminderEveryMin)>0) {
      const unit = (timer.reminderEveryMin%60===0) ? 'HOURLY' : 'MINUTELY'
      const interval = (unit==='HOURLY') ? (timer.reminderEveryMin/60|0) : timer.reminderEveryMin
      rrule = `RRULE:FREQ=${unit};INTERVAL=${interval};UNTIL=${until}`
    } else {
      alert('Выбери режим напоминаний'); return
    }

    const uidv = timer.id+'@2time'
    const dtstamp = new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+'Z'
    const ics = [
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//2Time//MVP//RU',
      'BEGIN:VEVENT',
      `UID:${uidv}`,
      `DTSTAMP:${dtstamp}`,
      fmtLocal.line,
      `SUMMARY:${timer.title} — напоминание`,
      rrule,
      'END:VEVENT','END:VCALENDAR'
    ].join('\r\n')

    const blob = new Blob([ics], {type:'text/calendar;charset=utf-8'})
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${timer.title || 'timer'}-reminder.ics`
    a.click()
  }

  return (<div>
    <Backdrop/><NeonHeader/>
    <div className="px-4 pb-2 flex items-center gap-2 overflow-x-auto">
      <button onClick={addFolder} className="glass px-3 py-2 rounded-lg text-sm hover:shadow-neon">+ Папка</button>
      {folders.map(f=>(
        <div key={f.id} className="flex items-center gap-1"
             onDragOver={onDragOverAllow} onDrop={onDropToFolder(f.id)}>
          <button className={`glass px-3 py-2 rounded-lg text-sm ${activeFolder===f.id?'ring-1 ring-neon shadow-neon':''}`}
                  onClick={()=>setActiveFolder(f.id)}>
            {f.emoji||'🗂️'} {f.name}
          </button>
          <button title="Изменить" className="px-2 py-2 text-xs opacity-70 hover:opacity-100"
                  onClick={()=>{const act=prompt('Действие: rename | emoji | delete','rename');if(!act)return;if(act==='rename')renameFolder(f.id);else if(act==='emoji')emojiFolder(f.id);else if(act==='delete')deleteFolder(f.id);}}>⋯</button>
        </div>
      ))}
      <div onDragOver={onDragOverAllow} onDrop={onDropToFolder(null)}>
        <button className={`glass px-3 py-2 rounded-lg text-sm ${activeFolder===null?'ring-1 ring-neon':''}`} onClick={()=>setActiveFolder(null)}>Все</button>
      </div>
    </div>

    <div className="px-4 py-2 flex gap-2">
      <button onClick={addTimer} className="glass px-3 py-2 rounded-lg hover:shadow-neon">+ Таймер</button>
    </div>

    <div className="grid gap-4 px-4 pb-20" style={{gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))'}}>
      {filtered.map(t=>(
        <div key={t.id} className="relative glass p-4 rounded-xl" style={{backgroundImage:t.bg||backgroundForTitle(t.title)}} draggable onDragStart={(e)=>onDragStartTimer(e,t.id)}>
          <div className="text-xs opacity-70">{new Date(t.endsAt).toLocaleString()}</div>
          <div className="text-xl font-semibold mb-2">{t.title}</div>
          <TimerCard t={t} draggableProps={{}}/>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={()=>copyShareLink(t)} className="text-xs bg-white/10 px-2 py-1 rounded">Поделиться</button>
            <button onClick={()=>moveTimerPrompt(t.id)} className="text-xs bg-white/10 px-2 py-1 rounded">Переместить</button>
            <button onClick={()=>setReminderFor(t)} className="text-xs bg-white/10 px-2 py-1 rounded">Напоминания</button>
            <button onClick={()=>downloadICS(t)} className="text-xs bg-white/10 px-2 py-1 rounded">Экспорт .ics</button>
            <button onClick={()=>removeTimer(t.id)} className="text-xs bg-white/10 px-2 py-1 rounded">Удалить</button>
          </div>
        </div>
      ))}
      {filtered.length===0&&<div className="opacity-60 px-4">Нет таймеров. Нажми «+ Таймер».</div>}
    </div>

    {creating&&(<div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
      <div className="glass w-full max-w-md p-4 rounded-2xl">
        <h2 className="text-xl font-semibold mb-3">Новый таймер</h2>
        <label className="block text-sm opacity-80 mb-1">Название</label>
        <input className="w-full glass px-3 py-2 rounded-lg mb-3" placeholder="Напр., Поездка к морю" value={newT.title} onChange={e=>setNewT({...newT,title:e.target.value})}/>
        <label className="block text-sm opacity-80 mb-1">Быстрый выбор длительности</label>
        <div className="flex flex-wrap gap-2 mb-3">{[{label:'+30с',ms:30000},{label:'+5м',ms:300000},{label:'+15м',ms:900000},{label:'+30м',ms:1800000},{label:'+1ч',ms:3600000},{label:'+1д',ms:86400000},{label:'+1н',ms:604800000},{label:'+1м',ms:2592000000}].map(p=>(<button key={p.label} onClick={()=>{const dt=new Date(Date.now()+p.ms);setNewT(s=>({...s,endsAt:dt.toISOString().slice(0,16)}))}} className="px-2 py-1 bg-white/10 rounded">{p.label}</button>))}</div>
        <label className="block text-sm opacity-80 mb-1">Дата и время окончания (можно поправить вручную)</label>
        <input type="datetime-local" className="w-full glass px-3 py-2 rounded-lg mb-3" value={newT.endsAt} onChange={e=>setNewT({...newT,endsAt:e.target.value})}/>
        <label className="block text-sm opacity-80 mb-1">Фон (опционально)</label>
        <input type="file" accept="image/*" onChange={(e)=>{const f=e.target.files?.[0];if(!f)return;const url=URL.createObjectURL(f);setNewT(s=>({...s,bg:`url(${url})`}))}} className="mb-3"/>
        <div className="h-24 rounded-lg" style={{backgroundImage:newT.bg||backgroundForTitle(newT.title)}}/>
        <div className="mt-4 flex gap-2 justify-end">
          <button onClick={cancelCreate} className="px-3 py-2 rounded-lg bg-white/10">Отмена</button>
          <button onClick={saveNewTimer} className="px-3 py-2 rounded-lg bg-white/20 hover:shadow-neon2">Сохранить</button>
        </div>
      </div>
    </div>)}

    {reminderFor&&(<ReminderModal timer={reminderFor} onClose={()=>setReminderFor(null)} onSave={saveReminderSettings}/>)}
  </div>)
}

function ReminderModal({timer,onClose,onSave}){
  const [mode,setMode]=React.useState(timer.reminderMode||'off')
  const [mins,setMins]=React.useState(timer.reminderEveryMin||60)
  const [hhmm,setHHMM]=React.useState(timer.reminderAt||'09:00')
  return (<div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
    <div className="glass w-full max-w-md p-4 rounded-2xl">
      <h2 className="text-xl font-semibold mb-3">Напоминания</h2>
      <div className="mb-2"><label className="mr-2"><input type="radio" checked={mode==='off'} onChange={()=>setMode('off')}/> Выкл</label></div>
      <div className="mb-2"><label className="mr-2"><input type="radio" checked={mode==='daily'} onChange={()=>setMode('daily')}/> Ежедневно</label>
        {mode==='daily'&&(<input className="ml-3 glass px-2 py-1 rounded" value={hhmm} onChange={e=>setHHMM(e.target.value)} placeholder="09:00"/>)}
      </div>
      <div className="mb-4"><label className="mr-2"><input type="radio" checked={mode==='interval'} onChange={()=>setMode('interval')}/> Интервал</label>
        {mode==='interval'&&(<input type="number" className="ml-3 w-24 glass px-2 py-1 rounded" value={mins} onChange={e=>setMins(parseInt(e.target.value||'0',10))}/>)} <span className="opacity-70">{mode==='interval'?'минут':''}</span>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-3 py-2 rounded-lg bg-white/10">Отмена</button>
        <button onClick={()=>onSave(mode,mins,hhmm)} className="px-3 py-2 rounded-lg bg-white/20 hover:shadow-neon2">Сохранить</button>
      </div>
    </div>
  </div>)
}
