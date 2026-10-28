const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm');const {NextRequest}=require('next/server');let checks=0;
function load(file,mocks={}){let m={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;vm.runInThisContext('(function(require,module,exports){'+code+'\n})',{filename:file})(id=>id in mocks?mocks[id]:require(id),m,m.exports);return m.exports}
const helpers=load('lib/respira-journey.ts');const {attemptStats,localDay,validTimezone}=helpers;
function eq(a,b,msg){assert.deepEqual(a,b,msg);checks++}
const at=(start,end)=>({id:'a',started_at:start,ended_at:end,cigs_per_day:20,cigs_per_pack:20,price_per_pack:15});
eq(attemptStats(at('2026-08-07T00:00:00Z','2026-10-04T00:00:00Z'),Date.parse('2026-10-27T00:00:00Z')).days,58,'Closed attempt freezes on return date');
eq(attemptStats(at('2026-10-27T00:00:00Z',null),Date.parse('2026-10-28T00:00:00Z')),{minutes:1440,days:1,cigarettes:20,money:15});
eq(attemptStats(at('2026-10-29T00:00:00Z',null),Date.parse('2026-10-28T00:00:00Z')).days,0);
eq(localDay(new Date('2026-10-28T01:00:00Z'),'America/Sao_Paulo'),'2026-10-27');eq(validTimezone('invalid/time'),false);eq(validTimezone('America/Sao_Paulo'),true);
let state,seq=0;const UID='11111111-1111-4111-8111-111111111111';
function reset(){state={profile:{user_id:UID,quit_at:new Date(Date.now()-40*86400000).toISOString(),paused_at:null,cigs_per_day:20,cigs_per_pack:20,price_per_pack:15},attempts:[],checkins:[]};seq=0}
async function query(parts,...v){const q=parts.join('?').replace(/\s+/g,' ').trim();
 if(q.startsWith('SELECT * FROM public.quit_profiles')||q.startsWith('SELECT quit_at,')){assert.equal(v[0],UID);return state.profile?[state.profile]:[]}
 if(q.startsWith('SELECT * FROM public.quit_attempts'))return state.attempts.filter(a=>!a.ended_at);
 if(q.startsWith('SELECT id,started_at'))return [...state.attempts].reverse();
 if(q.startsWith('SELECT id,attempt_id'))return state.checkins;
 if(q.startsWith('INSERT INTO public.quit_attempts')){if(q.includes('WHERE NOT EXISTS')&&state.attempts.some(a=>!a.ended_at))return[];let a={id:'attempt-'+(++seq),user_id:v[0],started_at:v[1],cigs_per_day:v[2],cigs_per_pack:v[3],price_per_pack:v[4],ended_at:null};state.attempts.push(a);return[a]}
 if(q.startsWith('UPDATE public.quit_attempts SET ended_at')){state.attempts.find(a=>a.id===v[1]).ended_at=v[0];return[]}
 if(q.startsWith('UPDATE public.quit_profiles SET paused_at')){state.profile.paused_at=v[0];return[]}
 if(q.startsWith('UPDATE public.quit_profiles SET quit_at')){state.profile.quit_at=v[0];if(q.includes('paused_at=NULL'))state.profile.paused_at=null;return[]}
 if(q.startsWith('DELETE FROM public.quit_checkins')){state.checkins=state.checkins.filter(c=>q.includes('local_day>=')?!(c.attempt_id===v[1]&&c.local_day>=v[2]):c.local_day!==v[1]);return[]}
 if(q.startsWith('SELECT 1 FROM public.quit_attempts'))return state.attempts.filter(a=>a.ended_at&&(localDay(new Date(a.ended_at),v[1])===v[2]||(new Date(a.ended_at)<=new Date(v[3])&&localDay(new Date(v[4]),v[5])===v[6]))).map(()=>({one:1}));
 if(q.startsWith('INSERT INTO public.quit_checkins')){if(!state.checkins.some(c=>c.local_day===v[2]))state.checkins.push({id:'c'+(++seq),attempt_id:v[1],local_day:v[2]});return[]}
 if(q.startsWith('SELECT max(ended_at)'))return[{ended_at:state.attempts.filter(a=>a.ended_at).map(a=>a.ended_at).sort().at(-1)}];
 if(q.startsWith('SELECT 1 FROM public.quit_checkins'))return state.checkins.filter(c=>c.attempt_id===v[0]);
 if(q.startsWith('UPDATE public.quit_attempts SET started_at')){state.attempts.find(a=>a.id===v[1]).started_at=v[0];return[]}
 throw Error('Unhandled mock SQL: '+q)
}
query.begin=async fn=>{const before=structuredClone(state);try{return await fn(query)}catch(e){state=before;throw e}};
const route=load('app/api/respira/journey/route.ts',{'postgres':()=>query,'@/lib/respira-journey':helpers,'@supabase/supabase-js':{createClient:()=>({auth:{getUser:async token=>token==='valid'?{data:{user:{id:UID}},error:null}:{data:{user:null},error:{}}}})}});
const req=(action,extra={},token='valid',origin='https://www.obicha.com.br')=>new NextRequest('https://www.obicha.com.br/api/respira/journey',{method:'POST',headers:{origin,authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({action,timeZone:'America/Sao_Paulo',...extra})});
(async()=>{reset();eq((await route.POST(req('checkin',{},'bad'))).status,401);eq((await route.POST(req('checkin',{},'valid','https://evil.example'))).status,403);eq((await route.POST(req('checkin',{timeZone:'not/a/zone'}))).status,400);eq((await route.POST(req('pause',{occurredAt:new Date(Date.now()+86400000).toISOString()}))).status,422);eq(state.attempts.length,0);
 eq((await route.GET(new NextRequest('https://www.obicha.com.br/api/respira/journey',{headers:{authorization:'Bearer valid'}}))).status,200);eq(state.attempts.length,1);
 eq((await route.POST(req('checkin'))).status,200);eq((await route.POST(req('checkin'))).status,200);eq(state.checkins.length,1,'Duplicate check-ins are idempotent');
 eq((await route.POST(req('set_start',{occurredAt:new Date(Date.now()-86400000).toISOString()}))).status,422,'Do not rewrite an attempt with confirmations');
 eq((await route.POST(req('undo'))).status,200);eq(state.checkins.length,0);eq((await route.POST(req('checkin'))).status,200);
 const returned=new Date(Date.now()-10*86400000).toISOString();eq((await route.POST(req('pause',{occurredAt:returned}))).status,200);eq(state.profile.paused_at,returned);eq(state.checkins.length,0,'Remove contradictory confirmations after backdated return');const frozen=attemptStats(state.attempts[0]).days;eq(frozen,30);eq((await route.POST(req('checkin'))).status,422);
 eq((await route.POST(req('restart'))).status,200);eq(state.profile.paused_at,null);eq(state.attempts.length,2);eq(attemptStats(state.attempts[0]).days,30);eq(attemptStats(state.attempts[1]).days,0);eq((await route.POST(req('restart'))).status,200);eq(state.attempts.length,2,'Duplicate restart does not erase history');
 eq((await route.POST(req('set_start',{occurredAt:new Date(Date.now()-11*86400000).toISOString()}))).status,422,'Attempts cannot overlap');
 eq((await route.POST(req('checkin'))).status,422);eq(state.checkins.length,0);eq(state.attempts[0].ended_at,returned);state.attempts[1].started_at=new Date(Date.now()-86400000).toISOString();state.profile.quit_at=state.attempts[1].started_at;eq((await route.POST(req('checkin'))).status,200);eq(state.checkins.length,1);
 reset();await route.POST(req('pause',{occurredAt:new Date().toISOString()}));await route.POST(req('restart'));eq((await route.POST(req('checkin'))).status,422,'Do not confirm a smoke-free day already reported as smoking');
 reset();state.profile.quit_at=new Date().toISOString();eq((await route.POST(req('pause',{occurredAt:new Date(new Date().setHours(0,0,0,0)).toISOString(),timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone}))).status,200,'Same-day return clamps to attempt start');
 console.log(checks+' journey checks passed without production writes.');})().catch(e=>{console.error(e);process.exitCode=1});
