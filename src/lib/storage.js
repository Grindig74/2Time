export const loadState=(k,def)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):def}catch{return def}}
export const saveState=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
export const uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36)
