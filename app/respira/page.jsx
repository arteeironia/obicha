"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  WELCOME_TEXT,
  HEALTH_MILESTONES,
  EMOTIONAL_MILESTONES,
  MISSIONS_POOL,
  MOOD_OPTIONS,
  SELFESTEEM_OPTIONS,
  MOVEMENT_ACTIVITIES,
  MOVEMENT_DURATIONS,
  TRIGGER_OPTIONS,
  SUBSTITUTE_OPTIONS,
  SOS_TECHNIQUES,
  REWARD_THRESHOLDS,
  LEARN_CARDS,
  RELAPSE_CAUSES,
  FORUM_REACTIONS,
  getCoachMessage,
  getMissionsForDay,
  containsBlockedTerm,
  formatMinutesAsLifeTime,
} from "@/lib/respira-content";

const C = { cream: "#F5EFE4", navy: "#101B2D", navySoft: "#1B2A42", red: "#C63B32", gold: "#D4A843", line: "#2A3B57" };
const bebas = { fontFamily: "var(--font-bebas)" };
const playfair = { fontFamily: "var(--font-playfair)" };

function dayKey(d = new Date()) { return d.toISOString().slice(0, 10); }

async function shareText(text) {
  if (navigator.share) {
    try { await navigator.share({ text }); return; } catch (e) { /* usuário cancelou */ return; }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}
function weekKey(d = new Date()) {
  const dt = new Date(d);
  const day = dt.getDay();
  dt.setDate(dt.getDate() - day);
  return dayKey(dt);
}

export default function RespiraPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(undefined);
  const [plans, setPlans] = useState([]);
  const [cravings, setCravings] = useState([]);
  const [dailyState, setDailyState] = useState(null);
  const [milestonesMarked, setMilestonesMarked] = useState([]);
  const [movementLogs, setMovementLogs] = useState([]);
  const [selfesteemChecks, setSelfesteemChecks] = useState([]);
  const [relapses, setRelapses] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [sosOpen, setSosOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [relapseOpen, setRelapseOpen] = useState(false);
  const [tab, setTab] = useState("hoje");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function loadAll(uid) {
    const { data: p } = await supabase.from("quit_profiles").select("*").eq("user_id", uid).maybeSingle();
    setProfile(p ?? null);
    const { data: pl } = await supabase.from("quit_emergency_plans").select("*").eq("user_id", uid).order("created_at");
    setPlans(pl ?? []);
    const { data: c } = await supabase.from("quit_cravings").select("*").eq("user_id", uid);
    setCravings(c ?? []);
    const { data: ds } = await supabase.from("quit_daily_state").select("*").eq("user_id", uid).eq("day_key", dayKey()).maybeSingle();
    setDailyState(ds ?? null);
    const { data: ms } = await supabase.from("quit_milestones_marked").select("*").eq("user_id", uid);
    setMilestonesMarked(ms ?? []);
    const { data: mv } = await supabase.from("quit_movement_logs").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(20);
    setMovementLogs(mv ?? []);
    const { data: se } = await supabase.from("quit_selfesteem_checks").select("*").eq("user_id", uid).order("week_key");
    setSelfesteemChecks(se ?? []);
    const { data: rl } = await supabase.from("quit_relapses").select("*").eq("user_id", uid).order("created_at", { ascending: false });
    setRelapses(rl ?? []);
  }

  useEffect(() => {
    if (!session) return;
    loadAll(session.user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, supabase]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (session === undefined || (session && profile === undefined)) {
    return (
      <div style={{ background: C.navy }} className="min-h-screen flex items-center justify-center">
        <span style={{ ...bebas, color: C.cream, letterSpacing: 2 }} className="text-2xl">carregando…</span>
      </div>
    );
  }

  if (!session) return <LoginScreen supabase={supabase} />;
  if (!profile) {
    return (
      <Onboarding
        supabase={supabase}
        session={session}
        onDone={(p, createdPlans) => {
          setProfile(p);
          setPlans(createdPlans || []);
          setWelcomeOpen(true);
        }}
      />
    );
  }

  const quitAt = new Date(profile.quit_at).getTime();
  const isFuture = quitAt > now;
  const elapsedMin = Math.max(0, (now - quitAt) / 60000);
  const dayNumber = Math.floor(elapsedMin / 1440);
  const cravingsSurvived = cravings.filter((c) => c.survived).length;
  const cigsAvoided = isFuture ? 0 : (elapsedMin / 1440) * profile.cigs_per_day;
  const moneySaved = isFuture ? 0 : (cigsAvoided / profile.cigs_per_pack) * profile.price_per_pack;
  const co2Grams = cigsAvoided * 14;
  const lifeMinutes = cigsAvoided * 11;

  const longestStreakDays = Math.max(dayNumber, ...relapses.filter((r) => r.action === "restart").map((r) => r.days_reached || 0), 0);
  const hardDaysCount = 0; // calculado dentro do PanelTab a partir do histórico de humor, se necessário no futuro

  return (
    <div style={{ background: C.navy, color: C.cream }} className="min-h-screen">
      <SiteHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} onSignOut={() => supabase.auth.signOut()} />

      <div className="max-w-md mx-auto px-5 pb-32 pt-6">
        {isFuture ? (
          <>
            <CountdownView quitAt={quitAt} now={now} />
            <EmphasisDisclaimer />
          </>
        ) : (
          <>
            <div className="flex gap-1 mb-6" style={{ borderBottom: `1px solid ${C.line}` }}>
              {[["hoje", "Hoje"], ["painel", "Painel"], ["aprenda", "Aprenda"], ["comunidade", "Comunidade"], ["config", "Config"]].map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)}
                  style={{ ...bebas, letterSpacing: 0.5, color: tab === key ? C.red : C.cream, opacity: tab === key ? 1 : 0.5, borderBottom: tab === key ? `2px solid ${C.red}` : "2px solid transparent" }}
                  className="flex-1 text-xs pb-2.5 pt-1">
                  {label}
                </button>
              ))}
            </div>

            {tab === "hoje" && (
              <TodayTab
                profile={profile}
                dayNumber={dayNumber}
                elapsedMin={elapsedMin}
                cigsAvoided={cigsAvoided}
                moneySaved={moneySaved}
                cravingsSurvived={cravingsSurvived}
                dailyState={dailyState}
                onToggleMission={async (mission) => {
                  const done = dailyState?.missions_done || [];
                  const next = done.includes(mission) ? done.filter((m) => m !== mission) : [...done, mission];
                  const { data } = await supabase.from("quit_daily_state")
                    .upsert({ user_id: session.user.id, day_key: dayKey(), missions_done: next, mood: dailyState?.mood, diary_text: dailyState?.diary_text }, { onConflict: "user_id,day_key" })
                    .select().single();
                  setDailyState(data);
                }}
                onSetMood={async (mood) => {
                  const { data } = await supabase.from("quit_daily_state")
                    .upsert({ user_id: session.user.id, day_key: dayKey(), mood, missions_done: dailyState?.missions_done || [], diary_text: dailyState?.diary_text }, { onConflict: "user_id,day_key" })
                    .select().single();
                  setDailyState(data);
                }}
                onSaveDiary={async (text) => {
                  const { data } = await supabase.from("quit_daily_state")
                    .upsert({ user_id: session.user.id, day_key: dayKey(), diary_text: text, missions_done: dailyState?.missions_done || [], mood: dailyState?.mood }, { onConflict: "user_id,day_key" })
                    .select().single();
                  setDailyState(data);
                }}
              />
            )}

            {tab === "painel" && (
              <PanelTab
                profile={profile}
                session={session}
                supabase={supabase}
                elapsedMin={elapsedMin}
                dayNumber={dayNumber}
                cigsAvoided={cigsAvoided}
                moneySaved={moneySaved}
                co2Grams={co2Grams}
                lifeMinutes={lifeMinutes}
                cravingsSurvived={cravingsSurvived}
                cravings={cravings}
                longestStreakDays={longestStreakDays}
                plans={plans}
                milestonesMarked={milestonesMarked}
                movementLogs={movementLogs}
                selfesteemChecks={selfesteemChecks}
                onToggleMilestone={async (key) => {
                  const has = milestonesMarked.some((m) => m.milestone_key === key);
                  if (has) {
                    await supabase.from("quit_milestones_marked").delete().eq("user_id", session.user.id).eq("milestone_key", key);
                    setMilestonesMarked((cur) => cur.filter((m) => m.milestone_key !== key));
                  } else {
                    const { data } = await supabase.from("quit_milestones_marked").insert({ user_id: session.user.id, milestone_key: key }).select().single();
                    setMilestonesMarked((cur) => [...cur, data]);
                  }
                }}
                onAddPlan={async (trigger_tag, substitute) => {
                  const { data } = await supabase.from("quit_emergency_plans").insert({ user_id: session.user.id, trigger_tag, substitute }).select().single();
                  setPlans((cur) => [...cur, data]);
                }}
                onRemovePlan={async (id) => {
                  await supabase.from("quit_emergency_plans").delete().eq("id", id);
                  setPlans((cur) => cur.filter((p) => p.id !== id));
                }}
                onLogMovement={async (activity, minutes) => {
                  const { data } = await supabase.from("quit_movement_logs").insert({ user_id: session.user.id, activity, minutes }).select().single();
                  setMovementLogs((cur) => [data, ...cur]);
                }}
                onSelfesteemCheck={async (rating) => {
                  const { data } = await supabase.from("quit_selfesteem_checks")
                    .upsert({ user_id: session.user.id, week_key: weekKey(), rating }, { onConflict: "user_id,week_key" })
                    .select().single();
                  setSelfesteemChecks((cur) => [...cur.filter((c) => c.week_key !== data.week_key), data]);
                }}
                onOpenRelapse={() => setRelapseOpen(true)}
              />
            )}

            {tab === "aprenda" && <AprendaTab />}

            {tab === "comunidade" && <CommunityTab supabase={supabase} session={session} profile={profile} />}

            {tab === "config" && (
              <ConfigTab
                profile={profile}
                onSave={async (fields) => {
                  await supabase.from("quit_profiles").update(fields).eq("user_id", session.user.id);
                  setProfile((p) => ({ ...p, ...fields }));
                }}
                onRereadWelcome={() => setWelcomeOpen(true)}
                onSignOut={() => supabase.auth.signOut()}
              />
            )}

            <EmphasisDisclaimer />
          </>
        )}
      </div>

      {!isFuture && (
        <button onClick={() => setSosOpen(true)} style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-7 py-3.5 rounded-full shadow-lg shadow-black/40 text-lg active:scale-95 transition-transform">
          BATEU A VONTADE
        </button>
      )}

      {sosOpen && (
        <SOSModal
          why={profile.why_text}
          stats={{ days: dayNumber, moneySaved, cigsAvoided, cravingsSurvived }}
          onSurvived={async (intensity, technique) => {
            const { data } = await supabase.from("quit_cravings").insert({ user_id: session.user.id, intensity, technique: technique || null, survived: true }).select().single();
            setCravings((c) => [...c, data]);
            setSosOpen(false);
          }}
          onClose={() => setSosOpen(false)}
        />
      )}

      {welcomeOpen && <WelcomeModal onClose={() => setWelcomeOpen(false)} />}

      {relapseOpen && (
        <RelapseModal
          onClose={() => setRelapseOpen(false)}
          onChoose={async (cause, note, action) => {
            const days_reached = Math.floor(elapsedMin / 1440);
            await supabase.from("quit_relapses").insert({ user_id: session.user.id, trigger_tag: cause, note: note || null, action, days_reached });
            setRelapses((cur) => [{ trigger_tag: cause, note, action, days_reached, created_at: new Date().toISOString() }, ...cur]);
            if (action === "restart") {
              const newQuitAt = new Date().toISOString();
              await supabase.from("quit_profiles").update({ quit_at: newQuitAt }).eq("user_id", session.user.id);
              setProfile((p) => ({ ...p, quit_at: newQuitAt }));
            }
            setRelapseOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ---------- Header ----------
function SiteHeader({ menuOpen, setMenuOpen, onSignOut }) {
  const navItems = [
    { label: "Manifesto", href: "https://www.obicha.com.br/#manifesto" },
    { label: "Produtos", href: "https://www.obicha.com.br/#produtos" },
    { label: "Blog", href: "https://www.obicha.com.br/blog" },
    { label: "Respira", href: "/respira", active: true },
    { label: "Projeto Social", href: "https://www.obicha.com.br/projeto-social" },
  ];
  return (
    <header style={{ borderBottom: `1px solid ${C.line}` }} className="sticky top-0 z-40">
      <div style={{ background: C.navy }} className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
        <a href="https://www.obicha.com.br" style={{ ...bebas, color: C.cream }} className="text-xl tracking-wide">Ô BICHA<span style={{ color: C.red }}>!</span></a>
        <div className="flex items-center gap-4">
          <button onClick={onSignOut} style={{ color: C.cream, opacity: 0.5 }} className="text-[11px] underline">sair</button>
          <button onClick={() => setMenuOpen(true)} style={{ color: C.cream }} aria-label="menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <div style={{ background: C.navySoft }} className="relative w-72 h-full px-6 py-6 flex flex-col">
            <button onClick={() => setMenuOpen(false)} style={{ color: C.cream }} className="self-end mb-8">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
            <nav className="flex flex-col gap-5">
              {navItems.map((item) => (
                <a key={item.label} href={item.href} style={{ ...bebas, color: item.active ? C.red : C.cream, letterSpacing: 1 }} className="text-2xl">{item.label}</a>
              ))}
            </nav>
            <div className="mt-auto">
              <button onClick={onSignOut} style={{ color: C.cream, opacity: 0.6 }} className="text-sm underline">sair da conta</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function CountdownView({ quitAt, now }) {
  const remainMin = Math.max(0, (quitAt - now) / 60000);
  const days = Math.floor(remainMin / 1440);
  const hours = Math.floor((remainMin % 1440) / 60);
  const mins = Math.floor(remainMin % 60);
  return (
    <div className="text-center mb-6">
      <p style={{ ...bebas, fontSize: "4rem", lineHeight: 0.9, color: C.cream }}>{days}</p>
      <p style={{ ...playfair }} className="italic text-sm opacity-80">dia{days !== 1 ? "s" : ""} até sua data de parar</p>
      <p className="text-xs opacity-60 mt-1 font-mono mb-6">{String(hours).padStart(2, "0")}h {String(mins).padStart(2, "0")}m</p>
      <div style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-2xl p-4 text-left">
        <p style={{ ...bebas, letterSpacing: 1, color: C.gold }} className="text-xs mb-2">ENQUANTO ISSO...</p>
        <p className="text-sm opacity-80 leading-relaxed">
          Já dá pra treinar: tenta atrasar o primeiro cigarro do dia em 15 minutos. O primeiro é o que mais reativa a dependência — atrasar ele já prepara seu corpo pra parada.
        </p>
      </div>
    </div>
  );
}

// ---------- Hoje ----------
function TodayTab({ profile, dayNumber, elapsedMin, cigsAvoided, moneySaved, cravingsSurvived, dailyState, onToggleMission, onSetMood, onSaveDiary }) {
  const coach = getCoachMessage(dayNumber);
  const missions = getMissionsForDay(dayNumber);
  const done = dailyState?.missions_done || [];
  const nextMilestone = HEALTH_MILESTONES.find((m) => m.mins > elapsedMin);
  const days = Math.floor(elapsedMin / 1440);
  const [diaryDraft, setDiaryDraft] = useState(dailyState?.diary_text || "");
  useEffect(() => setDiaryDraft(dailyState?.diary_text || ""), [dailyState?.diary_text]);

  const firstName = (profile.display_name || "").split(" ")[0];

  return (
    <div>
      <div className="text-center mb-4">
        <p className="text-sm opacity-70 mb-1">{firstName ? `Oi, ${firstName}` : "Oi"} 👋</p>
        <p style={{ ...bebas, fontSize: "4.5rem", lineHeight: 0.9, color: C.cream }}>{days}</p>
        <p style={{ ...playfair }} className="italic text-sm opacity-80">dia{days !== 1 ? "s" : ""} sem fumar</p>
      </div>

      {nextMilestone && (
        <p className="text-center text-xs opacity-70 mb-4">próxima marca: <span style={{ color: C.red }}>{nextMilestone.label}</span></p>
      )}

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Stat label="cigarros evitados" value={Math.floor(cigsAvoided)} />
        <Stat label="economizado" value={`R$ ${moneySaved.toFixed(0)}`} />
        <Stat label="tempo de vida" value={formatMinutesAsLifeTime(cigsAvoided * 11)} />
        <Stat label="fissuras vencidas" value={cravingsSurvived} />
      </div>

      <div style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-2xl p-4 mb-4">
        <p style={{ ...bebas, letterSpacing: 1, color: C.red }} className="text-xs mb-2">MENSAGEM DO DIA</p>
        <p style={{ ...playfair }} className="italic text-sm leading-relaxed">{coach.msg}</p>
        {coach.tip && <p className="text-xs opacity-70 mt-2">💡 {coach.tip}</p>}
      </div>

      <div style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-2xl p-4 mb-4">
        <p style={{ ...bebas, letterSpacing: 1 }} className="text-xs opacity-70 mb-3">MISSÃO DO DIA</p>
        <div className="space-y-2">
          {missions.map((m) => (
            <button key={m} onClick={() => onToggleMission(m)} className="w-full flex items-center gap-2 text-left">
              <span style={{ color: done.includes(m) ? C.red : undefined }} className={done.includes(m) ? "" : "opacity-30"}>{done.includes(m) ? "✓" : "○"}</span>
              <span className={`text-sm ${done.includes(m) ? "line-through opacity-50" : ""}`}>{m}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-2xl p-4">
        <p style={{ ...bebas, letterSpacing: 1 }} className="text-xs opacity-70 mb-3">HOJE FOI...</p>
        <div className="flex justify-between mb-3">
          {MOOD_OPTIONS.map((m) => (
            <button key={m.key} onClick={() => onSetMood(m.key)} className="flex flex-col items-center gap-1">
              <span style={{ fontSize: "1.6rem", opacity: dailyState?.mood === m.key ? 1 : 0.4 }}>{m.icon}</span>
              <span className="text-[10px] opacity-60">{m.label}</span>
            </button>
          ))}
        </div>
        <textarea value={diaryDraft} onChange={(e) => setDiaryDraft(e.target.value)} onBlur={() => onSaveDiary(diaryDraft)}
          placeholder="quer registrar algo sobre hoje?" rows={2}
          style={{ background: "transparent", color: C.cream, borderColor: C.line }} className="w-full outline-none resize-none text-sm border-t pt-2 placeholder-white/40" />
      </div>
    </div>
  );
}

// ---------- Painel ----------
function PanelTab(props) {
  const {
    profile, elapsedMin, dayNumber, cigsAvoided, moneySaved, co2Grams, lifeMinutes, cravingsSurvived,
    cravings, longestStreakDays, plans, milestonesMarked, movementLogs, selfesteemChecks,
    onToggleMilestone, onAddPlan, onRemovePlan, onLogMovement, onSelfesteemCheck, onOpenRelapse,
  } = props;

  const [planTrigger, setPlanTrigger] = useState(TRIGGER_OPTIONS[0].key);
  const [planSub, setPlanSub] = useState(SUBSTITUTE_OPTIONS[0].key);
  const [movActivity, setMovActivity] = useState(MOVEMENT_ACTIVITIES[0].key);
  const [movMinutes, setMovMinutes] = useState(15);
  const [shareOpen, setShareOpen] = useState(false);

  const hourCounts = useMemo(() => {
    const counts = new Array(24).fill(0);
    cravings.forEach((c) => { counts[new Date(c.created_at).getHours()]++; });
    return counts;
  }, [cravings]);
  const maxHour = Math.max(...hourCounts, 1);
  const hasEnoughCravings = cravings.length >= 5;
  const riskiestHour = hasEnoughCravings ? hourCounts.indexOf(Math.max(...hourCounts)) : null;

  const triggerCounts = useMemo(() => {
    const map = {};
    cravings.forEach((c) => { if (c.trigger_tag) map[c.trigger_tag] = (map[c.trigger_tag] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [cravings]);

  const co2Display = co2Grams >= 1000 ? `${(co2Grams / 1000).toFixed(1)}kg` : `${Math.floor(co2Grams)}g`;

  const thisWeekRating = selfesteemChecks.find((c) => c.week_key === weekKey())?.rating;

  return (
    <div>
      <div className="mb-8">
        <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">ESTATÍSTICAS</p>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="dias" value={dayNumber} />
          <Stat label="maior sequência" value={`${longestStreakDays}d`} />
          <Stat label="cigarros evitados" value={Math.floor(cigsAvoided)} />
          <Stat label="economizado" value={`R$ ${moneySaved.toFixed(0)}`} />
          <Stat label="CO₂ não emitido*" value={co2Display} />
          <Stat label="tempo de vida" value={formatMinutesAsLifeTime(lifeMinutes)} />
          <Stat label="fissuras vencidas" value={cravingsSurvived} />
        </div>
        <p className="text-[10px] opacity-30 mt-2">*estimativa aproximada, não é uma medição real</p>
      </div>

      <div className="mb-8">
        <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">RECUPERAÇÃO DO CORPO</p>
        <div className="space-y-3">
          {HEALTH_MILESTONES.map((m, i) => (
            <div key={i} className="text-sm flex gap-2">
              <span className={elapsedMin >= m.mins ? "" : "opacity-30"}>{elapsedMin >= m.mins ? "✓" : "○"}</span>
              <span className={elapsedMin >= m.mins ? "" : "opacity-50"}>{m.icon} <b>{m.label}</b> — {m.fact}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">PEQUENAS VITÓRIAS</p>
        <div className="grid grid-cols-2 gap-2">
          {EMOTIONAL_MILESTONES.map((m) => {
            const has = milestonesMarked.some((x) => x.milestone_key === m.key);
            return (
              <button key={m.key} onClick={() => onToggleMilestone(m.key)} style={{ background: has ? `${C.red}22` : C.navySoft, border: `1px solid ${has ? C.red : C.line}` }} className="rounded-xl p-3 text-left">
                <p className="text-lg mb-1">{m.icon}</p>
                <p className={`text-xs ${has ? "" : "opacity-60"}`}>{m.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {hasEnoughCravings && (
        <div className="mb-8">
          <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">DESCUBRA SEUS PADRÕES</p>
          <p className="text-xs opacity-60 mb-2">horário mais crítico: por volta das <span style={{ color: C.red }}>{riskiestHour}h</span></p>
          <div className="flex items-end gap-0.5 h-16 mb-3">
            {hourCounts.map((c, h) => (
              <div key={h} style={{ height: `${(c / maxHour) * 100}%`, background: h === riskiestHour ? C.red : C.line, minHeight: 2 }} className="flex-1 rounded-t" />
            ))}
          </div>
          {triggerCounts.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {triggerCounts.map(([tag, count]) => {
                const t = TRIGGER_OPTIONS.find((x) => x.key === tag);
                return <span key={tag} style={{ background: C.navySoft }} className="text-xs px-2 py-1 rounded-full">{t?.icon} {t?.label} · {count}</span>;
              })}
            </div>
          )}
        </div>
      )}

      <div className="mb-8">
        <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">RECOMPENSAS</p>
        <div className="space-y-2">
          {REWARD_THRESHOLDS.map((r) => {
            const unlocked = moneySaved >= r.amount;
            return (
              <div key={r.amount} style={{ background: C.navySoft, border: `1px solid ${unlocked ? C.gold : C.line}` }} className="rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm">{r.label}</p>
                  <p className="text-xs opacity-50">R$ {r.amount}</p>
                </div>
                {unlocked ? <span style={{ color: C.gold }} className="text-lg">✓</span> : <span className="text-xs opacity-40">faltam R$ {(r.amount - moneySaved).toFixed(0)}</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">AUTOESTIMA — COMO VOCÊ SE SENTE ESSA SEMANA?</p>
        <div className="flex justify-between mb-3">
          {SELFESTEEM_OPTIONS.map((o) => (
            <button key={o.value} onClick={() => onSelfesteemCheck(o.value)} style={{ fontSize: "1.6rem", opacity: thisWeekRating === o.value ? 1 : 0.4 }}>{o.icon}</button>
          ))}
        </div>
        {selfesteemChecks.length > 1 && (
          <div className="flex items-end gap-1 h-10">
            {selfesteemChecks.slice(-12).map((c, i) => (
              <div key={i} style={{ height: `${(c.rating / 5) * 100}%`, background: C.gold }} className="flex-1 rounded-t opacity-70" />
            ))}
          </div>
        )}
      </div>

      <div className="mb-8">
        <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">MOVIMENTO</p>
        <div style={{ background: C.navySoft }} className="rounded-xl p-3.5 mb-3">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {MOVEMENT_ACTIVITIES.map((a) => (
              <button key={a.key} onClick={() => setMovActivity(a.key)} style={{ background: movActivity === a.key ? C.red : "transparent", border: `1px solid ${movActivity === a.key ? C.red : C.line}` }} className="text-xs px-2 py-1 rounded-full">
                {a.icon} {a.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 mb-3">
            {MOVEMENT_DURATIONS.map((d) => (
              <button key={d} onClick={() => setMovMinutes(d)} style={{ background: movMinutes === d ? C.red : "transparent", border: `1px solid ${movMinutes === d ? C.red : C.line}` }} className="flex-1 text-xs py-1.5 rounded-lg">
                {d}min
              </button>
            ))}
          </div>
          <button onClick={() => onLogMovement(movActivity, movMinutes)} style={{ color: C.red }} className="w-full text-sm py-1">+ registrar</button>
        </div>
        {movementLogs.length > 0 && (
          <p className="text-xs opacity-50">
            {movementLogs.length} atividade{movementLogs.length !== 1 ? "s" : ""} registrada{movementLogs.length !== 1 ? "s" : ""} — além de cuidar do corpo, isso diminui suas chances de recaída.
          </p>
        )}
      </div>

      <div className="mb-8">
        <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">PLANO DE EMERGÊNCIA</p>
        <div className="space-y-2 mb-3">
          {plans.map((p) => {
            const t = TRIGGER_OPTIONS.find((x) => x.key === p.trigger_tag);
            const s = SUBSTITUTE_OPTIONS.find((x) => x.key === p.substitute);
            return (
              <div key={p.id} style={{ background: C.navySoft }} className="rounded-xl p-3 flex justify-between items-center">
                <p className="text-sm">{t?.icon} {t?.label} → <span style={{ color: C.red }}>{s?.label}</span></p>
                <button onClick={() => onRemovePlan(p.id)} className="opacity-50">✕</button>
              </div>
            );
          })}
        </div>
        <div style={{ background: C.navySoft }} className="rounded-xl p-3 space-y-2">
          <select value={planTrigger} onChange={(e) => setPlanTrigger(e.target.value)} style={{ background: C.navy, color: C.cream }} className="w-full rounded-lg px-2 py-2 text-sm outline-none">
            {TRIGGER_OPTIONS.map((t) => <option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}
          </select>
          <select value={planSub} onChange={(e) => setPlanSub(e.target.value)} style={{ background: C.navy, color: C.cream }} className="w-full rounded-lg px-2 py-2 text-sm outline-none">
            {SUBSTITUTE_OPTIONS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <button onClick={() => onAddPlan(planTrigger, planSub)} style={{ color: C.red }} className="w-full text-sm py-1">+ adicionar</button>
        </div>
      </div>

      <button onClick={() => setShareOpen(true)} style={{ background: C.navySoft, border: `1px solid ${C.gold}`, color: C.gold, ...bebas, letterSpacing: 1 }} className="w-full rounded-full py-3 mb-8 text-sm">
        📲 COMPARTILHAR MINHA JORNADA
      </button>

      {shareOpen && (
        <ShareJourneyModal dayNumber={dayNumber} moneySaved={moneySaved} cigsAvoided={cigsAvoided} onClose={() => setShareOpen(false)} />
      )}

      <button onClick={onOpenRelapse} style={{ color: C.cream, opacity: 0.4 }} className="w-full text-xs underline py-4">
        tive um deslize / preciso registrar uma recaída
      </button>
    </div>
  );
}

function AprendaTab() {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-2">
      {LEARN_CARDS.map((c, i) => (
        <div key={i} style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-xl p-3.5">
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left flex justify-between items-center">
            <span className="text-sm">{c.title}</span>
            <span className="opacity-50">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <p className="text-sm opacity-70 mt-2 leading-relaxed">{c.text}</p>}
        </div>
      ))}
    </div>
  );
}

function ShareJourneyModal({ dayNumber, moneySaved, cigsAvoided, onClose }) {
  const canvasRef = useRef(null);
  const [generating, setGenerating] = useState(false);
  const shareMsg = `Decidi parar de fumar 🚭\nDia ${dayNumber} sem cigarro\nobicha.com.br/respira`;
  const encoded = encodeURIComponent(shareMsg);

  async function generateImage() {
    setGenerating(true);
    const canvas = canvasRef.current;
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#101B2D";
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.fillStyle = "#D4A843";
    ctx.fillRect(0, 0, 1080, 6);
    ctx.fillRect(0, 1914, 1080, 6);

    ctx.textAlign = "center";
    ctx.font = "bold 80px serif";
    ctx.fillStyle = "#D4A843";
    ctx.fillText("Ô", 400, 260);
    ctx.fillStyle = "#C63B32";
    ctx.fillText("bicha", 600, 260);
    ctx.fillStyle = "#D4A843";
    ctx.fillText("! Respira", 850, 260);

    ctx.font = "30px monospace";
    ctx.fillStyle = "rgba(212,168,67,0.6)";
    ctx.fillText("OBICHA.COM.BR/RESPIRA", 540, 320);

    ctx.font = "bold 46px serif";
    ctx.fillStyle = "#F5EFE4";
    ctx.fillText("Decidi parar de fumar 🚭", 540, 620);

    ctx.font = "bold 280px sans-serif";
    ctx.fillStyle = "#F5EFE4";
    ctx.fillText(String(dayNumber), 540, 900);

    ctx.font = "48px serif";
    ctx.fillText(`dia${dayNumber !== 1 ? "s" : ""} sem cigarro`, 540, 980);

    ctx.font = "bold 40px monospace";
    ctx.fillStyle = "#C63B32";
    ctx.fillText(`R$ ${moneySaved.toFixed(0)} economizados`, 540, 1160);
    ctx.fillStyle = "#F5EFE4";
    ctx.fillText(`${Math.floor(cigsAvoided)} cigarros evitados`, 540, 1230);

    ctx.font = "italic 36px serif";
    ctx.fillStyle = "rgba(245,239,228,0.7)";
    ctx.fillText("um companheiro de jornada, não uma promessa de cura", 540, 1780);

    canvas.toBlob(async (blob) => {
      const file = new File([blob], "respira.png", { type: "image/png" });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: "Respira — Ô bicha!" }); setGenerating(false); return; } catch (e) { /* cancelou */ }
      }
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const dataUrl = canvas.toDataURL("image/png");
      if (isMobile) {
        // no celular, abre em nova aba — dá pra segurar e "Salvar imagem" direto na galeria
        window.open(dataUrl, "_blank");
      } else {
        const link = document.createElement("a");
        link.download = "respira.png";
        link.href = dataUrl;
        link.click();
      }
      setGenerating(false);
    });
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div style={{ background: C.navy, border: `1px solid ${C.line}` }} className="rounded-3xl p-6 max-w-sm w-full">
        <p style={{ ...bebas, letterSpacing: 1, color: C.gold }} className="text-sm mb-4">COMPARTILHAR NAS REDES</p>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <a href={`https://www.threads.net/intent/post?text=${encoded}`} target="_blank" style={{ background: C.navySoft }} className="rounded-xl py-3 text-center text-xs">Threads</a>
          <a href={`https://twitter.com/intent/tweet?text=${encoded}`} target="_blank" style={{ background: C.navySoft }} className="rounded-xl py-3 text-center text-xs">X</a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://obicha.com.br/respira")}&quote=${encoded}`} target="_blank" style={{ background: C.navySoft }} className="rounded-xl py-3 text-center text-xs">Facebook</a>
          <a href={`https://wa.me/?text=${encoded}`} target="_blank" style={{ background: C.navySoft }} className="rounded-xl py-3 text-center text-xs">WhatsApp</a>
        </div>

        <p className="text-xs opacity-60 mb-3 leading-relaxed">
          Baixe sua imagem para compartilhar nas redes sociais. No celular, ela abre pra você salvar direto nas suas fotos; no computador, baixa na pasta de downloads.
        </p>

        <button onClick={generateImage} disabled={generating} style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1, opacity: generating ? 0.6 : 1 }} className="w-full rounded-full py-3 mb-2">
          {generating ? "GERANDO..." : "📥 BAIXAR MINHA IMAGEM"}
        </button>
        <button onClick={onClose} style={{ color: C.cream, opacity: 0.5 }} className="w-full text-sm py-2">fechar</button>
      </div>
    </div>
  );
}

function CommunityTab({ supabase, session, profile }) {
  const [posts, setPosts] = useState(null);
  const [reactions, setReactions] = useState({});
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    const { data: p } = await supabase.from("quit_forum_posts").select("*").order("created_at", { ascending: false }).limit(100);
    setPosts(p ?? []);
    if (p && p.length) {
      const { data: r } = await supabase.from("quit_forum_reactions").select("*").in("post_id", p.map((x) => x.id));
      const map = {};
      (r ?? []).forEach((row) => {
        map[row.post_id] = map[row.post_id] || {};
        map[row.post_id][row.reaction] = (map[row.post_id][row.reaction] || 0) + 1;
        if (row.user_id === session.user.id) map[row.post_id]._mine = row.reaction;
      });
      setReactions(map);
    }
  }

  async function submitPost() {
    setError("");
    if (!content.trim()) return;
    if (containsBlockedTerm(content)) { setError("Seu post contém um termo não permitido. Ajuste o texto."); return; }
    const recentCount = (posts || []).filter((p) => p.user_id === session.user.id && Date.now() - new Date(p.created_at).getTime() < 3600000).length;
    if (recentCount >= 3) { setError("Limite de posts por hora atingido. Tenta de novo daqui a pouco."); return; }
    setPosting(true);
    const { data, error: err } = await supabase.from("quit_forum_posts").insert({
      user_id: session.user.id,
      display_name: profile.display_name || session.user.user_metadata?.full_name || "Alguém da comunidade",
      photo_url: session.user.user_metadata?.avatar_url || null,
      content: content.trim(),
    }).select().single();
    setPosting(false);
    if (err) { setError("Não foi possível publicar. Tenta de novo."); return; }
    setPosts((cur) => [data, ...(cur || [])]);
    setContent("");
  }

  async function react(postId, reactionKey) {
    const mine = reactions[postId]?._mine;
    if (mine === reactionKey) {
      await supabase.from("quit_forum_reactions").delete().eq("post_id", postId).eq("user_id", session.user.id);
    } else {
      await supabase.from("quit_forum_reactions").upsert({ post_id: postId, user_id: session.user.id, reaction: reactionKey }, { onConflict: "post_id,user_id" });
    }
    load();
  }

  async function report(postId) { await supabase.from("quit_forum_reports").insert({ post_id: postId, user_id: session.user.id }); }
  async function removePost(postId) { await supabase.from("quit_forum_posts").delete().eq("id", postId); setPosts((cur) => cur.filter((p) => p.id !== postId)); }

  return (
    <div>
      <div style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-2xl p-4 mb-4">
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={2} placeholder="Compartilha algo sobre o seu processo..."
          style={{ background: "transparent", color: C.cream, borderColor: C.line }} className="w-full outline-none resize-none text-sm border-b pb-2 placeholder-white/40" />
        {error && <p className="text-xs mt-2" style={{ color: C.red }}>{error}</p>}
        <button onClick={submitPost} disabled={posting || !content.trim()} style={{ color: C.red, opacity: posting || !content.trim() ? 0.4 : 1 }} className="text-sm mt-2">publicar</button>
      </div>

      {posts === null ? (
        <p className="text-sm opacity-50 text-center py-8">carregando…</p>
      ) : posts.length === 0 ? (
        <p className="text-sm opacity-50 text-center py-8">ninguém postou ainda — seja a primeira pessoa</p>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => {
            const canDelete = p.user_id === session.user.id || profile.is_admin;
            return (
              <div key={p.id} style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {p.photo_url && <img src={p.photo_url} alt="" className="w-6 h-6 rounded-full" />}
                    <span className="text-xs opacity-70">{p.display_name}</span>
                  </div>
                  {canDelete && <button onClick={() => removePost(p.id)} className="text-xs opacity-40">excluir</button>}
                </div>
                <p className="text-sm mb-3">{p.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {FORUM_REACTIONS.map((r) => {
                      const count = reactions[p.id]?.[r.key] || 0;
                      const mine = reactions[p.id]?._mine === r.key;
                      return (
                        <button key={r.key} onClick={() => react(p.id, r.key)} style={{ opacity: mine ? 1 : 0.5, background: mine ? `${C.red}22` : "transparent" }} className="text-xs px-1.5 py-0.5 rounded-full">
                          {r.icon}{count > 0 ? ` ${count}` : ""}
                        </button>
                      );
                    })}
                  </div>
                  {!canDelete && <button onClick={() => report(p.id)} className="text-xs opacity-30">denunciar</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ConfigTab({ profile, onSave, onRereadWelcome, onSignOut }) {
  const [cigsPerDay, setCigsPerDay] = useState(profile.cigs_per_day);
  const [pricePerPack, setPricePerPack] = useState(profile.price_per_pack);
  const [cigsPerPack, setCigsPerPack] = useState(profile.cigs_per_pack);
  const [why, setWhy] = useState(profile.why_text || "");

  return (
    <div>
      {[["cigarros por dia", cigsPerDay, setCigsPerDay], ["preço do maço (R$)", pricePerPack, setPricePerPack], ["cigarros por maço", cigsPerPack, setCigsPerPack]].map(([label, val, set]) => (
        <label key={label} className="block mb-4">
          <span className="text-xs opacity-70">{label}</span>
          <input type="number" value={val} onChange={(e) => set(Number(e.target.value))} style={{ background: C.navySoft, color: C.cream }} className="w-full rounded-xl px-3 py-2.5 mt-1 outline-none font-mono" />
        </label>
      ))}
      <label className="block mb-4">
        <span className="text-xs opacity-70">meu porquê</span>
        <textarea value={why} onChange={(e) => setWhy(e.target.value)} rows={3} style={{ background: C.navySoft, color: C.cream }} className="w-full rounded-xl px-3 py-2.5 mt-1 outline-none resize-none" />
      </label>
      <button onClick={() => onSave({ cigs_per_day: cigsPerDay, price_per_pack: pricePerPack, cigs_per_pack: cigsPerPack, why_text: why })}
        style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }} className="w-full rounded-full py-3 mb-6">SALVAR</button>

      <button onClick={onRereadWelcome} style={{ color: C.gold }} className="w-full text-sm py-2 mb-2 underline">reler minha decisão de parar</button>
      <button onClick={onSignOut} style={{ color: C.cream, opacity: 0.5 }} className="w-full text-sm py-2 mb-8 underline">sair da conta</button>

      <p className="text-[11px] opacity-30 text-center mb-2">v2 · Ô bicha!</p>
    </div>
  );
}

function EmphasisDisclaimer() {
  return (
    <div style={{ background: `${C.red}15`, border: `1.5px solid ${C.red}` }} className="rounded-2xl p-4 my-6">
      <p style={{ ...bebas, letterSpacing: 1, color: C.red }} className="text-sm mb-2">⚕ APOIO PROFISSIONAL</p>
      <p className="text-xs leading-relaxed opacity-90 mb-2">
        Este aplicativo tem caráter educativo e de apoio. Ele <b>não substitui</b> acompanhamento médico, psicológico ou tratamento para dependência de nicotina. O Respira é um companheiro de jornada, não uma promessa de cura.
      </p>
      <p className="text-xs leading-relaxed opacity-90">
        Se sentir que está difícil demais, procure orientação profissional. O SUS oferece programas gratuitos para parar de fumar —{" "}
        <a href="tel:136" style={{ color: C.red, fontWeight: 700 }}>Disque Saúde: 136</a>.
      </p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ background: C.navySoft }} className="rounded-2xl p-4">
      <p className="text-[11px] opacity-60">{label}</p>
      <p style={{ ...bebas }} className="text-2xl mt-0.5">{value}</p>
    </div>
  );
}

// ---------- SOS por intensidade ----------
function SOSModal({ why, stats, onSurvived, onClose }) {
  const [intensity, setIntensity] = useState(null);
  const [active, setActive] = useState(null);
  const [breathPhase, setBreathPhase] = useState(0);
  const [timerDone, setTimerDone] = useState(false);
  const [afterAnswer, setAfterAnswer] = useState(null);

  useEffect(() => {
    if (!intensity || intensity === "forte") return;
    setTimerDone(false);
    const seconds = intensity === "leve" ? 180 : 120;
    const id = setTimeout(() => setTimerDone(true), seconds * 1000);
    return () => clearTimeout(id);
  }, [intensity]);

  useEffect(() => {
    if (active !== "respirar") return;
    const id = setInterval(() => setBreathPhase((p) => (p + 1) % 19), 1000);
    return () => clearInterval(id);
  }, [active]);

  // Passo 1: escolher intensidade
  if (!intensity) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
        <div style={{ background: C.navy, border: `1px solid ${C.line}` }} className="rounded-3xl p-6 max-w-sm w-full text-center">
          <p style={{ color: C.cream, ...bebas, letterSpacing: 1 }} className="text-lg mb-2">ESTOU COM VONTADE DE FUMAR</p>
          <p style={{ ...playfair }} className="italic text-sm opacity-80 mb-6">Quanto está difícil?</p>
          <div className="space-y-2">
            <button onClick={() => setIntensity("leve")} style={{ background: C.navySoft }} className="w-full rounded-xl py-3.5 text-sm">😐 Leve</button>
            <button onClick={() => setIntensity("media")} style={{ background: C.navySoft }} className="w-full rounded-xl py-3.5 text-sm">😣 Média</button>
            <button onClick={() => setIntensity("forte")} style={{ background: C.navySoft }} className="w-full rounded-xl py-3.5 text-sm">😭 Muito forte</button>
          </div>
          <button onClick={() => shareText("Estou na fissura de cigarro, me ajuda? Vamos conversar..")} style={{ color: C.gold }} className="w-full text-xs underline py-3 mt-1">
            📱 pedir ajuda a alguém agora
          </button>
          <button onClick={onClose} style={{ color: C.cream, opacity: 0.5 }} className="w-full text-sm py-1">fechar</button>
        </div>
      </div>
    );
  }

  // Leve/média: timer + pergunta ao final
  if ((intensity === "leve" || intensity === "media") && !afterAnswer) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
        <div style={{ background: C.navy, border: `1px solid ${C.line}` }} className="rounded-3xl p-6 max-w-sm w-full text-center">
          <p style={{ ...playfair }} className="italic text-sm opacity-90 mb-6">
            {intensity === "leve" ? "Aguenta só 3 minutos comigo." : "Vamos tentar algo rápido antes de decidir."}
          </p>
          <div className="flex items-center justify-center h-32 mb-6">
            <div style={{ width: 90, height: 90, borderRadius: "9999px", background: `${C.red}33`, border: `2px solid ${C.red}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: C.cream, ...bebas }} className="text-xs">{timerDone ? "pronto" : "respira"}</span>
            </div>
          </div>
          {!timerDone ? (
            <p className="text-xs opacity-50">essa fissura tá passando…</p>
          ) : (
            <>
              <p className="text-sm mb-4">Ainda quer fumar?</p>
              <div className="flex gap-2">
                <button onClick={() => setAfterAnswer("melhorou")} style={{ background: C.navySoft }} className="flex-1 rounded-xl py-3 text-sm">🙂 Melhorou</button>
                <button onClick={() => { setIntensity("forte"); setAfterAnswer(null); setTimerDone(false); }} style={{ background: C.navySoft }} className="flex-1 rounded-xl py-3 text-sm">😕 Ainda quero</button>
              </div>
            </>
          )}
          <button onClick={onClose} style={{ color: C.cream, opacity: 0.4 }} className="w-full text-xs py-3 mt-2">fechar</button>
        </div>
      </div>
    );
  }

  if (afterAnswer === "melhorou") {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
        <div style={{ background: C.navy, border: `1px solid ${C.line}` }} className="rounded-3xl p-6 max-w-sm w-full text-center">
          <p style={{ ...playfair }} className="italic text-base mb-6">Essa fissura passou.</p>
          <button onClick={() => onSurvived(intensity, null)} style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }} className="w-full rounded-full py-3 mb-2">REGISTRAR COMO VENCIDA ❤️</button>
          <button onClick={onClose} style={{ color: C.cream, opacity: 0.5 }} className="w-full text-sm py-2">fechar</button>
        </div>
      </div>
    );
  }

  // Forte: 7 técnicas
  if (!active) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50">
        <div style={{ background: C.navy, border: `1px solid ${C.line}` }} className="rounded-t-3xl sm:rounded-3xl p-6 max-w-sm w-full max-h-[85vh] overflow-y-auto">
          <p style={{ color: C.cream, ...playfair }} className="italic text-sm text-center mb-5 opacity-90">Escolhe uma técnica:</p>
          <div className="space-y-2 mb-4">
            {SOS_TECHNIQUES.map((t) => (
              <button key={t.id} onClick={() => setActive(t.id)} style={{ background: C.navySoft }} className="w-full text-left rounded-xl p-3.5 flex items-center gap-3">
                <span>{t.icon}</span>
                <span style={{ color: C.cream, ...bebas, letterSpacing: 0.5 }} className="text-base">{t.title}</span>
              </button>
            ))}
          </div>
          <button onClick={onClose} style={{ color: C.cream, opacity: 0.6 }} className="w-full text-sm py-2">fechar</button>
        </div>
      </div>
    );
  }

  const tech = SOS_TECHNIQUES.find((t) => t.id === active);
  const bPhase = breathPhase < 4 ? "inspire" : breathPhase < 11 ? "segure" : "solte";
  const scale = bPhase === "solte" ? 0.85 : 1.3;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
      <div style={{ background: C.navy, border: `1px solid ${C.line}` }} className="rounded-3xl p-6 max-w-sm w-full text-center">
        <p style={{ color: C.red, ...bebas, letterSpacing: 1 }} className="text-lg mb-4">{tech.icon} {tech.title.toUpperCase()}</p>

        {active === "respirar" && (
          <div className="flex items-center justify-center h-36 mb-4">
            <div style={{ width: 100, height: 100, borderRadius: "9999px", background: `${C.red}33`, border: `2px solid ${C.red}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${scale})`, transition: "transform 3.5s ease-in-out" }}>
              <span style={{ color: C.cream, ...bebas }}>{bPhase}</span>
            </div>
          </div>
        )}

        {active === "porque" && (
          <p style={{ color: C.cream, ...playfair }} className="italic text-base mb-4 leading-relaxed">
            {why ? `"${why}"` : "Você ainda não escreveu seu porquê — vale voltar e escrever depois."}
          </p>
        )}

        {active === "conquistas" && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Stat label="dias" value={stats.days} />
            <Stat label="economizado" value={`R$ ${stats.moneySaved.toFixed(0)}`} />
            <Stat label="cigarros evitados" value={Math.floor(stats.cigsAvoided)} />
            <Stat label="fissuras vencidas" value={stats.cravingsSurvived} />
          </div>
        )}

        {["caminhar", "agua", "gelo", "boca"].includes(active) && (
          <p className="text-sm opacity-80 mb-4">Faz isso agora, com calma. Você tem alguns minutos até a vontade passar.</p>
        )}

        <button onClick={() => onSurvived("forte", active)} style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }} className="w-full rounded-full py-3 mb-2">PASSOU, AGUENTEI</button>
        <button onClick={() => setActive(null)} style={{ color: C.cream, opacity: 0.6 }} className="w-full text-sm py-2">tentar outra técnica</button>
      </div>
    </div>
  );
}

function WelcomeModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
      <div style={{ background: C.navy, border: `1px solid ${C.line}` }} className="rounded-3xl p-6 max-w-sm w-full max-h-[85vh] overflow-y-auto">
        <p style={{ ...bebas, letterSpacing: 1, color: C.red }} className="text-sm mb-3">BEM-VINDO AO RESPIRA</p>
        <div style={{ ...playfair }} className="italic text-sm leading-relaxed mb-6 whitespace-pre-line">{WELCOME_TEXT}</div>
        <button onClick={onClose} style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }} className="w-full rounded-full py-3">COMEÇAR</button>
      </div>
    </div>
  );
}

function RelapseModal({ onClose, onChoose }) {
  const [cause, setCause] = useState(null);
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(null);

  if (!cause) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
        <div style={{ background: C.navy, border: `1px solid ${C.line}` }} className="rounded-3xl p-6 max-w-sm w-full">
          <p style={{ ...bebas, letterSpacing: 1, color: C.red }} className="text-sm mb-3">SEM JULGAMENTO</p>
          <p style={{ ...playfair }} className="italic text-sm leading-relaxed mb-4">O que aconteceu?</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {RELAPSE_CAUSES.map((c) => (
              <button key={c.key} onClick={() => setCause(c.key)} style={{ background: C.navySoft }} className="rounded-xl p-3 text-sm text-left">{c.icon} {c.label}</button>
            ))}
          </div>
          <button onClick={onClose} style={{ color: C.cream, opacity: 0.5 }} className="w-full text-xs py-2">cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
      <div style={{ background: C.navy, border: `1px solid ${C.line}` }} className="rounded-3xl p-6 max-w-sm w-full">
        <p style={{ ...bebas, letterSpacing: 1, color: C.red }} className="text-sm mb-3">VAMOS AJUSTAR SEU PLANO?</p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="quer contar mais alguma coisa? (opcional)"
          style={{ background: C.navySoft, color: C.cream }} className="w-full rounded-xl px-3 py-2.5 mb-3 outline-none resize-none text-sm placeholder-white/40" />

        <button onClick={() => shareText("Tive uma recaída. Pode conversar comigo um pouco?")} style={{ color: C.gold }} className="w-full text-xs underline py-2 mb-4">
          📱 contar pra alguém agora
        </button>

        {confirming === null && (
          <div className="space-y-2">
            <button onClick={() => setConfirming("slip")} style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="w-full rounded-xl py-3 text-sm">Foi só um deslize — continuar contando</button>
            <button onClick={() => setConfirming("restart")} style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="w-full rounded-xl py-3 text-sm">Prefiro recomeçar a contagem agora</button>
            <button onClick={onClose} style={{ color: C.cream, opacity: 0.5 }} className="w-full text-xs py-2">cancelar</button>
          </div>
        )}

        {confirming === "slip" && (
          <div className="space-y-2">
            <p className="text-xs opacity-70 mb-2">Seus dias já construídos continuam contando normalmente. Um deslize não apaga o que você já conquistou.</p>
            <button onClick={() => onChoose(cause, note, "slip")} style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }} className="w-full rounded-full py-3">CONFIRMAR</button>
            <button onClick={() => setConfirming(null)} style={{ color: C.cream, opacity: 0.5 }} className="w-full text-xs py-2">voltar</button>
          </div>
        )}

        {confirming === "restart" && (
          <div className="space-y-2">
            <p className="text-xs opacity-70 mb-2">A contagem volta a zero a partir de agora. Recomeçar não apaga a coragem de ter tentado.</p>
            <button onClick={() => onChoose(cause, note, "restart")} style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }} className="w-full rounded-full py-3">CONFIRMAR RECOMEÇO</button>
            <button onClick={() => setConfirming(null)} style={{ color: C.cream, opacity: 0.5 }} className="w-full text-xs py-2">voltar</button>
          </div>
        )}
      </div>
    </div>
  );
}

function LoginScreen({ supabase }) {
  return (
    <div style={{ background: C.navy }} className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <p style={{ ...bebas, color: C.cream, letterSpacing: 2 }} className="text-lg mb-1">Ô BICHA<span style={{ color: C.red }}>!</span></p>
        <h1 style={{ ...bebas, color: C.cream, letterSpacing: 1 }} className="text-5xl mb-3">RESPIRA</h1>
        <p style={{ color: C.cream, ...playfair }} className="italic text-sm opacity-80 mb-8">Parar de fumar é um presente pra versão mais bonita de você.</p>
        <button onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/respira` } })}
          style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }} className="w-full rounded-full py-3.5">ENTRAR COM GOOGLE</button>
        <EmphasisDisclaimer />
      </div>
    </div>
  );
}

function Onboarding({ supabase, session, onDone }) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState("already");
  const [daysAgo, setDaysAgo] = useState(0);
  const [futureDate, setFutureDate] = useState("");
  const [cigsPerDay, setCigsPerDay] = useState(15);
  const [pricePerPack, setPricePerPack] = useState(12);
  const [cigsPerPack, setCigsPerPack] = useState(20);
  const [why, setWhy] = useState("");
  const [planPairs, setPlanPairs] = useState([]);
  const [curTrigger, setCurTrigger] = useState(TRIGGER_OPTIONS[0].key);
  const [curSub, setCurSub] = useState(SUBSTITUTE_OPTIONS[0].key);

  const canStart = mode === "already" || (mode === "scheduled" && futureDate);

  async function finish() {
    const quit_at = mode === "scheduled"
      ? new Date(futureDate + "T07:00:00").toISOString()
      : new Date(Date.now() - daysAgo * 86400000).toISOString();
    const { data } = await supabase.from("quit_profiles").insert({
      user_id: session.user.id,
      display_name: session.user.user_metadata?.full_name,
      photo_url: session.user.user_metadata?.avatar_url || null,
      quit_at, cigs_per_day: cigsPerDay, price_per_pack: pricePerPack, cigs_per_pack: cigsPerPack, why_text: why || null,
    }).select().single();

    const createdPlans = [];
    for (const pair of planPairs) {
      const { data: pl } = await supabase.from("quit_emergency_plans").insert({ user_id: session.user.id, trigger_tag: pair.trigger, substitute: pair.sub }).select().single();
      createdPlans.push(pl);
    }
    onDone(data, createdPlans);
  }

  return (
    <div style={{ background: C.navy, color: C.cream }} className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="max-w-sm w-full">
        <h1 style={{ ...bebas, letterSpacing: 1 }} className="text-3xl mb-6">PRIMEIRO RESPIRO</h1>

        {step === 1 && (
          <>
            <div className="flex gap-2 mb-5">
              <button onClick={() => setMode("already")} style={{ background: mode === "already" ? C.red : C.navySoft }} className="flex-1 rounded-xl py-2.5 text-sm">já parei</button>
              <button onClick={() => setMode("scheduled")} style={{ background: mode === "scheduled" ? C.red : C.navySoft }} className="flex-1 rounded-xl py-2.5 text-sm">vou parar</button>
            </div>

            {mode === "already" && (
              <label className="block mb-4">
                <span className="text-xs opacity-70">há quantos dias você parou?</span>
                <input type="number" min={0} value={daysAgo} onChange={(e) => setDaysAgo(Math.max(0, Number(e.target.value)))} style={{ background: C.navySoft, color: C.cream }} className="w-full rounded-xl px-3 py-2.5 mt-1 outline-none font-mono" />
                <span className="text-[11px] opacity-50">0 = hoje mesmo</span>
              </label>
            )}

            {mode === "scheduled" && (
              <label className="block mb-4">
                <span className="text-xs opacity-70">data que vai parar</span>
                <input type="date" value={futureDate} onChange={(e) => setFutureDate(e.target.value)} style={{ background: C.navySoft, color: C.cream }} className="w-full rounded-xl px-3 py-2.5 mt-1 outline-none" />
              </label>
            )}

            {[["cigarros por dia", cigsPerDay, setCigsPerDay], ["preço do maço (R$)", pricePerPack, setPricePerPack], ["cigarros por maço", cigsPerPack, setCigsPerPack]].map(([label, val, set]) => (
              <label key={label} className="block mb-4">
                <span className="text-xs opacity-70">{label}</span>
                <input type="number" value={val} onChange={(e) => set(Number(e.target.value))} style={{ background: C.navySoft, color: C.cream }} className="w-full rounded-xl px-3 py-2.5 mt-1 outline-none font-mono" />
              </label>
            ))}

            <label className="block mb-6">
              <span className="text-xs opacity-70">meu porquê (opcional agora, dá pra escrever depois)</span>
              <textarea value={why} onChange={(e) => setWhy(e.target.value)} rows={2} style={{ background: C.navySoft, color: C.cream }} className="w-full rounded-xl px-3 py-2.5 mt-1 outline-none resize-none" />
            </label>

            <button disabled={!canStart} onClick={() => setStep(2)} style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1, opacity: canStart ? 1 : 0.4 }} className="w-full rounded-full py-3.5">
              CONTINUAR
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ ...playfair }} className="italic text-sm opacity-80 mb-5">Quando você mais sente vontade? Monta seu plano de emergência — pode adicionar mais de um.</p>
            <div style={{ background: C.navySoft }} className="rounded-xl p-3 space-y-2 mb-3">
              <select value={curTrigger} onChange={(e) => setCurTrigger(e.target.value)} style={{ background: C.navy, color: C.cream }} className="w-full rounded-lg px-2 py-2 text-sm outline-none">
                {TRIGGER_OPTIONS.map((t) => <option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}
              </select>
              <select value={curSub} onChange={(e) => setCurSub(e.target.value)} style={{ background: C.navy, color: C.cream }} className="w-full rounded-lg px-2 py-2 text-sm outline-none">
                {SUBSTITUTE_OPTIONS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <button onClick={() => setPlanPairs((cur) => [...cur, { trigger: curTrigger, sub: curSub }])} style={{ color: C.red }} className="w-full text-sm py-1">+ adicionar</button>
            </div>
            <div className="space-y-2 mb-6">
              {planPairs.map((p, i) => {
                const t = TRIGGER_OPTIONS.find((x) => x.key === p.trigger);
                const s = SUBSTITUTE_OPTIONS.find((x) => x.key === p.sub);
                return (
                  <div key={i} style={{ background: C.navySoft }} className="rounded-xl p-3 flex justify-between items-center">
                    <p className="text-sm">{t?.icon} {t?.label} → <span style={{ color: C.red }}>{s?.label}</span></p>
                    <button onClick={() => setPlanPairs((cur) => cur.filter((_, j) => j !== i))} className="opacity-50">✕</button>
                  </div>
                );
              })}
            </div>
            <button onClick={finish} style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }} className="w-full rounded-full py-3.5 mb-2">COMEÇAR</button>
            <button onClick={() => setStep(1)} style={{ color: C.cream, opacity: 0.5 }} className="w-full text-sm py-2">voltar</button>
          </>
        )}

        <EmphasisDisclaimer />
      </div>
    </div>
  );
}
