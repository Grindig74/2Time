import React, { useEffect, useMemo, useState } from 'react'
import Backdrop from '../components/Backdrop'
import NeonHeader from '../components/NeonHeader'
import FolderBar from '../components/FolderBar'
import TimerCard from '../components/TimerCard'
import { loadState, saveState, uid } from '../lib/storage'
import { backgroundForTitle } from '../lib/theme'
import { saveTimerToCloud, hasFirebaseConfig } from '../lib/firebase'

export default function App(){
  const [timers, setTimers] = useState(()=> loadState('timers', []))
  const [folders, setFolders] = useState(()=> loadState('folders', []))
  const [activeFolder, setActiveFolder] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newT, setNewT] = useState({ title: '', endsAt: '', folderId: null, bg: '' })
  const [uploadBg, setUploadBg] = useState(null)

  useEffect(()=> saveState('timers', timers), [timers])
  useEffect(()=> saveState('folders', folders), [folders])

  // live tick
  const [, force] = useState(0)
  useEffect(()=> {
    const id = setInterval(()=> force(x=>x+1), 1000)
    return ()=> clearInterval(id)
  }, [])

  const filtered = useMemo(()=> timers.filter(t=> activeFolder? t.folderId===activeFolder : true), [timers, activeFolder])

  function addFolder(){
    const name = prompt('Название папки')
    if (!name) return
    const emoji = prompt('Эмодзи (не обязательно)') || '🗂️'
    const f = { id: uid(), name, emoji }
    setFolders([...folders, f])
  }

  async function addTimer(){
    setCreating(true)
    setNewT({ title: '', endsAt: '', folderId: activeFolder, bg: '' })
  }
  function cancelCreate(){ setCreating(false) }

  async function saveNewTimer(){
    if (!newT.title || !newT.endsAt) { alert('Заполни название и дату'); return }
    const id = uid()
    const bg = newT.bg || backgroundForTitle(newT.title)
    const t = { id, title: newT.title, endsAt: newT.endsAt, folderId: newT.folderId || null, bg }
    setTimers([t, ...timers])
    setCreating(false)
    // Save minimal doc for sharing if Firebase configured
    if (hasFirebaseConfig()) {
      try { await saveTimerToCloud(id, t) } catch(e){ console.warn('Cloud save failed', e) }
    }
  }

  function handleFile(e){
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setUploadBg(url)
    setNewT(s => ({...s, bg: `url(${url})`}))
  }

  function copyShareLink(t){
    // If Firebase configured -> /t/:id ; else create a local data URL (#payload)
    let url = `${location.origin}/t/${t.id}`
    if (!hasFirebaseConfig()) {
      const payload = btoa(unescape(encodeURIComponent(JSON.stringify(t))))
      url = `${location.origin}/t/local#${payload}`
    }
    navigator.clipboard.writeText(url).then(()=> alert('Ссылка скопирована: ' + url))
  }

  function removeTimer(id){
    if (!confirm('Удалить таймер?')) return
    setTimers(timers.filter(t=>t.id !== id))
  }

  return (
    <div>
      <Backdrop/>
      <NeonHeader/>

      <FolderBar folders={folders} active={activeFolder} onCreate={addFolder} onSelect={setActiveFolder} />

      <div className="px-4 py-2 flex gap-2">
        <button onClick={addTimer} className="glass px-3 py-2 rounded-lg hover:shadow-neon">+ Таймер</button>
      </div>

      <div className="grid gap-4 px-4 pb-20" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))'}}>
        {filtered.map(t => (
          <div key={t.id} className="relative">
            <TimerCard t={t}/>
            <div className="absolute top-2 right-2 flex gap-2">
              <button onClick={()=>copyShareLink(t)} className="text-xs bg-white/10 px-2 py-1 rounded">Поделиться</button>
              <button onClick={()=>removeTimer(t.id)} className="text-xs bg-white/10 px-2 py-1 rounded">✕</button>
            </div>
          </div>
        ))}
        {filtered.length===0 && <div className="opacity-60 px-4">Нет таймеров. Нажми «+ Таймер».</div>}
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="glass w-full max-w-md p-4 rounded-2xl">
            <h2 className="text-xl font-semibold mb-3">Новый таймер</h2>
            <label className="block text-sm opacity-80 mb-1">Название</label>
            <input className="w-full glass px-3 py-2 rounded-lg mb-3" placeholder="Напр., Поездка к морю"
                   value={newT.title} onChange={e=>setNewT({...newT, title:e.target.value})}/>

            <label className="block text-sm opacity-80 mb-1">Дата и время окончания</label>
            <input type="datetime-local" className="w-full glass px-3 py-2 rounded-lg mb-3"
                   value={newT.endsAt} onChange={e=>setNewT({...newT, endsAt:e.target.value})}/>

            <label className="block text-sm opacity-80 mb-1">Фон (опционально)</label>
            <input type="file" accept="image/*" onChange={handleFile} className="mb-3"/>
            <div className="h-24 rounded-lg" style={{backgroundImage: newT.bg || backgroundForTitle(newT.title)}}/>

            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={cancelCreate} className="px-3 py-2 rounded-lg bg-white/10">Отмена</button>
              <button onClick={saveNewTimer} className="px-3 py-2 rounded-lg bg-white/20 hover:shadow-neon2">Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
