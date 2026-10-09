const loading=new Map<string,Promise<void>>()
export function loadScript(src:string) {
 let ready=loading.get(src);if(ready)return ready;
 ready=new Promise<void>((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=()=>resolve();script.onerror=()=>{script.remove();loading.delete(src);reject(new Error('Não foi possível carregar a interface.'))};document.head.appendChild(script)});
 loading.set(src,ready);return ready;
}
declare global {interface Window {mountObichaVitrine:(data:unknown)=>()=>void;mountObichaAdmin:(data:unknown)=>()=>void}}
