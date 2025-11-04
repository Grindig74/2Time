import React from 'react'

export default function FolderBar({folders, active, onCreate, onSelect}){
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-2">
      <button onClick={onCreate} className="glass px-3 py-2 rounded-lg text-sm hover:shadow-neon">
        + Папка
      </button>
      {folders.map(f => (
        <button key={f.id}
          className={`glass px-3 py-2 rounded-lg text-sm ${active===f.id?'ring-1 ring-neon shadow-neon':''}`}
          onClick={()=>onSelect(f.id)}>
          {f.emoji || '🗂️'} {f.name}
        </button>
      ))}
      <button className={`glass px-3 py-2 rounded-lg text-sm ${active===null?'ring-1 ring-neon':''}`} onClick={()=>onSelect(null)}>
        Все
      </button>
    </div>
  )
}
