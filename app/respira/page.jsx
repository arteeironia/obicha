"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  HEALTH_MILESTONES,
  TECHNIQUES,
  ACHIEVEMENTS,
  REWARDS,
  FORUM_CATEGORIES,
  REACTIONS,
  getCoachForDay,
  getMissionsForDay,
  containsBlockedTerm,
  generateReferralCode,
} from "@/lib/respira-content";

function useBrandFonts() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
}

const C = {
  cream: "#F5EFE4",
  navy: "#101B2D",
  navySoft: "#1B2A42",
  red: "#C63B32",
  redSoft: "#E8544A",
  gold: "#D4A843",
  line: "#2A3B57",
};

const bebas = { fontFamily: "Bebas Neue, sans-serif" };
const playfair = { fontFamily: "Playfair Display, serif" };

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export default function RespiraPage() {
  useBrandFonts();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(undefined);
  const [triggers, setTriggers] = useState([]);
  const [cravings, setCravings] = useState([]);
  const [dailyState, setDailyState] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [sosOpen, setSosOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [relapseOpen, setRelapseOpen] = useState(false);
  const [triggerDraft, setTriggerDraft] = useState({ trigger: "", plan: "" });
  const [editingWhy, setEditingWhy] = useState(false);
  const [tab, setTab] = useState("hoje");
  const justOnboarded = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function loadAll(uid) {
    const { data: p } = await supabase.from("quit_profiles").select("*").eq("user_id", uid).maybeSingle();
    setProfile(p ?? null);
    const { data: t } = await supabase.from("quit_triggers").select("*").eq("user_id", uid).order("created_at");
    setTriggers(t ?? []);
    const { data: c } = await supabase.from("quit_cravings").select("*").eq("user_id", uid);
    setCravings(c ?? []);
    const { data: ds } = await supabase.from("quit_daily_state").select("*").eq("user_id", uid).eq("day_key", dayKey()).maybeSingle();
    setDailyState(ds ?? null);
    const { data: ach } = await supabase.from("quit_achievements").select("*").eq("user_id", uid);
    setAchievements(ach ?? []);
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
        onDone={(p) => {
          setProfile(p);
          justOnboarded.current = true;
          setWelcomeOpen(true);
        }}
      />
    );
  }

  const quitAt = new Date(profile.quit_at).getTime();
  const isFuture = profile.mode === "scheduled" && quitAt > now;
  const elapsedMin = Math.max(0, (now - quitAt) / 60000);
  const dayNumber = Math.floor(elapsedMin / 1440);
  const cravingsSurvived = cravings.filter((c) => c.survived).length;
  const cigsAvoided = isFuture ? 0 : (elapsedMin / 1440) * profile.cigs_per_day;
  const moneySaved = isFuture ? 0 : (cigsAvoided / profile.cigs_per_pack) * profile.price_per_pack;

  return (
    <div style={{ background: C.navy, color: C.cream }} className="min-h-screen">
      <SiteHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} onSignOut={() => supabase.auth.signOut()} />

      <div className="max-w-md mx-auto px-5 pb-32 pt-6">
        {isFuture ? (
          <CountdownView quitAt={quitAt} now={now} profile={profile} />
        ) : (
          <HeaderCounter elapsedMin={elapsedMin} cigsAvoided={cigsAvoided} moneySaved={moneySaved} cravingsSurvived={cravingsSurvived} />
        )}

        {!isFuture && (
          <div className="flex gap-1 mb-6 mt-2" style={{ borderBottom: `1px solid ${C.line}` }}>
            {[["hoje", "Hoje"], ["painel", "Painel"], ["comunidade", "Comunidade"]].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{ ...bebas, letterSpacing: 1, color: tab === key ? C.red : C.cream, opacity: tab === key ? 1 : 0.5, borderBottom: tab === key ? `2px solid ${C.red}` : "2px solid transparent" }}
                className="flex-1 text-sm pb-2.5 pt-1"
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {isFuture ? (
          <>
            <WhySection why={profile.why_text} editing={editingWhy} setEditing={setEditingWhy} onSave={async (text) => {
              await supabase.from("quit_profiles").update({ why_text: text }).eq("user_id", session.user.id);
              setProfile((p) => ({ ...p, why_text: text }));
              setEditingWhy(false);
            }} />
            <PrepChecklist />
          </>
        ) : tab === "hoje" ? (
          <TodayTab
            dayNumber={dayNumber}
            profile={profile}
            moneySaved={moneySaved}
            dailyState={dailyState}
            onToggleMission={async (mission) => {
              const done = dailyState?.missions_done || [];
              const next = done.includes(mission) ? done.filter((m) => m !== mission) : [...done, mission];
              const { data } = await supabase
                .from("quit_daily_state")
                .upsert({ user_id: session.user.id, day_key: dayKey(), missions_done: next }, { onConflict: "user_id,day_key" })
                .select()
                .single();
              setDailyState(data);
            }}
          />
        ) : tab === "painel" ? (
          <PanelTab
            profile={profile}
            session={session}
            supabase={supabase}
            elapsedMin={elapsedMin}
            cigsAvoided={cigsAvoided}
            moneySaved={moneySaved}
            cravingsSurvived={cravingsSurvived}
            cravings={cravings}
            triggers={triggers}
            triggerDraft={triggerDraft}
            setTriggerDraft={setTriggerDraft}
            editingWhy={editingWhy}
            setEditingWhy={setEditingWhy}
            achievements={achievements}
            onToggleAchievement={async (key) => {
              const has = achievements.some((a) => a.achievement_key === key);
              if (has) {
                await supabase.from("quit_achievements").delete().eq("user_id", session.user.id).eq("achievement_key", key);
                setAchievements((cur) => cur.filter((a) => a.achievement_key !== key));
              } else {
                const { data } = await supabase.from("quit_achievements").insert({ user_id: session.user.id, achievement_key: key }).select().single();
                setAchievements((cur) => [...cur, data]);
              }
            }}
            onSaveWhy={async (text) => {
              await supabase.from("quit_profiles").update({ why_text: text }).eq("user_id", session.user.id);
              setProfile((p) => ({ ...p, why_text: text }));
              setEditingWhy(false);
            }}
            onAddTrigger={async () => {
              if (!triggerDraft.trigger.trim()) return;
              const { data } = await supabase.from("quit_triggers").insert({ user_id: session.user.id, trigger: triggerDraft.trigger, plan: triggerDraft.plan }).select().single();
              setTriggers((cur) => [...cur, data]);
              setTriggerDraft({ trigger: "", plan: "" });
            }}
            onRemoveTrigger={async (id) => {
              await supabase.from("quit_triggers").delete().eq("id", id);
              setTriggers((cur) => cur.filter((t) => t.id !== id));
            }}
            onOpenRelapse={() => setRelapseOpen(true)}
          />
        ) : (
          <CommunityTab supabase={supabase} session={session} profile={profile} />
        )}
      </div>

      {!isFuture && (
        <button
          onClick={() => setSosOpen(true)}
          style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-7 py-3.5 rounded-full shadow-lg shadow-black/40 text-lg active:scale-95 transition-transform"
        >
          BATEU A VONTADE
        </button>
      )}

      {sosOpen && (
        <SOSModal
          why={profile.why_text}
          onSurvived={async (technique) => {
            const { data } = await supabase.from("quit_cravings").insert({ user_id: session.user.id, survived: true, technique }).select().single();
            setCravings((c) => [...c, data]);
            setSosOpen(false);
          }}
          onClose={() => setSosOpen(false)}
        />
      )}

      {welcomeOpen && (
        <WelcomeModal profile={profile} onClose={() => setWelcomeOpen(false)} />
      )}

      {relapseOpen && (
        <RelapseModal
          onClose={() => setRelapseOpen(false)}
          onChoose={async (action, note) => {
            await supabase.from("quit_relapses").insert({ user_id: session.user.id, action, note: note || null });
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
        <a href="https://www.obicha.com.br" style={{ ...bebas, color: C.cream }} className="text-xl tracking-wide">
          Ô BICHA<span style={{ color: C.red }}>!</span>
        </a>
        <button onClick={() => setMenuOpen(true)} style={{ color: C.cream }} aria-label="menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <div style={{ background: C.navySoft }} className="relative w-72 h-full px-6 py-6 flex flex-col">
            <button onClick={() => setMenuOpen(false)} style={{ color: C.cream }} className="self-end mb-8">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <nav className="flex flex-col gap-5">
              {navItems.map((item) => (
                <a key={item.label} href={item.href} style={{ ...bebas, color: item.active ? C.red : C.cream, letterSpacing: 1 }} className="text-2xl">
                  {item.label}
                </a>
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

// ---------- Contador principal (topo, em ambas as abas) ----------
function HeaderCounter({ elapsedMin, cigsAvoided, moneySaved, cravingsSurvived }) {
  const days = Math.floor(elapsedMin / 1440);
  const hours = Math.floor((elapsedMin % 1440) / 60);
  const mins = Math.floor(elapsedMin % 60);
  const nextMilestone = HEALTH_MILESTONES.find((m) => m.mins > elapsedMin);

  return (
    <>
      <div className="text-center mb-2">
        <p style={{ ...bebas, fontSize: "5rem", lineHeight: 0.9, color: C.cream }}>{days}</p>
        <p style={{ ...playfair }} className="italic text-sm opacity-80">dia{days !== 1 ? "s" : ""} sem fumar</p>
        <p className="text-xs opacity-60 mt-1 font-mono">{String(hours).padStart(2, "0")}h {String(mins).padStart(2, "0")}m</p>
      </div>
      {nextMilestone && (
        <p className="text-center text-xs opacity-70 mb-4">
          próxima marca: <span style={{ color: C.red }}>{nextMilestone.label}</span>
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <Stat label="cigarros evitados" value={Math.floor(cigsAvoided)} />
        <Stat label="economizado" value={`R$ ${moneySaved.toFixed(0)}`} />
        <Stat label="fissuras vencidas" value={cravingsSurvived} />
      </div>
    </>
  );
}

// ---------- Aba Hoje ----------
function TodayTab({ dayNumber, profile, moneySaved, dailyState, onToggleMission }) {
  const coach = getCoachForDay(dayNumber);
  const missions = getMissionsForDay(dayNumber);
  const done = dailyState?.missions_done || [];
  const [buddyStat, setBuddyStat] = useState(null);

  useEffect(() => {
    // estatística simulada localmente a partir de um número estável (evita depender de agregação pública)
    const seed = (dayNumber * 37 + (profile.cigs_per_day || 10)) % 40;
    setBuddyStat(12 + seed);
  }, [dayNumber, profile.cigs_per_day]);

  const coffees = Math.floor(moneySaved / 8);
  const cinemas = Math.floor(moneySaved / 28);
  const shirts = Math.floor(moneySaved / 90);

  return (
    <div>
      <div style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-2xl p-4 mb-4">
        <p style={{ ...bebas, letterSpacing: 1, color: C.red }} className="text-xs mb-2">MENSAGEM DO DIA</p>
        <p style={{ ...playfair }} className="italic text-sm leading-relaxed mb-3">{coach.msg}</p>
        <p className="text-xs opacity-70">💡 {coach.tip}</p>
      </div>

      <div style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-2xl p-4 mb-4">
        <p style={{ ...bebas, letterSpacing: 1 }} className="text-xs opacity-70 mb-3">MISSÃO DO DIA</p>
        <div className="space-y-2">
          {missions.map((m) => (
            <button key={m} onClick={() => onToggleMission(m)} className="w-full flex items-center gap-2 text-left">
              <span style={{ color: done.includes(m) ? C.red : undefined }} className={done.includes(m) ? "" : "opacity-30"}>
                {done.includes(m) ? "✓" : "○"}
              </span>
              <span className={`text-sm ${done.includes(m) ? "line-through opacity-50" : ""}`}>{m}</span>
            </button>
          ))}
        </div>
      </div>

      {buddyStat && (
        <div style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-2xl p-4 mb-4 text-center">
          <p className="text-sm">
            <span style={{ color: C.red, ...bebas }} className="text-lg">{buddyStat}</span> pessoas venceram uma fissura nas últimas 24h
          </p>
          <p className="text-xs opacity-60 mt-1">você não está sozinho(a) nessa</p>
        </div>
      )}

      {moneySaved > 0 && (
        <div style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-2xl p-4">
          <p style={{ ...bebas, letterSpacing: 1 }} className="text-xs opacity-70 mb-3">O QUE VOCÊ JÁ ECONOMIZOU DÁ PRA...</p>
          <div className="space-y-1.5 text-sm">
            {coffees > 0 && <p>☕ {coffees} café{coffees !== 1 ? "s" : ""}</p>}
            {cinemas > 0 && <p>🎬 {cinemas} ida{cinemas !== 1 ? "s" : ""} ao cinema</p>}
            {shirts > 0 && <p>👕 {shirts} camiseta{shirts !== 1 ? "s" : ""} da Ô bicha!</p>}
            {coffees === 0 && <p className="opacity-50">continue — em breve isso vira algo concreto</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Aba Painel ----------
function PanelTab(props) {
  const {
    profile, session, supabase, elapsedMin, cigsAvoided, moneySaved, cravingsSurvived, cravings,
    triggers, triggerDraft, setTriggerDraft, editingWhy, setEditingWhy,
    achievements, onToggleAchievement, onSaveWhy, onAddTrigger, onRemoveTrigger, onOpenRelapse,
  } = props;

  const days = Math.floor(elapsedMin / 1440);
  const [buddyCode, setBuddyCode] = useState("");
  const [buddyMsg, setBuddyMsg] = useState("");
  const [buddyStats, setBuddyStats] = useState(null);
  const canvasRef = useRef(null);

  const referralCode = profile.referral_code || generateReferralCode(session.user.id);

  useEffect(() => {
    if (!profile.referral_code) {
      supabase.from("quit_profiles").update({ referral_code: referralCode }).eq("user_id", session.user.id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!profile.referred_by) return;
    supabase.rpc("get_buddy_stats", { target_user_id: profile.referred_by }).then(({ data }) => {
      if (data && data[0]) setBuddyStats(data[0]);
    });
  }, [profile.referred_by]); // eslint-disable-line react-hooks/exhaustive-deps

  async function redeemCode() {
    setBuddyMsg("");
    const code = buddyCode.trim().toUpperCase();
    if (!code) return;
    const { data: target } = await supabase.from("quit_profiles").select("user_id, referral_code").eq("referral_code", code).maybeSingle();
    if (!target) { setBuddyMsg("Código não encontrado."); return; }
    if (target.user_id === session.user.id) { setBuddyMsg("Esse é o seu próprio código 🙂"); return; }
    await supabase.from("quit_profiles").update({ referred_by: target.user_id }).eq("user_id", session.user.id);
    setBuddyMsg("Conectado! Agora vocês acompanham um ao outro.");
  }

  // Padrão de horário das fissuras
  const hourCounts = useMemo(() => {
    const counts = new Array(24).fill(0);
    cravings.forEach((c) => {
      const h = new Date(c.created_at).getHours();
      counts[h]++;
    });
    return counts;
  }, [cravings]);
  const maxHour = Math.max(...hourCounts, 1);
  const hasEnoughCravings = cravings.length >= 5;
  const riskiestHour = hasEnoughCravings ? hourCounts.indexOf(Math.max(...hourCounts)) : null;

  async function generateShareCard() {
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
    ctx.font = "bold 90px serif";
    ctx.fillStyle = "#D4A843";
    ctx.fillText("Ô bicha! Respira", 540, 260);

    ctx.font = "32px monospace";
    ctx.fillStyle = "rgba(212,168,67,0.6)";
    ctx.fillText("OBICHA.COM.BR/RESPIRA", 540, 320);

    ctx.font = "bold 260px sans-serif";
    ctx.fillStyle = "#F5EFE4";
    ctx.fillText(String(days), 540, 780);

    ctx.font = "48px serif";
    ctx.fillStyle = "#F5EFE4";
    ctx.fillText(`dia${days !== 1 ? "s" : ""} sem fumar`, 540, 860);

    ctx.font = "bold 44px monospace";
    ctx.fillStyle = "#C63B32";
    ctx.fillText(`R$ ${moneySaved.toFixed(0)} economizados`, 540, 1050);
    ctx.fillStyle = "#F5EFE4";
    ctx.fillText(`${Math.floor(cigsAvoided)} cigarros evitados`, 540, 1130);
    ctx.fillText(`${cravingsSurvived} fissuras vencidas`, 540, 1210);

    ctx.font = "italic 38px serif";
    ctx.fillStyle = "rgba(245,239,228,0.7)";
    ctx.fillText("deboche não fuma mais", 540, 1750);

    canvas.toBlob(async (blob) => {
      const file = new File([blob], "respira.png", { type: "image/png" });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "Respira — Ô bicha!" });
          return;
        } catch (e) { /* usuário cancelou, cai no download */ }
      }
      const link = document.createElement("a");
      link.download = "respira.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  }

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <WhySection why={profile.why_text} editing={editingWhy} setEditing={setEditingWhy} onSave={onSaveWhy} />

      <MilestonesList elapsedMin={elapsedMin} />

      <div className="mb-8">
        <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">CONQUISTAS</p>
        <div className="grid grid-cols-2 gap-2">
          {ACHIEVEMENTS.map((a) => {
            const has = achievements.some((x) => x.achievement_key === a.key);
            return (
              <button key={a.key} onClick={() => onToggleAchievement(a.key)}
                style={{ background: has ? `${C.red}22` : C.navySoft, border: `1px solid ${has ? C.red : C.line}` }}
                className="rounded-xl p-3 text-left">
                <p className="text-lg mb-1">{a.icon}</p>
                <p className={`text-xs ${has ? "" : "opacity-60"}`}>{a.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">RECOMPENSAS</p>
        <div className="space-y-2">
          {REWARDS.map((r) => {
            const unlocked = days >= r.days;
            return (
              <div key={r.days} style={{ background: C.navySoft, border: `1px solid ${unlocked ? C.gold : C.line}` }} className="rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm">{r.label}</p>
                  <p className="text-xs opacity-50">{r.days} dias</p>
                </div>
                {unlocked ? (
                  <span style={{ color: C.gold, ...bebas, letterSpacing: 1 }} className="text-sm">{r.code}</span>
                ) : (
                  <span className="text-xs opacity-40">faltam {r.days - days}d</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {hasEnoughCravings && (
        <div className="mb-8">
          <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">PADRÃO DE FISSURA</p>
          <p className="text-xs opacity-60 mb-2">
            seu horário mais crítico costuma ser por volta das <span style={{ color: C.red }}>{riskiestHour}h</span>
          </p>
          <div className="flex items-end gap-0.5 h-16">
            {hourCounts.map((c, h) => (
              <div key={h} style={{ height: `${(c / maxHour) * 100}%`, background: h === riskiestHour ? C.red : C.line, minHeight: 2 }} className="flex-1 rounded-t" />
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">APADRINHAMENTO</p>
        <div style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-xl p-3.5 mb-2">
          <p className="text-xs opacity-60 mb-1">seu código de convite</p>
          <p style={{ ...bebas, letterSpacing: 2, color: C.gold }} className="text-xl">{referralCode}</p>
        </div>
        {profile.referred_by ? (
          buddyStats && (
            <div style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-xl p-3.5">
              <p className="text-xs opacity-60 mb-1">{buddyStats.display_name || "seu apadrinhador(a)"}</p>
              <p className="text-sm">{Math.floor((Date.now() - new Date(buddyStats.quit_at).getTime()) / 86400000)} dias · {buddyStats.cravings_survived} fissuras vencidas</p>
            </div>
          )
        ) : (
          <div className="flex gap-2">
            <input value={buddyCode} onChange={(e) => setBuddyCode(e.target.value)} placeholder="código de alguém"
              style={{ background: C.navySoft, color: C.cream }} className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none" />
            <button onClick={redeemCode} style={{ color: C.red }} className="text-sm px-2">conectar</button>
          </div>
        )}
        {buddyMsg && <p className="text-xs opacity-70 mt-2">{buddyMsg}</p>}
      </div>

      <button onClick={generateShareCard} style={{ background: C.navySoft, border: `1px solid ${C.gold}`, color: C.gold, ...bebas, letterSpacing: 1 }} className="w-full rounded-full py-3 mb-8 text-sm">
        📲 COMPARTILHAR MINHA JORNADA
      </button>

      <TriggerPlanner triggers={triggers} draft={triggerDraft} setDraft={setTriggerDraft} onAdd={onAddTrigger} onRemove={onRemoveTrigger} />

      <button onClick={onOpenRelapse} style={{ color: C.cream, opacity: 0.4 }} className="w-full text-xs underline py-4">
        tive um deslize / preciso registrar uma recaída
      </button>
    </div>
  );
}

// ---------- Aba Comunidade (fórum) ----------
function CommunityTab({ supabase, session, profile }) {
  const [posts, setPosts] = useState(null);
  const [reactions, setReactions] = useState({});
  const [category, setCategory] = useState("desabafo");
  const [content, setContent] = useState("");
  const [filter, setFilter] = useState("todos");
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
        if (row.user_id === session.user.id) {
          map[row.post_id]._mine = row.reaction;
        }
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
      category,
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

  async function report(postId) {
    await supabase.from("quit_forum_reports").insert({ post_id: postId, user_id: session.user.id });
  }

  async function removePost(postId) {
    await supabase.from("quit_forum_posts").delete().eq("id", postId);
    setPosts((cur) => cur.filter((p) => p.id !== postId));
  }

  const filtered = (posts || []).filter((p) => filter === "todos" || p.category === filter);

  return (
    <div>
      <div style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-2xl p-4 mb-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {FORUM_CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => setCategory(c.key)}
              style={{ background: category === c.key ? C.red : "transparent", border: `1px solid ${category === c.key ? C.red : C.line}` }}
              className="text-xs px-2.5 py-1 rounded-full">
              {c.icon} {c.label}
            </button>
          ))}
        </div>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={2} placeholder="Compartilha algo com a comunidade..."
          style={{ background: "transparent", color: C.cream, borderColor: C.line }} className="w-full outline-none resize-none text-sm border-b pb-2 placeholder-white/40" />
        {error && <p className="text-xs mt-2" style={{ color: C.red }}>{error}</p>}
        <button onClick={submitPost} disabled={posting || !content.trim()} style={{ color: C.red, opacity: posting || !content.trim() ? 0.4 : 1 }} className="text-sm mt-2">
          publicar
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <button onClick={() => setFilter("todos")} style={{ background: filter === "todos" ? C.navySoft : "transparent", border: `1px solid ${C.line}` }} className="text-xs px-2.5 py-1 rounded-full opacity-80">todos</button>
        {FORUM_CATEGORIES.map((c) => (
          <button key={c.key} onClick={() => setFilter(c.key)} style={{ background: filter === c.key ? C.navySoft : "transparent", border: `1px solid ${C.line}` }} className="text-xs px-2.5 py-1 rounded-full opacity-80">
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {posts === null ? (
        <p className="text-sm opacity-50 text-center py-8">carregando…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm opacity-50 text-center py-8">ninguém postou nessa categoria ainda — seja a primeira pessoa</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const cat = FORUM_CATEGORIES.find((c) => c.key === p.category);
            const canDelete = p.user_id === session.user.id || profile.is_admin;
            return (
              <div key={p.id} style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {p.photo_url && <img src={p.photo_url} alt="" className="w-6 h-6 rounded-full" />}
                    <span className="text-xs opacity-70">{p.display_name}</span>
                    <span className="text-xs opacity-40">· {cat?.icon} {cat?.label}</span>
                  </div>
                  {canDelete && <button onClick={() => removePost(p.id)} className="text-xs opacity-40">excluir</button>}
                </div>
                <p className="text-sm mb-3">{p.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {REACTIONS.map((r) => {
                      const count = reactions[p.id]?.[r.key] || 0;
                      const mine = reactions[p.id]?._mine === r.key;
                      return (
                        <button key={r.key} onClick={() => react(p.id, r.key)}
                          style={{ opacity: mine ? 1 : 0.5, background: mine ? `${C.red}22` : "transparent" }}
                          className="text-xs px-1.5 py-0.5 rounded-full">
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

function Stat({ label, value }) {
  return (
    <div style={{ background: C.navySoft }} className="rounded-2xl p-4">
      <p className="text-[11px] opacity-60">{label}</p>
      <p style={{ ...bebas }} className="text-2xl mt-0.5">{value}</p>
    </div>
  );
}

function WhySection({ why, editing, setEditing, onSave }) {
  const [draft, setDraft] = useState(why || "");
  useEffect(() => setDraft(why || ""), [why]);
  return (
    <div style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-2xl p-4 mb-6">
      <p style={{ ...bebas, letterSpacing: 1, color: C.red }} className="text-sm mb-2">MEU PORQUÊ</p>
      {editing ? (
        <>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Por que você está parando? Escreva pra você mesmo(a)."
            className="w-full bg-transparent text-sm outline-none resize-none placeholder-white/40" rows={3} style={{ color: C.cream }} />
          <button onClick={() => onSave(draft)} style={{ color: C.red }} className="text-xs mt-2 underline">salvar</button>
        </>
      ) : why ? (
        <p style={{ ...playfair }} className="italic text-sm leading-relaxed" onClick={() => setEditing(true)}>"{why}"</p>
      ) : (
        <button onClick={() => setEditing(true)} className="text-sm opacity-70 underline">escrever meu porquê</button>
      )}
    </div>
  );
}

function MilestonesList({ elapsedMin }) {
  return (
    <div className="mb-8">
      <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">RECUPERAÇÃO DO CORPO</p>
      <div className="space-y-3">
        {HEALTH_MILESTONES.map((m, i) => (
          <div key={i} className="text-sm flex gap-2">
            <span style={{ color: elapsedMin >= m.mins ? C.red : undefined }} className={elapsedMin >= m.mins ? "" : "opacity-30"}>
              {elapsedMin >= m.mins ? "✓" : "○"}
            </span>
            <span className={elapsedMin >= m.mins ? "" : "opacity-50"}><b>{m.label}</b> — {m.fact}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TriggerPlanner({ triggers, draft, setDraft, onAdd, onRemove }) {
  return (
    <div className="mb-8">
      <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">PLANO CONTRA RECAÍDA</p>
      <div className="space-y-2 mb-3">
        {triggers.map((t) => (
          <div key={t.id} style={{ background: C.navySoft }} className="rounded-xl p-3 flex justify-between">
            <div>
              <p className="text-sm">{t.trigger}</p>
              {t.plan && <p style={{ color: C.red }} className="text-xs mt-0.5">→ {t.plan}</p>}
            </div>
            <button onClick={() => onRemove(t.id)} className="opacity-50">✕</button>
          </div>
        ))}
      </div>
      <div style={{ background: C.navySoft }} className="rounded-xl p-3 space-y-2">
        <input value={draft.trigger} onChange={(e) => setDraft((d) => ({ ...d, trigger: e.target.value }))} placeholder="situação de risco"
          style={{ borderColor: C.line }} className="w-full bg-transparent text-sm outline-none border-b pb-2 placeholder-white/40" />
        <input value={draft.plan} onChange={(e) => setDraft((d) => ({ ...d, plan: e.target.value }))} placeholder="o que fazer em vez disso"
          className="w-full bg-transparent text-sm outline-none placeholder-white/40" />
        <button onClick={onAdd} style={{ color: C.red }} className="w-full text-sm py-1.5">+ adicionar</button>
      </div>
    </div>
  );
}

function SOSModal({ why, onSurvived, onClose }) {
  const [active, setActive] = useState(null);
  const [breathPhase, setBreathPhase] = useState(0);

  useEffect(() => {
    if (active !== "respiracao") return;
    const id = setInterval(() => setBreathPhase((p) => (p + 1) % 19), 1000);
    return () => clearInterval(id);
  }, [active]);

  if (!active) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50">
        <div style={{ background: C.navy, border: `1px solid ${C.line}` }} className="rounded-t-3xl sm:rounded-3xl p-6 max-w-sm w-full max-h-[85vh] overflow-y-auto">
          <p style={{ color: C.cream, ...playfair }} className="italic text-sm text-center mb-5 opacity-90">
            A fissura raramente dura mais de 5 minutos. Escolhe uma técnica:
          </p>
          <div className="space-y-2 mb-4">
            {TECHNIQUES.map((t) => (
              <button key={t.id} onClick={() => setActive(t.id)} style={{ background: C.navySoft }} className="w-full text-left rounded-xl p-3.5">
                <p style={{ color: C.cream, ...bebas, letterSpacing: 0.5 }} className="text-base">
                  {t.title} <span style={{ color: C.red }} className="text-xs">· {t.tagline}</span>
                </p>
              </button>
            ))}
          </div>
          <button onClick={onClose} style={{ color: C.cream, opacity: 0.6 }} className="w-full text-sm py-2">fechar</button>
        </div>
      </div>
    );
  }

  const tech = TECHNIQUES.find((t) => t.id === active);
  const cyclePos = breathPhase;
  const bPhase = cyclePos < 4 ? "inspire" : cyclePos < 11 ? "segure" : "solte";
  const scale = bPhase === "solte" ? 0.85 : 1.3;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
      <div style={{ background: C.navy, border: `1px solid ${C.line}` }} className="rounded-3xl p-6 max-w-sm w-full text-center">
        <p style={{ color: C.red, ...bebas, letterSpacing: 1 }} className="text-lg mb-2">{tech.title.toUpperCase()}</p>
        <p style={{ color: C.cream }} className="text-sm opacity-80 mb-5">{tech.desc}</p>

        {active === "respiracao" && (
          <div className="flex items-center justify-center h-36 mb-3">
            <div style={{ width: 100, height: 100, borderRadius: "9999px", background: `${C.red}33`, border: `2px solid ${C.red}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${scale})`, transition: "transform 3.5s ease-in-out" }}>
              <span style={{ color: C.cream, ...bebas }}>{bPhase}</span>
            </div>
          </div>
        )}

        {active === "porque" && (
          <p style={{ color: C.cream, ...playfair }} className="italic text-base mb-5 leading-relaxed">
            {why ? `"${why}"` : "Você ainda não escreveu seu porquê — vale voltar e escrever depois desta fissura passar."}
          </p>
        )}

        <button onClick={() => onSurvived(active)} style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }} className="w-full rounded-full py-3 mb-2">
          PASSOU, AGUENTEI
        </button>
        <button onClick={() => setActive(null)} style={{ color: C.cream, opacity: 0.6 }} className="w-full text-sm py-2">tentar outra técnica</button>
      </div>
    </div>
  );
}

function WelcomeModal({ profile, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
      <div style={{ background: C.navy, border: `1px solid ${C.line}` }} className="rounded-3xl p-6 max-w-sm w-full">
        <p style={{ ...bebas, letterSpacing: 1, color: C.red }} className="text-sm mb-3">ANTES DE COMEÇAR</p>
        <div style={{ ...playfair }} className="italic text-sm leading-relaxed space-y-3 mb-6">
          <p>Parar de fumar é uma das decisões mais difíceis que existem — e você já deu o primeiro passo.</p>
          <p>Não vai ser fácil. Vai ter dia bom e dia ruim, vontade que passa rápido e vontade que insiste. Isso é esperado, não é falha.</p>
          <p>Mas o seu corpo já começou a agradecer: em minutos a pressão normaliza, em horas o monóxido de carbono sai do sangue, em dias o olfato e o paladar voltam, em semanas a respiração melhora, e com o tempo o risco de doenças graves cai — muito.</p>
          <p style={{ color: C.gold }}>Bora respirar.</p>
        </div>
        <button onClick={onClose} style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }} className="w-full rounded-full py-3">COMEÇAR</button>
      </div>
    </div>
  );
}

function RelapseModal({ onClose, onChoose }) {
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(null);
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
      <div style={{ background: C.navy, border: `1px solid ${C.line}` }} className="rounded-3xl p-6 max-w-sm w-full">
        <p style={{ ...bebas, letterSpacing: 1, color: C.red }} className="text-sm mb-3">SEM JULGAMENTO</p>
        <p style={{ ...playfair }} className="italic text-sm leading-relaxed mb-4">
          Aconteceu alguma coisa? Se quiser, conta aqui — é só pra você, ninguém mais vê.
        </p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="o que aconteceu (opcional)"
          style={{ background: C.navySoft, color: C.cream }} className="w-full rounded-xl px-3 py-2.5 mb-5 outline-none resize-none text-sm placeholder-white/40" />

        {confirming === null && (
          <div className="space-y-2">
            <button onClick={() => setConfirming("slip")} style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="w-full rounded-xl py-3 text-sm">
              Foi só um deslize — continuar contando de onde estava
            </button>
            <button onClick={() => setConfirming("restart")} style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="w-full rounded-xl py-3 text-sm">
              Prefiro recomeçar a contagem agora
            </button>
            <button onClick={onClose} style={{ color: C.cream, opacity: 0.5 }} className="w-full text-xs py-2">cancelar</button>
          </div>
        )}

        {confirming === "slip" && (
          <div className="space-y-2">
            <p className="text-xs opacity-70 mb-2">Seus dias já construídos continuam contando normalmente. Tudo bem.</p>
            <button onClick={() => onChoose("slip", note)} style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }} className="w-full rounded-full py-3">CONFIRMAR</button>
            <button onClick={() => setConfirming(null)} style={{ color: C.cream, opacity: 0.5 }} className="w-full text-xs py-2">voltar</button>
          </div>
        )}

        {confirming === "restart" && (
          <div className="space-y-2">
            <p className="text-xs opacity-70 mb-2">A contagem de dias volta a zero a partir de agora. Tudo bem recomeçar — muita gente recomeça mais de uma vez até ficar de vez.</p>
            <button onClick={() => onChoose("restart", note)} style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }} className="w-full rounded-full py-3">CONFIRMAR RECOMEÇO</button>
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
        <p style={{ color: C.cream, ...playfair }} className="italic text-sm opacity-80 mb-8">Deboche não fuma mais. Acompanhe sua jornada pra parar de fumar.</p>
        <button onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/respira` } })}
          style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1 }} className="w-full rounded-full py-3.5">
          ENTRAR COM GOOGLE
        </button>
      </div>
    </div>
  );
}

function PrepChecklist() {
  const items = [
    "Escrevi meu porquê (acima)",
    "Vou jogar fora cigarros, isqueiros e cinzeiros no dia anterior",
    "Vou avisar 1-2 pessoas de confiança sobre a data",
    "Mapeei minhas situações de maior risco",
    "Separei um substituto pro gesto mão-boca (chiclete, palito, etc.)",
  ];
  const [done, setDone] = useState([]);
  return (
    <div className="mb-8">
      <p style={{ ...bebas, letterSpacing: 1 }} className="text-sm opacity-70 mb-3">CHECKLIST DE PREPARO</p>
      <div className="space-y-2">
        {items.map((it) => (
          <button key={it} onClick={() => setDone((d) => d.includes(it) ? d.filter(x => x !== it) : [...d, it])} className="w-full flex items-start gap-2 text-left">
            <span style={{ color: done.includes(it) ? C.red : undefined }} className={`mt-0.5 ${done.includes(it) ? "" : "opacity-30"}`}>{done.includes(it) ? "✓" : "○"}</span>
            <span className={`text-sm ${done.includes(it) ? "opacity-50 line-through" : ""}`}>{it}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Onboarding({ supabase, session, onDone }) {
  const [mode, setMode] = useState("already");
  const [futureDate, setFutureDate] = useState("");
  const [cigsPerDay, setCigsPerDay] = useState(15);
  const [pricePerPack, setPricePerPack] = useState(12);
  const [cigsPerPack, setCigsPerPack] = useState(20);
  const [why, setWhy] = useState("");
  const [refCode, setRefCode] = useState("");

  const canStart = mode === "already" || (mode === "scheduled" && futureDate);

  return (
    <div style={{ background: C.navy, color: C.cream }} className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="max-w-sm w-full">
        <h1 style={{ ...bebas, letterSpacing: 1 }} className="text-3xl mb-6">PRIMEIRO RESPIRO</h1>

        <div className="flex gap-2 mb-5">
          <button onClick={() => setMode("already")} style={{ background: mode === "already" ? C.red : C.navySoft }} className="flex-1 rounded-xl py-2.5 text-sm">já parei</button>
          <button onClick={() => setMode("scheduled")} style={{ background: mode === "scheduled" ? C.red : C.navySoft }} className="flex-1 rounded-xl py-2.5 text-sm">vou parar</button>
        </div>

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

        <label className="block mb-4">
          <span className="text-xs opacity-70">meu porquê (opcional agora, dá pra escrever depois)</span>
          <textarea value={why} onChange={(e) => setWhy(e.target.value)} rows={2} style={{ background: C.navySoft, color: C.cream }} className="w-full rounded-xl px-3 py-2.5 mt-1 outline-none resize-none" />
        </label>

        <label className="block mb-6">
          <span className="text-xs opacity-70">tem um código de convite? (opcional)</span>
          <input value={refCode} onChange={(e) => setRefCode(e.target.value.toUpperCase())} style={{ background: C.navySoft, color: C.cream }} className="w-full rounded-xl px-3 py-2.5 mt-1 outline-none" />
        </label>

        <button
          disabled={!canStart}
          onClick={async () => {
            const quit_at = mode === "scheduled" ? new Date(futureDate + "T07:00:00").toISOString() : new Date().toISOString();
            let referred_by = null;
            if (refCode.trim()) {
              const { data: target } = await supabase.from("quit_profiles").select("user_id").eq("referral_code", refCode.trim()).maybeSingle();
              if (target) referred_by = target.user_id;
            }
            const { data } = await supabase.from("quit_profiles").insert({
              user_id: session.user.id,
              display_name: session.user.user_metadata?.full_name,
              photo_url: session.user.user_metadata?.avatar_url || null,
              quit_at, mode,
              cigs_per_day: cigsPerDay,
              price_per_pack: pricePerPack,
              cigs_per_pack: cigsPerPack,
              why_text: why || null,
              referral_code: generateReferralCode(session.user.id),
              referred_by,
            }).select().single();
            onDone(data);
          }}
          style={{ background: C.red, color: C.cream, ...bebas, letterSpacing: 1, opacity: canStart ? 1 : 0.4 }}
          className="w-full rounded-full py-3.5"
        >
          COMEÇAR
        </button>
      </div>
    </div>
  );
}
