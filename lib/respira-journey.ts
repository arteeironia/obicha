export type Attempt = { id: string; started_at: string; ended_at: string | null; cigs_per_day: number; cigs_per_pack: number; price_per_pack: number }
export function attemptStats(attempt: Attempt, now = Date.now()) {
 const start=Date.parse(attempt.started_at),end=attempt.ended_at?Date.parse(attempt.ended_at):now
 const minutes=Math.max(0,(Math.min(end,now)-start)/60000)
 const cigarettes=minutes/1440*Number(attempt.cigs_per_day)
 const money=Number(attempt.cigs_per_pack)>0?cigarettes/Number(attempt.cigs_per_pack)*Number(attempt.price_per_pack):0
 return {minutes,days:Math.floor(minutes/1440),cigarettes,money}
}
export function localDay(now: Date, timeZone: string) {
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now)
 const get=(type:string)=>parts.find(p=>p.type===type)!.value
 return `${get('year')}-${get('month')}-${get('day')}`
}
export function validTimezone(value: unknown): value is string {
 if(typeof value!=='string'||value.length>100)return false
 try{new Intl.DateTimeFormat('en',{timeZone:value}).format();return true}catch{return false}
}
