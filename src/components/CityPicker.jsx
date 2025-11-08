import React from 'react'
import { searchCity } from '../lib/weather'
export default function CityPicker({onPick}){
  const [q,setQ]=React.useState('')
  const [list,setList]=React.useState([])
  async function onSearch(e){e.preventDefault(); const res=await searchCity(q); setList(res)}
  return (<div className='mb-3'>
    <form onSubmit={onSearch} className='flex gap-2'>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder='Введите город' className='w-full glass px-3 py-2 rounded'/>
      <button className='px-3 py-2 bg-white/10 rounded'>Найти</button>
    </form>
    <div className='mt-2 grid gap-2'>
      {list.map((p,i)=>(<button key={i} onClick={()=>onPick(p)} className='text-left glass px-3 py-2 rounded hover:shadow-neon'>{p.name}</button>))}
    </div>
  </div>)
}
