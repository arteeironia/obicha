"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const MILESTONES = [
  { mins: 20, label: "20 minutos", fact: "Frequência cardíaca e pressão arterial começam a normalizar." },
  { mins: 12 * 60, label: "12 horas", fact: "O nível de monóxido de carbono no sangue volta ao normal." },
  { mins: 24 * 60, label: "24 horas", fact: "O risco de infarto já começa a cair." },
  { mins: 48 * 60, label: "48 horas", fact: "Terminações nervosas se regeneram — olfato e paladar melhoram." },
  { mins: 72 * 60, label: "72 horas", fact: "Nicotina eliminada do corpo. Respirar fica mais fácil." },
  { mins: 14 * 24 * 60, label: "2 semanas", fact: "Circulação e função pulmonar melhoram visivelmente." },
  { mins: 30 * 24 * 60, label: "1 mês", fact: "Cílios pulmonares se regeneram — menos tosse, menos infecção." },
  { mins: 365 * 24 * 60, label: "1 ano", fact: "Risco de doença cardíaca cai pela metade em relação a quem fuma." },
  { mins: 5 * 365 * 24 * 60, label: "5 anos", fact: "Risco de AVC se aproxima do de quem nunca fumou." },
  { mins: 10 * 365 * 24 * 60, label: "10 anos", fact: "Risco de morte por câncer de pulmão cai pela metade." },
];

export default function RespiraPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState(undefined); // undefined = carregando, null = deslogado
  const [profile, setProfile] = useState(undefined);
  const [triggers, setTriggers] = useState([]);
  const [cravingsSurvived, setCravingsSurvived] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [sosOpen, setSosOpen] = useState(false);
  const [triggerDraft, setTriggerDraft] = useState({ trigger: "", plan: "" });

  // auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  // carregar dados do usuário
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
    return <div className="min-h-screen bg-[#0A1612] flex items-center justify-center text-[#4FD1C5]">carregando…</div>;
  }

  if (!session) {
    return <LoginScreen supabase={supabase} />;
  }

  if (!profile) {
    return (
      <Onboarding
        onStart={async (form) => {
          const uid = session.user.id;
          const { data } = await supabase
            .from("quit_profiles")
            .insert({ user_id: uid, display_name: session.user.user_metadata?.full_name, ...form })
            .select()
            .single();
          setProfile(data);
        }}
      />
    );
  }

  const quitAt = new Date(profile.quit_at).getTime();
  const elapsedMin = Math.max(0, (now - quitAt) / 60000);
  const days = Math.floor(elapsedMin / 1440);
  const cigsAvoided = (elapsedMin / 1440) * profile.cigs_per_day;
  const moneySaved = (cigsAvoided / profile.cigs_per_pack) * profile.price_per_pack;
  const nextMilestone = MILESTONES.find((m) => m.mins > elapsedMin);

  return (
    <div className="min-h-screen bg-[#0A1612] text-[#E8F3EF] px-5 py-8" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-[#7FA396]">olá, {session.user.user_metadata?.full_name?.split(" ")[0] || "por aí"}</span>
          <button onClick={() => supabase.auth.signOut()} className="text-xs text-[#7FA396] underline">sair</button>
        </div>

        <div className="text-center mb-6">
          <p className="text-6xl font-semibold" style={{ fontFamily: "Fraunces, serif" }}>{days}</p>
          <p className="text-sm text-[#7FA396]">dias sem fumar</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#12211C] rounded-2xl p-4">
            <p className="text-[11px] text-[#7FA396]">cigarros evitados</p>
            <p className="font-mono text-xl">{Math.floor(cigsAvoided)}</p>
          </div>
          <div className="bg-[#12211C] rounded-2xl p-4">
            <p className="text-[11px] text-[#7FA396]">economizado</p>
            <p className="font-mono text-xl">R$ {moneySaved.toFixed(0)}</p>
          </div>
          <div className="bg-[#12211C] rounded-2xl p-4">
            <p className="text-[11px] text-[#7FA396]">fissuras vencidas</p>
            <p className="font-mono text-xl">{cravingsSurvived}</p>
          </div>
          <div className="bg-[#12211C] rounded-2xl p-4">
            <p className="text-[11px] text-[#7FA396]">próxima marca</p>
            <p className="text-sm text-[#4FD1C5] mt-1">{nextMilestone?.label ?? "todas atingidas!"}</p>
          </div>
        </div>

        <h2 className="text-sm text-[#7FA396] mb-3">recuperação do corpo</h2>
        <div className="space-y-3 mb-8">
          {MILESTONES.map((m, i) => (
            <div key={i} className={`text-sm ${elapsedMin >= m.mins ? "text-[#E8F3EF]" : "text-[#7FA396]/60"}`}>
              <span className="text-[#4FD1C5]">{elapsedMin >= m.mins ? "✓" : "○"}</span> {m.label} — {m.fact}
            </div>
          ))}
        </div>

        <h2 className="text-sm text-[#7FA396] mb-3">plano contra recaída</h2>
        <div className="space-y-2 mb-3">
          {triggers.map((t) => (
            <div key={t.id} className="bg-[#12211C] rounded-xl p-3 flex justify-between">
              <div>
                <p className="text-sm">{t.trigger}</p>
                {t.plan && <p className="text-xs text-[#4FD1C5]">→ {t.plan}</p>}
              </div>
              <button
                onClick={async () => {
                  await supabase.from("quit_triggers").delete().eq("id", t.id);
                  setTriggers((cur) => cur.filter((x) => x.id !== t.id));
                }}
                className="text-[#7FA396]"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="bg-[#12211C] rounded-xl p-3 space-y-2 mb-8">
          <input
            value={triggerDraft.trigger}
            onChange={(e) => setTriggerDraft((d) => ({ ...d, trigger: e.target.value }))}
            placeholder="situação de risco"
            className="w-full bg-transparent text-sm outline-none border-b border-[#1D2E28] pb-2 placeholder-[#7FA396]/60"
          />
          <input
            value={triggerDraft.plan}
            onChange={(e) => setTriggerDraft((d) => ({ ...d, plan: e.target.value }))}
            placeholder="o que fazer em vez disso"
            className="w-full bg-transparent text-sm outline-none placeholder-[#7FA396]/60"
          />
          <button
            onClick={async () => {
              if (!triggerDraft.trigger.trim()) return;
              const { data } = await supabase
                .from("quit_triggers")
                .insert({ user_id: session.user.id, trigger: triggerDraft.trigger, plan: triggerDraft.plan })
                .select()
                .single();
              setTriggers((cur) => [...cur, data]);
              setTriggerDraft({ trigger: "", plan: "" });
            }}
            className="w-full text-[#4FD1C5] text-sm py-1.5"
          >
            + adicionar
          </button>
        </div>
      </div>

      <button
        onClick={() => setSosOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#E85D4C] text-[#0A1612] font-semibold px-6 py-3.5 rounded-full"
      >
        Bateu a vontade
      </button>

      {sosOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
          <div className="bg-[#0A1612] border border-[#1D2E28] rounded-3xl p-6 max-w-sm w-full text-center">
            <p className="text-[#7FA396] text-sm mb-6">A fissura raramente dura mais de 5 minutos. Respira fundo: 4s inspirando, 7s segurando, 8s soltando.</p>
            <button
              onClick={async () => {
                await supabase.from("quit_cravings").insert({ user_id: session.user.id, survived: true });
                setCravingsSurvived((c) => c + 1);
                setSosOpen(false);
              }}
              className="w-full bg-[#4FD1C5] text-[#0A1612] font-semibold rounded-full py-3 mb-2"
            >
              Passou, aguentei
            </button>
            <button onClick={() => setSosOpen(false)} className="w-full text-[#7FA396] text-sm py-2">fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function LoginScreen({ supabase }) {
  return (
    <div className="min-h-screen bg-[#0A1612] flex items-center justify-center px-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-sm w-full text-center">
        <h1 className="text-3xl text-[#E8F3EF] mb-3" style={{ fontFamily: "Fraunces, serif" }}>Respira</h1>
        <p className="text-[#7FA396] text-sm mb-8">Acompanhe sua jornada pra parar de fumar. Um projeto da Ô Bicha.</p>
        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: `${window.location.origin}/respira` },
            })
          }
          className="w-full bg-[#4FD1C5] text-[#0A1612] font-semibold rounded-full py-3.5"
        >
          Entrar com Google
        </button>
      </div>
    </div>
  );
}

function Onboarding({ onStart }) {
  const [cigsPerDay, setCigsPerDay] = useState(15);
  const [pricePerPack, setPricePerPack] = useState(12);
  const [cigsPerPack, setCigsPerPack] = useState(20);

  return (
    <div className="min-h-screen bg-[#0A1612] flex items-center justify-center px-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-sm w-full text-[#E8F3EF]">
        <h1 className="text-2xl mb-6" style={{ fontFamily: "Fraunces, serif" }}>Primeiro respiro</h1>
        {[
          ["cigarros por dia", cigsPerDay, setCigsPerDay],
          ["preço do maço (R$)", pricePerPack, setPricePerPack],
          ["cigarros por maço", cigsPerPack, setCigsPerPack],
        ].map(([label, val, set]) => (
          <label key={label} className="block mb-4">
            <span className="text-xs text-[#7FA396]">{label}</span>
            <input
              type="number"
              value={val}
              onChange={(e) => set(Number(e.target.value))}
              className="w-full bg-[#12211C] rounded-xl px-3 py-2.5 mt-1 outline-none font-mono"
            />
          </label>
        ))}
        <button
          onClick={() =>
            onStart({
              quit_at: new Date().toISOString(),
              cigs_per_day: cigsPerDay,
              price_per_pack: pricePerPack,
              cigs_per_pack: cigsPerPack,
            })
          }
          className="w-full bg-[#4FD1C5] text-[#0A1612] font-semibold rounded-full py-3.5 mt-2"
        >
          Começar agora
        </button>
      </div>
    </div>
  );
}
