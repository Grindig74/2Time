import { initializeApp } from 'firebase/app';import { getFirestore, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
const cfg={apiKey:import.meta.env.VITE_FIREBASE_API_KEY,authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,storageBucket:import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,messagingSenderId:import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,appId:import.meta.env.VITE_FIREBASE_APP_ID}
export const hasFirebaseConfig=()=>!!(cfg.apiKey&&cfg.projectId&&cfg.appId);
let db=null;export const getDb=()=>{if(!hasFirebaseConfig())return null;if(!db){const app=initializeApp(cfg);db=getFirestore(app)}return db}
export async function saveTimerToCloud(id,data){const database=getDb();if(!database)return false;await setDoc(doc(database,'timers',id),data);return true}
export async function fetchTimerFromCloud(id){const database=getDb();if(!database)return null;const snap=await getDoc(doc(database,'timers',id));return snap.exists()?snap.data():null}
export async function saveLinkToCloud(slug,data){const database=getDb();if(!database)return false;await setDoc(doc(database,'links',slug),data,{merge:false});return true}
export async function fetchLinkFromCloud(slug){const database=getDb();if(!database)return null;const ref=doc(database,'links',slug);const snap=await getDoc(ref);return snap.exists()?{id:slug, ...snap.data()}:null}
export async function deleteLinkFromCloud(slug){const database=getDb();if(!database)return false;await deleteDoc(doc(database,'links',slug));return true}
