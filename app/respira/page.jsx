"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

// ---- Fontes da marca ----
function useBrandFonts() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
}

// ---- Tokens da marca (ajustar se divergir do repo) ----
const C = {
  cream: "#F5EFE4",
  navy: "#101B2D",
  navySoft: "#1B2A42",
  red: "#C63B32",
  redSoft: "#E8544A",
  line: "#2A3B57",
};

const MILESTONES = [
  { mins: 20, label: "20 minutos", fact: "Frequência cardíaca e pressão arterial começam a normalizar." },
  { mins: 12 * 60, label: "12 horas", fact: "O nível de monóxido de carbono no sangue volta ao normal." },
  { mins: 24 * 60, label: "24 horas", fact: "O risco de infarto já começa a cair." },
  { mins: 48 * 60, label: "48 horas", fact: "Terminações nervosas se regeneram — olfato e paladar melhoram." },
  { mins: 72 * 60, label: "72 horas", fact: "Nicotina eliminada do corpo. Respirar fica mais fácil." },
  { mins: 14 * 24 * 60, label: "2 semanas", fact: "Circulação e função pulmonar melhoram visivelmente." },
  { mins: 30 * 24 * 60, label: "1 mês", fact: "Cílios pulmonares se regeneram — menos tosse, menos infecção." },
  { mins: 90 * 24 * 60, label: "3 meses", fact: "Função pulmonar sobe até 30%. Respirar fundo fica bem mais fácil." },
  { mins: 365 * 24 * 60, label: "1 ano", fact: "Risco de doença cardíaca cai pela metade em relação a quem fuma." },
  { mins: 5 * 365 * 24 * 60, label: "5 anos", fact: "Risco de AVC se aproxima do de quem nunca fumou." },
  { mins: 10 * 365 * 24 * 60, label: "10 anos", fact: "Risco de morte por câncer de pulmão cai pela metade." },
];

// Técnicas para a fissura — cada uma é um jeito diferente de atravessar os ~5 minutos que ela dura
const TECHNIQUES = [
  {
    id: "respiracao",
    title: "Respiração 4-7-8",
    tagline: "acalma o corpo",
    desc: "Inspire 4s, segure 7s, solte 8s. Repita 4 vezes. Ativa o sistema nervoso que desliga o alarme da fissura.",
  },
  {
    id: "onda",
    title: "Surfar a onda",
    tagline: "deixa passar",
    desc: "A fissura sobe, bate no pico e desce sozinha — geralmente em menos de 5 minutos. Não precisa lutar contra ela, só não alimentar. Observe sem agir.",
  },
  {
    id: "halt",
    title: "Checagem HALT",
    tagline: "acha a causa real",
    desc: "Pergunte: estou com Fome, com raiva (Angry), Sozinho(a) ou Cansado(a)? Muita fissura é na verdade uma dessas quatro coisas disfarçada.",
  },
  {
    id: "movimento",
    title: "Mexer o corpo",
    tagline: "muda o estado",
    desc: "Uma caminhada rápida de 2 minutos, sobe e desce de escada, ou só levantar e espreguiçar. Muda a química do corpo mais rápido que parece.",
  },
  {
    id: "contato",
    title: "Chamar alguém",
    tagline: "não segura sozinho",
    desc: "Manda uma mensagem pra alguém que sabe que você tá parando. Só o ato de contar já tira força da vontade.",
  },
  {
    id: "boca",
    title: "Ocupar a boca",
    tagline: "satisfaz o gesto",
    desc: "Água gelada, chiclete sem açúcar, uma fruta ácida, um palito. O gesto mão-boca também pede colo, não só a nicotina.",
  },
  {
    id: "porque",
    title: "Ler meu porquê",
    tagline: "lembra o motivo",
    desc: "Reveja por que você começou essa parada. É o argumento mais forte que existe — mais forte que qualquer fissura de 5 minutos.",
  },
];

const STORAGE_KEY_TECH = "respira-last-technique";

export default function RespiraPage() {
  useBrandFonts();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(undefined);
  const [triggers, setTriggers] = useState([]);
  const [cravingsSurvived, setCravingsSurvived] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [sosOpen, setSosOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [triggerDraft, setTriggerDraft] = useState({ trigger: "", plan: "" });
  const [editingWhy, setEditingWhy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const uid = session.user.id;
      const { data: p } = await supabase.from("quit_profiles").select("*").eq("user_id", uid).maybeSingle();
      setProfile(p ?? null);
      const { data: t } = await supabase.from("quit_triggers").select("*").eq("user_id", uid).order("created_at");
      setTriggers(t ?? []);
      const { count } = await supabase
        .from("quit_cravings")
        .select("*", { count: "exact", head: true })
        .eq("user_id", uid)
        .eq("survived", true);
      setCravingsSurvived(count ?? 0);
    })();
  }, [session, supabase]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (session === undefined || (session && profile === undefined)) {
    return (
      <div style={{ background: C.navy }} className="min-h-screen flex items-center justify-center">
        <span style={{ color: C.cream, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2 }} className="text-2xl">
          carregando…
        </span>
      </div>
    );
  }

  if (!session) return <LoginScreen supabase={supabase} />;
  if (!profile) return <Onboarding supabase={supabase} session={session} onDone={setProfile} />;

  const quitAt = new Date(profile.quit_at).getTime();
  const isFuture = profile.mode === "scheduled" && quitAt > now;

  return (
    <div style={{ background: C.navy, color: C.cream }} className="min-h-screen" >
      <SiteHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} onSignOut={() => supabase.auth.signOut()} />

      <div className="max-w-md mx-auto px-5 pb-28 pt-6">
        {isFuture ? (
          <CountdownView quitAt={quitAt} now={now} profile={profile} />
        ) : (
          <CountUpView quitAt={quitAt} now={now} profile={profile} cravingsSurvived={cravingsSurvived} />
        )}

        <WhySection
          why={profile.why_text}
          editing={editingWhy}
          setEditing={setEditingWhy}
          onSave={async (text) => {
            await supabase.from("quit_profiles").update({ why_text: text }).eq("user_id", session.user.id);
            setProfile((p) => ({ ...p, why_text: text }));
            setEditingWhy(false);
          }}
        />

        {!isFuture && <MilestonesList elapsedMin={Math.max(0, (now - quitAt) / 60000)} />}

        <TriggerPlanner
          triggers={triggers}
          draft={triggerDraft}
          setDraft={setTriggerDraft}
          onAdd={async () => {
            if (!triggerDraft.trigger.trim()) return;
            const { data } = await supabase
              .from("quit_triggers")
              .insert({ user_id: session.user.id, trigger: triggerDraft.trigger, plan: triggerDraft.plan })
              .select()
              .single();
            setTriggers((cur) => [...cur, data]);
            setTriggerDraft({ trigger: "", plan: "" });
          }}
          onRemove={async (id) => {
            await supabase.from("quit_triggers").delete().eq("id", id);
            setTriggers((cur) => cur.filter((t) => t.id !== id));
          }}
        />
      </div>

      <button
        onClick={() => setSosOpen(true)}
        style={{ background: C.red, color: C.cream, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 1 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 px-7 py-3.5 rounded-full shadow-lg shadow-black/40 text-lg active:scale-95 transition-transform"
      >
        BATEU A VONTADE
      </button>

      {sosOpen && (
        <SOSModal
          why={profile.why_text}
          onSurvived={async (technique) => {
            await supabase.from("quit_cravings").insert({ user_id: session.user.id, survived: true, technique });
            setCravingsSurvived((c) => c + 1);
            setSosOpen(false);
          }}
          onClose={() => setSosOpen(false)}
        />
      )}
    </div>
  );
}

// ---------- Header no estilo do site ----------
function SiteHeader({ menuOpen, setMenuOpen, onSignOut }) {
  const navItems = [
    { label: "Manifesto", href: "https://www.obicha.com.br/#manifesto" },
    { label: "Produtos", href: "https://www.obicha.com.br/#produtos" },
    { label: "Blog", href: "https://www.obicha.com.br/blog" },
    { label: "Respira", href: "/respira", active: true },
    { label: "Projeto Social", href: "https://www.obicha.com.br/projeto-social" },
  ];
  return (
    <header style={{ borderBottom: `1px solid ${C.line}` }} className="sticky top-0 z-40" >
      <div style={{ background: C.navy }} className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
        <a href="https://www.obicha.com.br" style={{ fontFamily: "Bebas Neue, sans-serif", color: C.cream }} className="text-xl tracking-wide">
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
                <a
                  key={item.label}
                  href={item.href}
                  style={{
                    fontFamily: "Bebas Neue, sans-serif",
                    color: item.active ? C.red : C.cream,
                    letterSpacing: 1,
                  }}
                  className="text-2xl"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto">
              <button onClick={onSignOut} style={{ color: C.cream, opacity: 0.6 }} className="text-sm underline">
                sair da conta
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// ---------- Modo "já parei": contagem crescente ----------
function CountUpView({ quitAt, now, profile, cravingsSurvived }) {
  const elapsedMin = Math.max(0, (now - quitAt) / 60000);
  const days = Math.floor(elapsedMin / 1440);
  const hours = Math.floor((elapsedMin % 1440) / 60);
  const mins = Math.floor(elapsedMin % 60);
  const cigsAvoided = (elapsedMin / 1440) * profile.cigs_per_day;
  const moneySaved = (cigsAvoided / profile.cigs_per_pack) * profile.price_per_pack;
  const nextMilestone = MILESTONES.find((m) => m.mins > elapsedMin);

  return (
    <>
      <div className="text-center mb-2">
        <p style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "5rem", lineHeight: 0.9, color: C.cream }}>{days}</p>
        <p style={{ fontFamily: "Playfair Display, serif" }} className="italic text-sm opacity-80">
          dia{days !== 1 ? "s" : ""} sem fumar
        </p>
        <p className="text-xs opacity-60 mt-1 font-mono">
          {String(hours).padStart(2, "0")}h {String(mins).padStart(2, "0")}m
        </p>
      </div>
      {nextMilestone && (
        <p className="text-center text-xs opacity-70 mb-6">
          próxima marca: <span style={{ color: C.red }}>{nextMilestone.label}</span>
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Stat label="cigarros evitados" value={Math.floor(cigsAvoided)} />
        <Stat label="economizado" value={`R$ ${moneySaved.toFixed(0)}`} />
        <Stat label="fissuras vencidas" value={cravingsSurvived} />
        <Stat label="cigarros/dia antes" value={profile.cigs_per_day} />
      </div>
    </>
  );
}

// ---------- Modo "vou parar": contagem regressiva + preparo ----------
function CountdownView({ quitAt, now, profile }) {
  const remainMin = Math.max(0, (quitAt - now) / 60000);
  const days = Math.floor(remainMin / 1440);
  const hours = Math.floor((remainMin % 1440) / 60);
  const mins = Math.floor(remainMin % 60);

  const prep = [
    "Escolha o motivo que vai te sustentar (preencha 'meu porquê' abaixo)",
    "Jogue fora cigarros, isqueiros e cinzeiros no dia anterior",
    "Avise 1-2 pessoas de confiança sobre a data",
    "Mapeie suas 2-3 situações de maior risco (seção de gatilhos abaixo)",
    "Separe chiclete sem açúcar ou algo pra ocupar a boca",
  ];

  return (
    <>
      <div className="text-center mb-2">
        <p style={{ fontFamily: "Playfair Display, serif" }} className="italic text-sm opacity-80 mb-1">
          faltam
        </p>
        <p style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "4rem", lineHeight: 0.9, color: C.red }}>
          {days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m`}
        </p>
        <p style={{ fontFamily: "Playfair Display, serif" }} className="italic text-sm opacity-80 mt-1">
          pra parar de fumar
        </p>
      </div>
      <div style={{ background: C.navySoft }} className="rounded-2xl p-4 mb-8 mt-6">
        <p style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: 1 }} className="text-sm mb-3 opacity-80">
          CHECKLIST DE PREPARO
        </p>
        <ul className="space-y-2">
          {prep.map((item, i) => (
            <li key={i} className="text-sm flex gap-2">
              <span style={{ color: C.red }}>✦</span>
              <span className="opacity-90">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ background: C.navySoft }} className="rounded-2xl p-4">
      <p className="text-[11px] opacity-60">{label}</p>
      <p style={{ fontFamily: "Bebas Neue, sans-serif" }} className="text-2xl mt-0.5">{value}</p>
    </div>
  );
}

function WhySection({ why, editing, setEditing, onSave }) {
  const [draft, setDraft] = useState(why || "");
  useEffect(() => setDraft(why || ""), [why]);

  return (
    <div style={{ background: C.navySoft, border: `1px solid ${C.line}` }} className="rounded-2xl p-4 mb-8">
      <p style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: 1, color: C.red }} className="text-sm mb-2">
        MEU PORQUÊ
      </p>
      {editing ? (
        <>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Por que você está parando? Escreva pra você mesmo(a) — isso é o que você vai ler quando bater a vontade."
            className="w-full bg-transparent text-sm outline-none resize-none placeholder-white/40"
            rows={3}
            style={{ color: C.cream }}
          />
          <button onClick={() => onSave(draft)} style={{ color: C.red }} className="text-xs mt-2 underline">
            salvar
          </button>
        </>
      ) : why ? (
        <p style={{ fontFamily: "Playfair Display, serif" }} className="italic text-sm leading-relaxed" onClick={() => setEditing(true)}>
          "{why}"
        </p>
      ) : (
        <button onClick={() => setEditing(true)} className="text-sm opacity-70 underline">
          escrever meu porquê
        </button>
      )}
    </div>
  );
}

function MilestonesList({ elapsedMin }) {
  return (
    <div className="mb-8">
      <p style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: 1 }} className="text-sm opacity-70 mb-3">
        RECUPERAÇÃO DO CORPO
      </p>
      <div className="space-y-3">
        {MILESTONES.map((m, i) => (
          <div key={i} className="text-sm flex gap-2">
            <span style={{ color: elapsedMin >= m.mins ? C.red : undefined }} className={elapsedMin >= m.mins ? "" : "opacity-30"}>
              {elapsedMin >= m.mins ? "✓" : "○"}
            </span>
            <span className={elapsedMin >= m.mins ? "" : "opacity-50"}>
              <b>{m.label}</b> — {m.fact}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TriggerPlanner({ triggers, draft, setDraft, onAdd, onRemove }) {
  return (
    <div className="mb-8">
      <p style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: 1 }} className="text-sm opacity-70 mb-3">
        PLANO CONTRA RECAÍDA
      </p>
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
        <input
          value={draft.trigger}
          onChange={(e) => setDraft((d) => ({ ...d, trigger: e.target.value }))}
          placeholder="situação de risco"
          style={{ borderColor: C.line }}
          className="w-full bg-transparent text-sm outline-none border-b pb-2 placeholder-white/40"
        />
        <input
          value={draft.plan}
          onChange={(e) => setDraft((d) => ({ ...d, plan: e.target.value }))}
          placeholder="o que fazer em vez disso"
          className="w-full bg-transparent text-sm outline-none placeholder-white/40"
        />
        <button onClick={onAdd} style={{ color: C.red }} className="w-full text-sm py-1.5">
          + adicionar
        </button>
      </div>
    </div>
  );
}

// ---------- SOS: agora com 7 técnicas em vez de só respiração ----------
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
          <p style={{ color: C.cream, fontFamily: "Playfair Display, serif" }} className="italic text-sm text-center mb-5 opacity-90">
            A fissura raramente dura mais de 5 minutos. Escolhe uma técnica:
          </p>
          <div className="space-y-2 mb-4">
            {TECHNIQUES.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                style={{ background: C.navySoft }}
                className="w-full text-left rounded-xl p-3.5"
              >
                <p style={{ color: C.cream, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 0.5 }} className="text-base">
                  {t.title} <span style={{ color: C.red }} className="text-xs">· {t.tagline}</span>
                </p>
              </button>
            ))}
          </div>
          <button onClick={onClose} style={{ color: C.cream, opacity: 0.6 }} className="w-full text-sm py-2">
            fechar
          </button>
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
        <p style={{ color: C.red, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 1 }} className="text-lg mb-2">
          {tech.title.toUpperCase()}
        </p>
        <p style={{ color: C.cream }} className="text-sm opacity-80 mb-5">{tech.desc}</p>

        {active === "respiracao" && (
          <div className="flex items-center justify-center h-36 mb-3">
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "9999px",
                background: `${C.red}33`,
                border: `2px solid ${C.red}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${scale})`,
                transition: "transform 3.5s ease-in-out",
              }}
            >
              <span style={{ color: C.cream, fontFamily: "Bebas Neue, sans-serif" }}>{bPhase}</span>
            </div>
          </div>
        )}

        {active === "porque" && (
          <p style={{ color: C.cream, fontFamily: "Playfair Display, serif" }} className="italic text-base mb-5 leading-relaxed">
            {why ? `"${why}"` : "Você ainda não escreveu seu porquê — vale voltar e escrever depois desta fissura passar."}
          </p>
        )}

        <button
          onClick={() => onSurvived(active)}
          style={{ background: C.red, color: C.cream, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 1 }}
          className="w-full rounded-full py-3 mb-2"
        >
          PASSOU, AGUENTEI
        </button>
        <button onClick={() => setActive(null)} style={{ color: C.cream, opacity: 0.6 }} className="w-full text-sm py-2">
          tentar outra técnica
        </button>
      </div>
    </div>
  );
}

function LoginScreen({ supabase }) {
  return (
    <div style={{ background: C.navy }} className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <p style={{ fontFamily: "Bebas Neue, sans-serif", color: C.cream, letterSpacing: 2 }} className="text-lg mb-1">
          Ô BICHA<span style={{ color: C.red }}>!</span>
        </p>
        <h1 style={{ fontFamily: "Bebas Neue, sans-serif", color: C.cream, letterSpacing: 1 }} className="text-5xl mb-3">
          RESPIRA
        </h1>
        <p style={{ color: C.cream, fontFamily: "Playfair Display, serif" }} className="italic text-sm opacity-80 mb-8">
          Deboche não fuma mais. Acompanhe sua jornada pra parar de fumar.
        </p>
        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/respira` } })
          }
          style={{ background: C.red, color: C.cream, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 1 }}
          className="w-full rounded-full py-3.5"
        >
          ENTRAR COM GOOGLE
        </button>
      </div>
    </div>
  );
}

function Onboarding({ supabase, session, onDone }) {
  const [mode, setMode] = useState("already"); // already | scheduled
  const [futureDate, setFutureDate] = useState("");
  const [cigsPerDay, setCigsPerDay] = useState(15);
  const [pricePerPack, setPricePerPack] = useState(12);
  const [cigsPerPack, setCigsPerPack] = useState(20);
  const [why, setWhy] = useState("");

  const canStart = mode === "already" || (mode === "scheduled" && futureDate);

  return (
    <div style={{ background: C.navy, color: C.cream }} className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="max-w-sm w-full">
        <h1 style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: 1 }} className="text-3xl mb-6">
          PRIMEIRO RESPIRO
        </h1>

        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setMode("already")}
            style={{ background: mode === "already" ? C.red : C.navySoft }}
            className="flex-1 rounded-xl py-2.5 text-sm"
          >
            já parei
          </button>
          <button
            onClick={() => setMode("scheduled")}
            style={{ background: mode === "scheduled" ? C.red : C.navySoft }}
            className="flex-1 rounded-xl py-2.5 text-sm"
          >
            vou parar
          </button>
        </div>

        {mode === "scheduled" && (
          <label className="block mb-4">
            <span className="text-xs opacity-70">data que vai parar</span>
            <input
              type="date"
              value={futureDate}
              onChange={(e) => setFutureDate(e.target.value)}
              style={{ background: C.navySoft, color: C.cream }}
              className="w-full rounded-xl px-3 py-2.5 mt-1 outline-none"
            />
          </label>
        )}

        {[
          ["cigarros por dia", cigsPerDay, setCigsPerDay],
          ["preço do maço (R$)", pricePerPack, setPricePerPack],
          ["cigarros por maço", cigsPerPack, setCigsPerPack],
        ].map(([label, val, set]) => (
          <label key={label} className="block mb-4">
            <span className="text-xs opacity-70">{label}</span>
            <input
              type="number"
              value={val}
              onChange={(e) => set(Number(e.target.value))}
              style={{ background: C.navySoft, color: C.cream }}
              className="w-full rounded-xl px-3 py-2.5 mt-1 outline-none font-mono"
            />
          </label>
        ))}

        <label className="block mb-6">
          <span className="text-xs opacity-70">meu porquê (opcional agora, dá pra escrever depois)</span>
          <textarea
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            rows={2}
            style={{ background: C.navySoft, color: C.cream }}
            className="w-full rounded-xl px-3 py-2.5 mt-1 outline-none resize-none"
          />
        </label>

        <button
          disabled={!canStart}
          onClick={async () => {
            const quit_at =
              mode === "scheduled" ? new Date(futureDate + "T07:00:00").toISOString() : new Date().toISOString();
            const { data } = await supabase
              .from("quit_profiles")
              .insert({
                user_id: session.user.id,
                display_name: session.user.user_metadata?.full_name,
                quit_at,
                mode,
                cigs_per_day: cigsPerDay,
                price_per_pack: pricePerPack,
                cigs_per_pack: cigsPerPack,
                why_text: why || null,
              })
              .select()
              .single();
            onDone(data);
          }}
          style={{ background: C.red, color: C.cream, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 1, opacity: canStart ? 1 : 0.4 }}
          className="w-full rounded-full py-3.5"
        >
          COMEÇAR
        </button>
      </div>
    </div>
  );
}
