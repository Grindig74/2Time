import React,{useEffect,useMemo,useState} from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Backdrop from '../components/Backdrop'
import NeonHeader from '../components/NeonHeader'
import { fetchTimerFromCloud, hasFirebaseConfig } from '../lib/firebase'
import { backgroundForTitle } from '../lib/theme'

function decodeB64Url(input){try{const b64=input.replaceAll('-','+').replaceAll('_','/');const pad=b64.length%4;const b64p=b64+(pad?'='.repeat(4-pad):'');const json=atob(b64p);return JSON.parse(decodeURIComponent(escape(json)))}catch{return null}}

export default function TimerPublic(){const { id }=useParams();const [sp]=useSearchParams();const d=sp.get('d');const [timer,setTimer]=useState(d?decodeB64Url(d):null)
useEffect(()=>{(async()=>{if(d)return;if(!hasFirebaseConfig())return;const t=await fetchTimerFromCloud(id);if(t)setTimer(t)})()},[id,d])
const bg=useMemo(()=>timer?.bg||backgroundForTitle(timer?.title||''),[timer])
return(<div><Backdrop/><NeonHeader/>{!timer&&<div className='px-4 pt-8 opacity-70'>Таймер не найден.</div>}{timer&&(<div className='px-4 pt-6'><div className='glass p-6 rounded-2xl' style={{backgroundImage:bg}}><div className='text-xs opacity-70'>{new Date(timer.endsAt).toLocaleString()}</div><div className='text-2xl font-bold mb-4'>{timer.title}</div><Countdown endsAt={timer.endsAt}/></div></div>)}</div>)}
function Countdown({endsAt}){const[,force]=useState(0);useEffect(()=>{const id=setInterval(()=>force(x=>x+1),1000);return()=>clearInterval(id)},[]);const now=new Date();const end=new Date(endsAt);const total=Math.max(0,end-now);const d=Math.floor(total/86400000);const h=Math.floor((total%86400000)/3600000);const m=Math.floor((total%3600000)/60000);const s=Math.floor((total%60000)/1000);return <div className='text-5xl font-mono'>{d}д {String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</div>}
