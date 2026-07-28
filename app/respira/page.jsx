"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  WELCOME_TEXT,
  HEALTH_MILESTONES,
  BADGE_LEVELS,
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
  FISSURE_KIT_ITEMS,
  COMPANY_OPTIONS,
  EMOTION_BEFORE_OPTIONS,
  getCoachMessage,
  getMissionsForDay,
  getEsteemAffirmation,
  containsBlockedTerm,
  formatMinutesAsLifeTime,
} from "@/lib/respira-content";

const C = { cream: "#F5EFE4", navy: "#101B2D", navySoft: "#1B2A42", red: "#C63B32", gold: "#D4A843", line: "#2A3B57" };
const bebas = { fontFamily: "var(--font-bebas)" };
const playfair = { fontFamily: "var(--font-playfair)" };

function ShareRow({ text }) {
  const encoded = encodeURIComponent(text);
  const linkStyle = { flex: 1, textAlign: "center", padding: ".6rem .4rem", borderRadius: 8, fontSize: ".7rem", ...bebas, letterSpacing: 0.5, textDecoration: "none" };
  return (
    <div style={{ display: "flex", gap: ".5rem" }}>
      <a href={`https://www.threads.net/intent/post?text=${encoded}`} target="_blank" style={{ ...linkStyle, background: C.navySoft, color: C.cream }}>Threads</a>
      <a href={`https://twitter.com/intent/tweet?text=${encoded}`} target="_blank" style={{ ...linkStyle, background: C.navySoft, color: C.cream }}>X</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://obicha.com.br/respira")}&quote=${encoded}`} target="_blank" style={{ ...linkStyle, background: C.navySoft, color: C.cream }}>Facebook</a>
      <a href={`https://wa.me/?text=${encoded}`} target="_blank" style={{ ...linkStyle, background: C.navySoft, color: C.cream }}>WhatsApp</a>
    </div>
  );
}

function dayKey(d = new Date()) { return d.toISOString().slice(0, 10); }

async function shareText(text) {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile && navigator.share) {
    try { await navigator.share({ text }); return; } catch (e) { /* usuário cancelou, cai no fallback abaixo */ }
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
        {isFuture && (
          <div style={{ background: `${C.gold}15`, border: `1px solid ${C.gold}` }} className="rounded-2xl p-3.5 mb-5 text-center">
            <p className="text-sm">
              Sua contagem de dias começa em <span style={{ color: C.gold, ...bebas }}>{new Date(quitAt).toLocaleDateString("pt-BR")}</span>. Até lá, aproveita pra explorar o app, montar seu plano e conhecer a comunidade.
            </p>
          </div>
        )}

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
          isFuture ? (
            <CountdownView quitAt={quitAt} now={now} />
          ) : (
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
          )
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
            relapses={relapses}
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
            onAddPlan={async (trigger_tag, substitute, reminder_time) => {
              const { data } = await supabase.from("quit_emergency_plans").insert({ user_id: session.user.id, trigger_tag, substitute, reminder_time: reminder_time || null }).select().single();
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
            onDeleteAccount={async () => {
              const { data: { session: freshSession } } = await supabase.auth.getSession();
              const res = await fetch("/api/respira/delete-account", {
                method: "POST",
                headers: { Authorization: `Bearer ${freshSession?.access_token}` },
              });
              const result = await res.json();
              if (result.ok) {
                await supabase.auth.signOut();
                window.location.href = "/respira";
              }
              return result;
            }}
          />
        )}

        <EmphasisDisclaimer />
      </div>

      <button onClick={() => setSosOpen(true)} style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 px-7 py-3.5 rounded-full shadow-lg shadow-black/40 text-lg active:scale-95 transition-transform">
        BATEU A VONTADE
      </button>


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
          onChoose={async (cause, note, action, diary) => {
            const days_reached = Math.floor(elapsedMin / 1440);
            const row = { user_id: session.user.id, trigger_tag: cause, note: note || null, action, days_reached, place_company: diary?.company || null, emotion_before: diary?.emotion || null, urge_intensity: diary?.urge ?? null };
            await supabase.from("quit_relapses").insert(row);
            setRelapses((cur) => [{ ...row, created_at: new Date().toISOString() }, ...cur]);
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
    profile, session, supabase, elapsedMin, dayNumber, cigsAvoided, moneySaved, co2Grams, lifeMinutes, cravingsSurvived,
    cravings, relapses, longestStreakDays, plans, milestonesMarked, movementLogs, selfesteemChecks,
    onToggleMilestone, onAddPlan, onRemovePlan, onLogMovement, onSelfesteemCheck, onOpenRelapse,
  } = props;

  const [planTrigger, setPlanTrigger] = useState(TRIGGER_OPTIONS[0].key);
  const [planSub, setPlanSub] = useState(SUBSTITUTE_OPTIONS[0].key);
  const [planTime, setPlanTime] = useState("");
  const [movActivity, setMovActivity] = useState(MOVEMENT_ACTIVITIES[0].key);
  const [movMinutes, setMovMinutes] = useState(15);
  const [shareOpen, setShareOpen] = useState(false);
  const [showAllCravings, setShowAllCravings] = useState(false);

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

  const diaryStats = useMemo(() => {
    const withDiary = relapses.filter((r) => r.place_company || r.emotion_before || r.urge_intensity != null);
    if (withDiary.length === 0) return null;
    const countBy = (key) => {
      const map = {};
      withDiary.forEach((r) => { if (r[key]) map[r[key]] = (map[r[key]] || 0) + 1; });
      return Object.entries(map).sort((a, b) => b[1] - a[1]);
    };
    const urges = withDiary.map((r) => r.urge_intensity).filter((v) => v != null);
    const avgUrge = urges.length ? (urges.reduce((a, b) => a + b, 0) / urges.length).toFixed(1) : null;
    return { count: withDiary.length, companyCounts: countBy("place_company"), emotionCounts: countBy("emotion_before"), avgUrge };
  }, [relapses]);

  const co2Display = co2Grams >= 1000 ? `${(co2Grams / 1000).toFixed(1)}kg` : `${Math.floor(co2Grams)}g`;

  const thisWeekRating = selfesteemChecks.find((c) => c.week_key === weekKey())?.rating;

  return (
    <div>
      <div className="mb-8">
        <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">MEDALHAS</p>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {BADGE_LEVELS.map((b, i) => {
            const unlocked = dayNumber >= b.days;
            const isNext = !unlocked && (i === 0 || dayNumber >= BADGE_LEVELS[i - 1].days);
            return (
              <div key={b.days} className="flex flex-col items-center flex-shrink-0" style={{ width: 76 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center",
                  background: unlocked ? `${C.gold}22` : C.navySoft,
                  border: `2px solid ${unlocked ? C.gold : C.line}`,
                  fontSize: unlocked ? "1.6rem" : "1.3rem",
                  opacity: unlocked ? 1 : 0.4,
                }}>
                  {unlocked ? b.icon : "🔒"}
                </div>
                <p className={`text-[10px] text-center mt-1.5 ${unlocked ? "" : "opacity-40"}`}>{b.label}</p>
                {isNext && <p className="text-[9px] mt-0.5" style={{ color: C.gold }}>faltam {b.days - dayNumber}d</p>}
              </div>
            );
          })}
        </div>
      </div>

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

      {diaryStats && (
        <div className="mb-8">
          <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">DIÁRIO DO CIGARRO</p>
          <p className="text-xs opacity-60 mb-3">com base em {diaryStats.count} registro{diaryStats.count !== 1 ? "s" : ""} {diaryStats.avgUrge ? <>· vontade média: <span style={{ color: C.red }}>{diaryStats.avgUrge}/10</span></> : null}</p>
          {diaryStats.companyCounts.length > 0 && (
            <div className="mb-3">
              <p className="text-[11px] opacity-50 mb-1.5">onde / com quem</p>
              <div className="flex flex-wrap gap-1.5">
                {diaryStats.companyCounts.map(([key, count]) => {
                  const c = COMPANY_OPTIONS.find((x) => x.key === key);
                  return <span key={key} style={{ background: C.navySoft }} className="text-xs px-2 py-1 rounded-full">{c?.icon} {c?.label} · {count}</span>;
                })}
              </div>
            </div>
          )}
          {diaryStats.emotionCounts.length > 0 && (
            <div>
              <p className="text-[11px] opacity-50 mb-1.5">como se sentia antes</p>
              <div className="flex flex-wrap gap-1.5">
                {diaryStats.emotionCounts.map(([key, count]) => {
                  const e = EMOTION_BEFORE_OPTIONS.find((x) => x.key === key);
                  return <span key={key} style={{ background: C.navySoft }} className="text-xs px-2 py-1 rounded-full">{e?.icon} {e?.label} · {count}</span>;
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mb-8">
        <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">HISTÓRICO DE FISSURAS VENCIDAS</p>
        {cravings.length === 0 ? (
          <p className="text-xs opacity-40">nenhuma fissura registrada ainda — toda vez que você aguentar uma, ela aparece aqui</p>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {[...cravings].reverse().slice(0, showAllCravings ? cravings.length : 8).map((c, i) => {
              const intensityInfo = { leve: { icon: "😐", label: "Leve" }, media: { icon: "😣", label: "Média" }, forte: { icon: "😭", label: "Forte" } }[c.intensity] || {};
              const tech = SOS_TECHNIQUES.find((t) => t.id === c.technique);
              const date = new Date(c.created_at);
              return (
                <div key={c.id || i} style={{ background: C.navySoft }} className="rounded-lg px-3 py-2 flex items-center justify-between text-xs">
                  <span>{intensityInfo.icon} {intensityInfo.label}{tech ? ` · ${tech.icon} ${tech.title}` : ""}</span>
                  <span className="opacity-50">{date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              );
            })}
          </div>
        )}
        {cravings.length > 8 && (
          <button onClick={() => setShowAllCravings((v) => !v)} style={{ color: C.gold }} className="text-xs mt-2 underline">
            {showAllCravings ? "ver menos" : `ver todas (${cravings.length})`}
          </button>
        )}
      </div>

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
        <p style={{ ...bebas, letterSpacing: 1, color: C.gold }} className="text-sm mb-3">🪞 AUTOESTIMA</p>

        <div style={{ background: `${C.gold}15`, border: `1px solid ${C.gold}` }} className="rounded-2xl p-4 mb-4">
          <p style={{ ...playfair }} className="italic text-sm leading-relaxed">{getEsteemAffirmation(dayNumber)}</p>
        </div>

        <p className="text-xs opacity-70 mb-2">Como você se sente essa semana, de um jeito geral?</p>
        <div className="flex justify-between mb-3">
          {SELFESTEEM_OPTIONS.map((o) => (
            <button key={o.value} onClick={() => onSelfesteemCheck(o.value)} style={{ fontSize: "1.8rem", opacity: thisWeekRating === o.value ? 1 : 0.35, transform: thisWeekRating === o.value ? "scale(1.15)" : "scale(1)", transition: "all .2s" }}>{o.icon}</button>
          ))}
        </div>

        {selfesteemChecks.length > 1 ? (
          <>
            <p className="text-[11px] opacity-50 mb-1.5">sua evolução, semana a semana</p>
            <div className="flex items-end gap-1 h-14">
              {selfesteemChecks.slice(-12).map((c, i) => (
                <div key={i} style={{ height: `${(c.rating / 5) * 100}%`, background: C.gold }} className="flex-1 rounded-t opacity-70" />
              ))}
            </div>
          </>
        ) : (
          <p className="text-[11px] opacity-40">responda toda semana pra começar a ver sua evolução aqui</p>
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
        <div className="flex items-center justify-between mb-3">
          <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70">PLANO DE EMERGÊNCIA</p>
          <PushToggleButton session={session} supabase={supabase} />
        </div>
        <div className="space-y-2 mb-3">
          {plans.map((p) => {
            const t = TRIGGER_OPTIONS.find((x) => x.key === p.trigger_tag);
            const s = SUBSTITUTE_OPTIONS.find((x) => x.key === p.substitute);
            return (
              <div key={p.id} style={{ background: C.navySoft }} className="rounded-xl p-3 flex justify-between items-center">
                <div>
                  <p className="text-sm">{t?.icon} {t?.label} → <span style={{ color: C.red }}>{s?.label}</span></p>
                  {p.reminder_time && <p className="text-xs opacity-50 mt-0.5">🔔 lembrete às {p.reminder_time.slice(0, 5)}</p>}
                </div>
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
          <div>
            <label className="text-xs opacity-60 block mb-1">horário do lembrete (opcional)</label>
            <input type="time" value={planTime} onChange={(e) => setPlanTime(e.target.value)} style={{ background: C.navy, color: C.cream }} className="w-full rounded-lg px-2 py-2 text-sm outline-none" />
          </div>
          <button onClick={() => { onAddPlan(planTrigger, planSub, planTime); setPlanTime(""); }} style={{ color: C.red }} className="w-full text-sm py-1">+ adicionar</button>
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
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetch("/api/respira/content")
      .then((r) => r.json())
      .then(setContent)
      .catch(() => setContent([]));
  }, []);

  const videos = (content || []).filter((c) => c.type === "video");
  const textos = (content || []).filter((c) => c.type === "texto");
  const materias = (content || []).filter((c) => c.type === "materia");

  function youtubeEmbed(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }

  return (
    <div>
      {videos.length > 0 && (
        <div className="mb-8">
          <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">VÍDEOS</p>
          <div className="space-y-4">
            {videos.map((v) => {
              const embed = youtubeEmbed(v.url || "");
              return (
                <div key={v.id} style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-xl overflow-hidden">
                  {embed ? (
                    <div style={{ position: "relative", paddingTop: "56.25%" }}>
                      <iframe src={embed} title={v.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} allowFullScreen />
                    </div>
                  ) : (
                    <a href={v.url} target="_blank" style={{ display: "block", padding: "1rem", color: C.gold }} className="text-sm">
                      ▶ assistir vídeo ↗
                    </a>
                  )}
                  <div className="p-3.5">
                    <p className="text-sm font-bold">{v.title}</p>
                    {v.description && <p className="text-xs opacity-60 mt-1">{v.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {textos.length > 0 && (
        <div className="mb-8">
          <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">TEXTOS</p>
          <div className="space-y-2">
            {textos.map((t) => (
              <div key={t.id} style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-xl p-3.5">
                <button onClick={() => setOpen(open === `t${t.id}` ? null : `t${t.id}`)} className="w-full text-left flex justify-between items-center">
                  <span className="text-sm font-bold">{t.title}</span>
                  <span className="opacity-50">{open === `t${t.id}` ? "−" : "+"}</span>
                </button>
                {open === `t${t.id}` && (
                  <div className="mt-2 text-sm opacity-80 leading-relaxed whitespace-pre-line">{t.body}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {materias.length > 0 && (
        <div className="mb-8">
          <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">MATÉRIAS</p>
          <div className="space-y-2">
            {materias.map((m) => (
              <a key={m.id} href={m.url} target="_blank" style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="block rounded-xl p-3.5">
                <p className="text-sm font-bold">{m.title}</p>
                {m.description && <p className="text-xs opacity-60 mt-1">{m.description}</p>}
                {m.source && <p className="text-xs mt-1" style={{ color: C.gold }}>{m.source} ↗</p>}
              </a>
            ))}
          </div>
        </div>
      )}

      <div>
        <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">SABIA QUE...</p>
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
      </div>
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
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile) {
        const file = new File([blob], "respira.png", { type: "image/png" });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try { await navigator.share({ files: [file], title: "Respira — Ô bicha!" }); setGenerating(false); return; } catch (e) { /* cancelou, cai no fallback abaixo */ }
        }
        // fallback: abre em nova aba — dá pra segurar e "Salvar imagem" direto na galeria
        const dataUrl = canvas.toDataURL("image/png");
        window.open(dataUrl, "_blank");
      } else {
        // no PC, baixa direto — nunca aciona o menu de compartilhamento do Windows/sistema
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "respira.png";
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      }
      setGenerating(false);
    }, "image/png");
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

function PushToggleButton({ session, supabase }) {
  const [status, setStatus] = useState("checking"); // checking | unsupported | denied | off | on | working
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") { setStatus("denied"); return; }
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      if (!reg) { setStatus("off"); return; }
      const sub = await reg.pushManager.getSubscription();
      setStatus(sub ? "on" : "off");
    });
  }, []);

  async function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
  }

  async function activate() {
    setStatus("working");
    setError("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setStatus("denied"); return; }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const applicationServerKey = await urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "");
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });

      const { data: { session: freshSession } } = await supabase.auth.getSession();
      await fetch("/api/respira/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${freshSession?.access_token}` },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      setStatus("on");
    } catch (e) {
      setError("Não foi possível ativar. Tenta de novo.");
      setStatus("off");
    }
  }

  async function deactivate() {
    setStatus("working");
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        const { data: { session: freshSession } } = await supabase.auth.getSession();
        await fetch("/api/respira/push-subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${freshSession?.access_token}` },
          body: JSON.stringify({ endpoint }),
        });
      }
      setStatus("off");
    } catch (e) {
      setStatus("on");
    }
  }

  if (status === "unsupported") return null;
  if (status === "denied") return <span className="text-[10px] opacity-40">notificações bloqueadas no navegador</span>;

  return (
    <div className="text-right">
      <button onClick={status === "on" ? deactivate : activate} disabled={status === "working" || status === "checking"}
        style={{ color: status === "on" ? "#4ade80" : C.gold }} className="text-xs underline">
        {status === "working" ? "..." : status === "on" ? "🔔 lembretes ativados" : "🔕 ativar lembretes"}
      </button>
      {error && <p className="text-[10px] mt-1" style={{ color: C.red }}>{error}</p>}
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
      approved: false,
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
        <div className="flex items-center justify-between mt-2">
          <button onClick={submitPost} disabled={posting || !content.trim()} style={{ color: C.red, opacity: posting || !content.trim() ? 0.4 : 1 }} className="text-sm">publicar</button>
          <span className="text-[10px] opacity-30">posts passam por moderação antes de aparecer pra todo mundo</span>
        </div>
      </div>

      {posts === null ? (
        <p className="text-sm opacity-50 text-center py-8">carregando…</p>
      ) : posts.length === 0 ? (
        <p className="text-sm opacity-50 text-center py-8">ninguém postou ainda — seja a primeira pessoa</p>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => {
            const canDelete = p.user_id === session.user.id || profile.is_admin;
            const isPendingOwn = !p.approved && p.user_id === session.user.id;
            return (
              <div key={p.id} style={{ background: C.navySoft, border: `1px solid ${isPendingOwn ? C.gold : C.line}`, opacity: isPendingOwn ? 0.75 : 1 }} className="rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {p.photo_url && <img src={p.photo_url} alt="" className="w-6 h-6 rounded-full" />}
                    <span className="text-xs opacity-70">{p.display_name}</span>
                    {isPendingOwn && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${C.gold}22`, color: C.gold }}>aguardando aprovação</span>}
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

function ConfigTab({ profile, onSave, onRereadWelcome, onSignOut, onDeleteAccount }) {
  const [cigsPerDay, setCigsPerDay] = useState(profile.cigs_per_day);
  const [pricePerPack, setPricePerPack] = useState(profile.price_per_pack);
  const [cigsPerPack, setCigsPerPack] = useState(profile.cigs_per_pack);
  const [why, setWhy] = useState(profile.why_text || "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    const result = await onDeleteAccount();
    if (!result?.ok) {
      setDeleteError("Não foi possível excluir agora. Tenta de novo em instantes.");
      setDeleting(false);
    }
    // se deu certo, a própria função onDeleteAccount já redireciona
  }

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
      <button onClick={onSignOut} style={{ color: C.cream, opacity: 0.5 }} className="w-full text-sm py-2 mb-6 underline">sair da conta</button>

      <div style={{ borderTop: `1px solid ${C.line}` }} className="pt-5 mb-6">
        {!confirmingDelete ? (
          <button onClick={() => setConfirmingDelete(true)} style={{ color: C.red, opacity: 0.7 }} className="w-full text-sm py-2 underline">
            quero sair do app e excluir meu registro
          </button>
        ) : (
          <div style={{ background: `${C.red}15`, border: `1px solid ${C.red}` }} className="rounded-xl p-4">
            <p className="text-sm mb-2">Isso apaga permanentemente seus dias contados, fissuras registradas, plano de emergência e sua conta de login. Não tem como desfazer.</p>
            {deleteError && <p className="text-xs mb-2" style={{ color: C.red }}>{deleteError}</p>}
            <div className="flex gap-2">
              <button onClick={handleDelete} disabled={deleting} style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1, opacity: deleting ? 0.6 : 1 }} className="flex-1 rounded-full py-2.5 text-sm">
                {deleting ? "EXCLUINDO..." : "SIM, EXCLUIR TUDO"}
              </button>
              <button onClick={() => setConfirmingDelete(false)} disabled={deleting} style={{ color: C.cream, opacity: 0.6 }} className="flex-1 text-sm">
                cancelar
              </button>
            </div>
          </div>
        )}
      </div>

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
// ---------- Jogo da memória ----------
function MemoryGame() {
  const [images, setImages] = useState(null);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  function newRound(imgs) {
    const pairs = [...imgs, ...imgs]
      .map((img, i) => ({ ...img, cardId: i }))
      .sort(() => Math.random() - 0.5);
    setCards(pairs);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  }

  useEffect(() => {
    fetch("/api/respira/game-images?count=6")
      .then((r) => r.json())
      .then((data) => {
        setImages(data);
        if (data.length >= 6) newRound(data);
      })
      .catch(() => setImages([]));
  }, []);

  function flip(cardId) {
    if (flipped.length === 2) return;
    if (flipped.includes(cardId) || matched.includes(cardId)) return;
    const next = [...flipped, cardId];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      const cardA = cards.find((c) => c.cardId === a);
      const cardB = cards.find((c) => c.cardId === b);
      if (cardA.id === cardB.id) {
        setTimeout(() => {
          setMatched((cur) => [...cur, a, b]);
          setFlipped([]);
        }, 500);
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
  }

  if (images === null) return <p className="text-sm opacity-50 text-center py-8">carregando…</p>;
  if (images.length < 6) return <p className="text-sm opacity-50 text-center py-8">precisa de mais produtos cadastrados pra montar o jogo</p>;

  const won = matched.length === cards.length && cards.length > 0;

  return (
    <div>
      <p className="text-xs opacity-60 text-center mb-3">{moves} jogadas</p>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.cardId) || matched.includes(card.cardId);
          return (
            <button
              key={card.cardId}
              onClick={() => flip(card.cardId)}
              style={{
                width: "100%",
                aspectRatio: "1",
                minHeight: 92,
                background: isFlipped ? "transparent" : C.navySoft,
                border: `1px solid ${matched.includes(card.cardId) ? "#4ade80" : C.line}`,
                borderRadius: 10,
                overflow: "hidden",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isFlipped ? (
                <img src={card.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "2.2rem" }}>🏳️‍🌈</span>
              )}
            </button>
          );
        })}
      </div>
      {won && (
        <div className="text-center mb-2">
          <p className="text-sm mb-2" style={{ color: "#4ade80" }}>🎉 Você venceu em {moves} jogadas!</p>
          <button onClick={() => newRound(images)} style={{ color: C.gold }} className="text-sm underline">jogar de novo</button>
        </div>
      )}
    </div>
  );
}

function PuzzleGame() {
  const SIZE = 3;
  const MAX_BOARD = 380;
  const boardRef = useRef(null);
  const [boardPx, setBoardPx] = useState(300);
  const TILE = boardPx / SIZE;
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!boardRef.current) return;
    const el = boardRef.current;
    const update = () => setBoardPx(el.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function getNeighbors(index) {
    const row = Math.floor(index / SIZE);
    const col = index % SIZE;
    const out = [];
    if (row > 0) out.push(index - SIZE);
    if (row < SIZE - 1) out.push(index + SIZE);
    if (col > 0) out.push(index - 1);
    if (col < SIZE - 1) out.push(index + 1);
    return out;
  }

  function shuffleSolvable() {
    const arr = Array.from({ length: SIZE * SIZE }, (_, i) => i);
    let blankIndex = SIZE * SIZE - 1;
    for (let i = 0; i < 150; i++) {
      const neighbors = getNeighbors(blankIndex);
      const swapWith = neighbors[Math.floor(Math.random() * neighbors.length)];
      const tmp = arr[blankIndex];
      arr[blankIndex] = arr[swapWith];
      arr[swapWith] = tmp;
      blankIndex = swapWith;
    }
    return arr;
  }

  const [tiles, setTiles] = useState(() => shuffleSolvable());

  useEffect(() => {
    fetch("/api/respira/game-images?count=1")
      .then((r) => r.json())
      .then((data) => {
        if (!data || !data[0] || !data[0].image_url) { setImage(false); return; }
        setImage(data[0]);
        setTiles(shuffleSolvable());
      })
      .catch(() => setImage(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function moveTile(clickedIndex) {
    setTiles((current) => {
      const blankIndex = current.indexOf(SIZE * SIZE - 1);
      if (!getNeighbors(blankIndex).includes(clickedIndex)) return current;
      const next = current.slice();
      const tmp = next[blankIndex];
      next[blankIndex] = next[clickedIndex];
      next[clickedIndex] = tmp;
      return next;
    });
  }

  if (image === null) return <p className="text-sm opacity-50 text-center py-8">carregando…</p>;
  if (image === false) return <p className="text-sm opacity-50 text-center py-8">não achei imagem pra montar o quebra-cabeça agora</p>;

  const solved = tiles.every((v, i) => v === i);

  return (
    <div>
      <div
        ref={boardRef}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: MAX_BOARD,
          aspectRatio: "1",
          margin: "0 auto 1rem",
          background: C.navy,
          borderRadius: 8,
          overflow: "hidden",
          border: `1px solid ${C.line}`,
        }}
      >
        {tiles.map((value, index) => {
          const isBlank = value === SIZE * SIZE - 1;
          const targetRow = Math.floor(index / SIZE);
          const targetCol = index % SIZE;
          const srcRow = Math.floor(value / SIZE);
          const srcCol = value % SIZE;
          return (
            <button
              key={index}
              onClick={() => moveTile(index)}
              style={{
                position: "absolute",
                top: targetRow * TILE,
                left: targetCol * TILE,
                width: TILE,
                height: TILE,
                border: "1px solid rgba(0,0,0,.3)",
                padding: 0,
                cursor: isBlank ? "default" : "pointer",
                backgroundColor: isBlank ? C.navySoft : "transparent",
                backgroundImage: isBlank ? "none" : `url(${image.image_url})`,
                backgroundSize: `${boardPx}px ${boardPx}px`,
                backgroundPosition: `-${srcCol * TILE}px -${srcRow * TILE}px`,
                transition: "top .15s ease, left .15s ease",
              }}
            />
          );
        })}
      </div>
      {solved ? (
        <div className="text-center mb-2">
          <p className="text-sm mb-2" style={{ color: "#4ade80" }}>🎉 Resolvido!</p>
          <button onClick={() => setTiles(shuffleSolvable())} style={{ color: C.gold }} className="text-sm underline">jogar de novo</button>
        </div>
      ) : (
        <p className="text-xs opacity-40 text-center mb-2">clica numa peça encostada no espaço vazio pra mover</p>
      )}
    </div>
  );
}


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
          <p style={{ ...bebas, letterSpacing: 1 }} className="text-[10px] opacity-40 text-center mb-2 mt-3">OU PEDE AJUDA A ALGUÉM AGORA</p>
          <ShareRow text="Estou na fissura de cigarro, me ajuda? Vamos conversar.." />
          <button onClick={onClose} style={{ color: C.cream, opacity: 0.5 }} className="w-full text-sm py-1 mt-3">fechar</button>
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
          <button onClick={() => { setIntensity("forte"); setAfterAnswer(null); setTimerDone(false); }} style={{ color: C.gold }} className="w-full text-xs underline py-2 mt-1">
            prefere tentar um jogo ou outra técnica agora?
          </button>
          <button onClick={onClose} style={{ color: C.cream, opacity: 0.4 }} className="w-full text-xs py-1">fechar</button>
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
  const isGame = active === "quebra-cabeca" || active === "memoria";

  return (
    <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 ${isGame ? "p-3" : "p-6"}`}>
      <div style={{ background: C.navy, border: `1px solid ${C.line}` }} className={`rounded-3xl w-full text-center ${isGame ? "max-w-lg p-4 sm:p-6" : "max-w-sm p-6"}`}>
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

        {["caminhar", "agua", "gelo"].includes(active) && (
          <p className="text-sm opacity-80 mb-4">Faz isso agora, com calma. Você tem alguns minutos até a vontade passar.</p>
        )}

        {active === "boca" && (
          <div className="mb-4 text-left">
            <p className="text-sm opacity-80 mb-3 text-center">Seu kit fissura — escolhe algo pra ter sempre por perto:</p>
            <div className="grid grid-cols-2 gap-2">
              {FISSURE_KIT_ITEMS.map((item) => (
                <div key={item.key} style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-xl p-2.5">
                  <p className="text-xs font-bold">{item.icon} {item.label}</p>
                  <p className="text-[11px] opacity-60 mt-0.5">{item.examples}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === "memoria" && <MemoryGame />}
        {active === "quebra-cabeca" && <PuzzleGame />}

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
  const [company, setCompany] = useState(null);
  const [emotion, setEmotion] = useState(null);
  const [urge, setUrge] = useState(5);
  const [diaryDone, setDiaryDone] = useState(false);
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

  // Diário do cigarro — onde estava/com quem, como se sentia antes, intensidade da vontade
  if (!diaryDone) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
        <div style={{ background: C.navy, border: `1px solid ${C.line}` }} className="rounded-3xl p-6 max-w-sm w-full max-h-[85vh] overflow-y-auto">
          <p style={{ ...bebas, letterSpacing: 1, color: C.red }} className="text-sm mb-3">DIÁRIO DO CIGARRO</p>
          <p style={{ ...playfair }} className="italic text-sm leading-relaxed mb-4">Vale registrar — isso ajuda a entender seus padrões. Tudo opcional.</p>

          <p className="text-xs opacity-60 mb-2">Onde estava / com quem?</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {COMPANY_OPTIONS.map((c) => (
              <button key={c.key} onClick={() => setCompany(c.key === company ? null : c.key)}
                style={{ background: company === c.key ? C.red : C.navySoft }} className="rounded-xl p-2.5 text-sm text-left">{c.icon} {c.label}</button>
            ))}
          </div>

          <p className="text-xs opacity-60 mb-2">Como estava se sentindo antes?</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {EMOTION_BEFORE_OPTIONS.map((e) => (
              <button key={e.key} onClick={() => setEmotion(e.key === emotion ? null : e.key)}
                style={{ background: emotion === e.key ? C.red : C.navySoft }} className="rounded-xl p-2.5 text-sm text-left">{e.icon} {e.label}</button>
            ))}
          </div>

          <p className="text-xs opacity-60 mb-2">Intensidade da vontade de fumar: <span style={{ color: C.gold }}>{urge}</span>/10</p>
          <input type="range" min="0" max="10" value={urge} onChange={(e) => setUrge(Number(e.target.value))} className="w-full mb-5" />

          <button onClick={() => setDiaryDone(true)} style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }} className="w-full rounded-full py-3 mb-2">CONTINUAR</button>
          <button onClick={() => setDiaryDone(true)} style={{ color: C.cream, opacity: 0.5 }} className="w-full text-xs py-2">pular essa parte</button>
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

        <p style={{ ...bebas, letterSpacing: 1 }} className="text-[10px] opacity-40 text-center mb-2">CONTAR PRA ALGUÉM AGORA</p>
        <div className="mb-4"><ShareRow text="Tive uma recaída. Pode conversar comigo um pouco?" /></div>

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
            <button onClick={() => onChoose(cause, note, "slip", { company, emotion, urge })} style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }} className="w-full rounded-full py-3">CONFIRMAR</button>
            <button onClick={() => setConfirming(null)} style={{ color: C.cream, opacity: 0.5 }} className="w-full text-xs py-2">voltar</button>
          </div>
        )}

        {confirming === "restart" && (
          <div className="space-y-2">
            <p className="text-xs opacity-70 mb-2">A contagem volta a zero a partir de agora. Recomeçar não apaga a coragem de ter tentado.</p>
            <button onClick={() => onChoose(cause, note, "restart", { company, emotion, urge })} style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }} className="w-full rounded-full py-3">CONFIRMAR RECOMEÇO</button>
            <button onClick={() => setConfirming(null)} style={{ color: C.cream, opacity: 0.5 }} className="w-full text-xs py-2">voltar</button>
          </div>
        )}
      </div>
    </div>
  );
}

function LoginScreen({ supabase }) {
  const FEATURES = [
    { icon: "🆘", title: "Botão SOS", text: "quando a fissura bater, técnicas rápidas e até um joguinho pra passar o momento" },
    { icon: "📅", title: "Missões do dia", text: "pequenas ações diárias que ajudam a segurar a barra sem perceber o esforço" },
    { icon: "📊", title: "Seu progresso", text: "dias sem fumar, dinheiro economizado, cigarros evitados, tempo de vida recuperado" },
    { icon: "🫂", title: "Sem julgamento", text: "recaiu? tudo bem. o app te ajuda a entender o porquê e continuar de onde parou" },
  ];

  return (
    <div style={{ background: C.navy }} className="min-h-screen px-6 py-10">
      <div className="max-w-sm w-full mx-auto text-center">
        <p style={{ ...bebas, color: C.cream, letterSpacing: 2 }} className="text-lg mb-1">Ô BICHA<span style={{ color: C.red }}>!</span></p>
        <h1 style={{ ...bebas, color: C.cream, letterSpacing: 1 }} className="text-5xl mb-4">RESPIRA</h1>

        <img src="/respira-snarf.webp" alt="" className="mx-auto mb-4" style={{ maxWidth: 220, width: "100%" }} />

        <p style={{ color: C.cream, ...playfair }} className="italic text-base opacity-90 mb-2">Parar de fumar é um presente pra versão mais bonita de você.</p>
        <p className="text-sm opacity-70 mb-8 leading-relaxed">
          O Respira é uma ferramenta do Ô bicha! desenvolvida pra apoiar quem tá tentando (ou já decidiu) parar de fumar — um companheiro de bolso pros dias mais difíceis dessa jornada.
        </p>

        <div className="text-left space-y-3 mb-8">
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-xl p-3.5 flex gap-3">
              <span className="text-xl">{f.icon}</span>
              <div>
                <p className="text-sm font-bold">{f.title}</p>
                <p className="text-xs opacity-70 mt-0.5">{f.text}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/respira` } })}
          style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }} className="w-full rounded-full py-3.5">CRIAR MINHA CONTA GRÁTIS</button>
        <p className="text-xs opacity-50 mt-3">rapidinho, só com sua conta Google</p>

        <button onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/respira` } })}
          className="text-sm mt-5 underline" style={{ color: C.gold }}>já tenho conta — entrar</button>

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
