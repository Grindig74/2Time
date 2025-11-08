import React from 'react'
export default function WeatherIcon({code}){
  const common = { width:18, height:18, className:'icon' }
  if(code==='clear') return (<svg {...common} viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="currentColor"/><g stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="1" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="23" y2="12"/><line x1="4.2" y1="4.2" x2="6.8" y2="6.8"/><line x1="17.2" y1="17.2" x2="19.8" y2="19.8"/><line x1="4.2" y1="19.8" x2="6.8" y2="17.2"/><line x1="17.2" y1="6.8" x2="19.8" y2="4.2"/></g></svg>)
  if(code==='clouds') return (<svg {...common} viewBox="0 0 24 24"><path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11-2A4 4 0 0 0 7 18z" fill="currentColor"/></svg>)
  if(code==='rain') return (<svg {...common} viewBox="0 0 24 24"><path d="M7 16h10a4 4 0 0 0 0-8 6 6 0 0 0-11-2A4 4 0 0 0 7 16z" fill="currentColor"/><g stroke="currentColor" strokeWidth="2"><line x1="9" y1="18" x2="7" y2="22"/><line x1="13" y1="18" x2="11" y2="22"/><line x1="17" y1="18" x2="15" y2="22"/></g></svg>)
  if(code==='snow') return (<svg {...common} viewBox="0 0 24 24"><path d="M7 16h10a4 4 0 0 0 0-8 6 6 0 0 0-11-2A4 4 0 0 0 7 16z" fill="currentColor"/><g stroke="currentColor" strokeWidth="2"><circle cx="9" cy="20" r="1"/><circle cx="13" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></g></svg>)
  if(code==='storm') return (<svg {...common} viewBox="0 0 24 24"><path d="M7 16h10a4 4 0 0 0 0-8 6 6 0 0 0-11-2A4 4 0 0 0 7 16z" fill="currentColor"/><path d="M13 14l-3 6 5-4h-3l3-6" stroke="currentColor" strokeWidth="2" fill="none"/></svg>)
  if(code==='fog') return (<svg {...common} viewBox="0 0 24 24"><g stroke="currentColor" strokeWidth="2"><line x1="3" y1="8" x2="21" y2="8"/><line x1="1" y1="12" x2="23" y2="12"/><line x1="3" y1="16" x2="21" y2="16"/></g></svg>)
  return (<svg {...common} viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="currentColor"/></svg>)
}
