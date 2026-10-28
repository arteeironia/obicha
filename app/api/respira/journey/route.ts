import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'
import { localDay, validTimezone } from '@/lib/respira-journey'
const sql=postgres(process.env.DATABASE_URL!,{ssl:'require'})
export const dynamic='force-dynamic'
const headers={'Cache-Control':'private, no-store'}
function reply(data:unknown,status=200){return NextResponse.json(data,{status,headers})}
async function identity(request:NextRequest){
 const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1]
 if(!token)return null
 const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data,error}=await client.auth.getUser(token)
 return error?null:data.user
}
export async function GET(request:NextRequest){
 const user=await identity(request);if(!user)return reply({error:'Entre na sua conta.'},401)
 try{
  const state=await sql.begin(async tx=>{
   const [profile]=await tx`SELECT quit_at, paused_at, cigs_per_day, cigs_per_pack, price_per_pack FROM public.quit_profiles WHERE user_id=${user.id} FOR UPDATE`
   if(!profile)return null
   if(!profile.paused_at)await tx`INSERT INTO public.quit_attempts (user_id,started_at,cigs_per_day,cigs_per_pack,price_per_pack) SELECT ${user.id},${profile.quit_at},${profile.cigs_per_day},${profile.cigs_per_pack},${profile.price_per_pack} WHERE NOT EXISTS (SELECT 1 FROM public.quit_attempts WHERE user_id=${user.id} AND ended_at IS NULL)`
   const attempts=await tx`SELECT id,started_at,ended_at,cigs_per_day,cigs_per_pack,price_per_pack FROM public.quit_attempts WHERE user_id=${user.id} ORDER BY started_at DESC,id DESC`
   const checkins=await tx`SELECT id,attempt_id,local_day,time_zone FROM public.quit_checkins WHERE user_id=${user.id} ORDER BY local_day DESC LIMIT 366`
   return {profile,attempts,checkins}
  });return state?reply(state):reply({error:'Complete seu perfil primeiro.'},409)
 }catch{return reply({error:'Não foi possível carregar seu histórico.'},500)}
}
export async function POST(request:NextRequest){
 const user=await identity(request);if(!user)return reply({error:'Entre na sua conta.'},401)
 if(request.headers.get('origin')!==request.nextUrl.origin)return reply({error:'Origem inválida.'},403)
 try{
  const raw=await request.text();if(Buffer.byteLength(raw)>2000)return reply({error:'Dados muito grandes.'},413)
  const input=JSON.parse(raw)
  if(!input||!['pause','restart','checkin','undo','set_start'].includes(input.action)||!validTimezone(input.timeZone))return reply({error:'Dados inválidos.'},400)
  const action=input.action as string,now=new Date(),day=localDay(now,input.timeZone)
  const when=['pause','set_start'].includes(action)?new Date(input.occurredAt):now
  if(!Number.isFinite(when.getTime())||when.getTime()>now.getTime()&&action!=='set_start')return reply({error:'Escolha uma data válida, sem estar no futuro.'},422)
  const result=await sql.begin(async tx=>{
   const [p]=await tx`SELECT * FROM public.quit_profiles WHERE user_id=${user.id} FOR UPDATE`
   if(!p)return {error:'Complete seu perfil primeiro.'}
   let [attempt]=await tx`SELECT * FROM public.quit_attempts WHERE user_id=${user.id} AND ended_at IS NULL FOR UPDATE`
   if(!attempt&&!p.paused_at){[attempt]=await tx`INSERT INTO public.quit_attempts (user_id,started_at,cigs_per_day,cigs_per_pack,price_per_pack) VALUES (${user.id},${p.quit_at},${p.cigs_per_day},${p.cigs_per_pack},${p.price_per_pack}) RETURNING *`}
   if(action==='pause'){
    if(p.paused_at)return {ok:true}
    if(!attempt)return {error:'Não foi encontrada uma tentativa ativa.'}
    const started=new Date(attempt.started_at)
    if(when<started&&localDay(when,input.timeZone)===localDay(started,input.timeZone))when.setTime(started.getTime())
    if(when<started)return {error:'A data deve ser posterior ao início desta tentativa.'}
    await tx`UPDATE public.quit_attempts SET ended_at=${when.toISOString()} WHERE id=${attempt.id}`
    await tx`UPDATE public.quit_profiles SET paused_at=${when.toISOString()} WHERE user_id=${user.id}`
    // A confirmation cannot claim a smoke-free day on/after the reported return date.
    const pauseDay=localDay(when,input.timeZone)
    await tx`DELETE FROM public.quit_checkins WHERE user_id=${user.id} AND attempt_id=${attempt.id} AND local_day>=${pauseDay}::date`
   }else if(action==='restart'){
    if(!p.paused_at)return {ok:true}
    await tx`INSERT INTO public.quit_attempts (user_id,started_at,cigs_per_day,cigs_per_pack,price_per_pack) VALUES (${user.id},${now.toISOString()},${p.cigs_per_day},${p.cigs_per_pack},${p.price_per_pack})`
    await tx`UPDATE public.quit_profiles SET quit_at=${now.toISOString()},paused_at=NULL WHERE user_id=${user.id}`
   }else if(action==='set_start'){
    if(p.paused_at)return {error:'Use Recomeçar para iniciar uma nova tentativa.'}
    const [previous]=await tx`SELECT max(ended_at) AS ended_at FROM public.quit_attempts WHERE user_id=${user.id} AND ended_at IS NOT NULL`
    if(previous?.ended_at&&when.getTime()<new Date(previous.ended_at).getTime())return {error:'A nova data não pode se sobrepor à tentativa anterior.'}
    if(when.getTime()>now.getTime()+366*86400000)return {error:'Escolha uma data dentro dos próximos 12 meses.'}
    const [confirmed]=await tx`SELECT 1 FROM public.quit_checkins WHERE attempt_id=${attempt.id} LIMIT 1`
    if(confirmed)return {error:'Esta tentativa já tem dias confirmados. A data inicial foi preservada.'}
    await tx`UPDATE public.quit_attempts SET started_at=${when.toISOString()} WHERE id=${attempt.id}`
    await tx`UPDATE public.quit_profiles SET quit_at=${when.toISOString()} WHERE user_id=${user.id}`
   }else if(action==='undo'){
    await tx`DELETE FROM public.quit_checkins WHERE user_id=${user.id} AND local_day=${day}::date`
   }else{
    if(p.paused_at||!attempt||new Date(attempt.started_at)>now)return {error:'Inicie uma tentativa antes de confirmar o dia.'}
    const [smokedToday]=await tx`SELECT 1 FROM public.quit_attempts WHERE user_id=${user.id} AND ended_at IS NOT NULL AND ((ended_at AT TIME ZONE ${input.timeZone})::date=${day}::date OR (ended_at<=${attempt.started_at}::timestamptz AND (${attempt.started_at}::timestamptz AT TIME ZONE ${input.timeZone})::date=${day}::date)) LIMIT 1`
    if(smokedToday)return {error:'Seu recomeço de hoje está salvo. O primeiro check-in da nova tentativa estará disponível amanhã, sem contar o dia do retorno ao cigarro.'}
    await tx`INSERT INTO public.quit_checkins (user_id,attempt_id,local_day,time_zone) VALUES (${user.id},${attempt.id},${day}::date,${input.timeZone}) ON CONFLICT (user_id,local_day) DO NOTHING`
   }
   return {ok:true}
  });return reply(result,'error' in result?422:200)
 }catch(error){return reply({error:error instanceof SyntaxError?'Dados inválidos.':'Não foi possível salvar. Seu histórico foi preservado.'},error instanceof SyntaxError?400:500)}
}
