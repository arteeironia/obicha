"use client";

import { useEffect, useState } from "react";

function localRecord(key) {
  try {
    const save = JSON.parse(localStorage.getItem(key));
    const best = Math.max(0, (save?.level ?? 1) - 1, save?.best ?? 0);
    return Number.isInteger(best) && best <= 100000 ? best : 0;
  } catch { return 0; }
}

export default function SetasRanking({ getToken, onClose }) {
  const [board, setBoard] = useState(null);
  const [mode, setMode] = useState("classic");
  const [nickname, setNickname] = useState("");
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");
  const [record] = useState(() => ({
    classic: localRecord("setas-soltas-save-v2"),
    extreme: localRecord("setas-soltas-extreme-v1"),
  }));

  async function request(body) {
    const token = await getToken();
    const response = await fetch("/api/respira/setas-ranking", {
      method: body ? "POST" : "GET",
      headers: { Authorization: "Bearer " + (token || ""), ...(body && { "Content-Type": "application/json" }) },
      ...(body && { body: JSON.stringify(body) }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "O ranking está indisponível agora.");
    return data;
  }

  useEffect(() => {
    let active = true;
    request().then((data) => {
      if (!active) return;
      setBoard(data);
      setNickname(data.own?.nickname || "");
    }).catch(() => {
      if (active) setMessage("Não foi possível carregar o ranking.");
    }).finally(() => {
      if (active) setBusy(false);
    });
    return () => { active = false; };
  // A fresh scoreboard is loaded whenever the panel opens.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function update(action) {
    setBusy(true);
    setMessage("");
    try {
      await request({ action, nickname, ...record });
      const data = await request();
      setBoard(data);
      setNickname(data.own?.nickname || "");
      setMessage(action === "leave" ? "Seu resultado foi retirado." : "Seu resultado foi publicado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível atualizar o ranking.");
    } finally { setBusy(false); }
  }

  return (
    <section className="mx-auto w-full max-w-xl overflow-y-auto px-5 pb-8 text-[#f3f0df]" aria-labelledby="setas-ranking">
      <button type="button" onClick={onClose} className="min-h-11 text-sm underline">← Voltar ao jogo</button>
      <h2 id="setas-ranking" className="mt-2 text-2xl font-semibold">Ranking do Setas Soltas</h2>
      <div className="my-4 flex gap-2" aria-label="Modo de jogo">
        {[["classic", "Clássico"], ["extreme", "Extremo"]].map(([key, label]) => (
          <button type="button" key={key} aria-pressed={mode === key} onClick={() => setMode(key)}
            className={`min-h-11 rounded-xl border px-4 ${mode === key ? "border-[#daf58a] text-[#daf58a]" : "border-[#53665b]"}`}>{label}</button>
        ))}
      </div>
      {busy && !board && <p>Carregando ranking…</p>}
      {board && (board[mode].length ? (
        <ol className="space-y-2">
          {board[mode].map((entry, index) => (
            <li key={index} className="flex justify-between gap-3 rounded-xl bg-[#263a32] px-4 py-2">
              <span>{index + 1}. {entry.nickname}</span><span className="shrink-0">Fase {entry.score}</span>
            </li>
          ))}
        </ol>
      ) : <p>Ainda não há resultados neste modo.</p>)}
      <form onSubmit={(event) => { event.preventDefault(); update("publish"); }} className="mt-6 space-y-3 border-t border-[#53665b] pt-4">
        <p>Seu recorde neste dispositivo · Clássico {record.classic} · Extremo {record.extreme}</p>
        {board?.own && <p>Publicado · Clássico {board.own.classic} · Extremo {board.own.extreme}</p>}
        <p className="text-sm">Participar é opcional. Quem usa o Respira vê seu apelido e as fases publicadas.</p>
        <label className="block">
          Apelido
          <input value={nickname} onChange={(event) => setNickname(event.target.value)} required minLength={2} maxLength={24}
            autoComplete="off" className="mt-1 block min-h-11 w-full rounded-xl border border-[#53665b] bg-[#101c19] px-3" />
        </label>
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy || !board || (!record.classic && !record.extreme)}
            className="min-h-11 rounded-xl bg-[#daf58a] px-4 font-semibold text-[#172421] disabled:opacity-50">
            {board?.own ? "Atualizar meu resultado" : "Publicar meu resultado"}
          </button>
          {board?.own && <button type="button" disabled={busy} onClick={() => update("leave")} className="min-h-11 px-2 underline">Sair do ranking</button>}
        </div>
      </form>
      <p className="my-3 text-sm" role="status">{message}</p>
    </section>
  );
}
