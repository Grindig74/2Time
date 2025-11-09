
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import AppWrap from './screens/App.jsx'
import TimerPublic from './screens/TimerPublic.jsx'
if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{})})}
createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><Routes><Route path='/' element={<AppWrap/>}/><Route path='/t/:id' element={<TimerPublic/>}/><Route path='/t/local' element={<TimerPublic/>}/><Route path='/s/:sid' element={<TimerPublic/>}/></Routes></BrowserRouter></React.StrictMode>)
