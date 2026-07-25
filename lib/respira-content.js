// Conteúdo textual do Respira — separado do componente para facilitar edição futura

export const COACH_BY_DAY = {
  0: {
    msg: "Hoje é o primeiro dia. Não precisa ser perfeito, precisa só ser hoje.",
    tip: "Beba um copo de água toda vez que a vontade bater. O gesto ajuda mais do que parece.",
  },
  1: {
    msg: "O corpo já começou a se limpar. A cabeça ainda vai reclamar um pouco — é esperado.",
    tip: "Evite os lugares e horários que você mais associava ao cigarro nas próximas 48h.",
  },
  2: {
    msg: "Esse é um dos dias mais difíceis fisicamente. Não é fraqueza, é abstinência de verdade.",
    tip: "Se a fissura bater forte, ela raramente passa de 5 minutos. Aguenta os 5 minutos.",
  },
  3: {
    msg: "Você já passou por 2 dias que muita gente não consegue passar. Isso importa.",
    tip: "Durma um pouco mais cedo hoje, se der. O corpo cansado sente mais vontade.",
  },
  4: {
    msg: "A irritação pode estar alta. Ela não é sobre as pessoas ao redor — é sobre o corpo pedindo nicotina.",
    tip: "Avise quem convive com você que esses dias estão mais difíceis. Ajuda os dois lados.",
  },
  5: {
    msg: "Cinco dias. O pico físico já está passando pra maioria das pessoas.",
    tip: "Note se a fissura está ficando mais rápida de passar. Geralmente já está.",
  },
  7: {
    msg: "Uma semana. O corpo já mudou mais do que a cabeça percebeu ainda.",
    tip: "Reveja o motivo que te trouxe até aqui. Releia seu porquê.",
  },
  10: {
    msg: "Dez dias é quando a parte física começa a perder força — agora o trabalho é mais mental.",
    tip: "Identifique um gatilho que ainda pega você de surpresa e faça um plano pra ele.",
  },
  14: {
    msg: "Duas semanas. Muita gente que recai, recai por aqui — não porque é mais fraca, mas porque relaxa a guarda.",
    tip: "Não deixa a confiança te fazer testar 'só uma tragada'. Não existe só uma.",
  },
  21: {
    msg: "Três semanas é tempo suficiente pra um hábito novo começar a virar automático.",
    tip: "Troque um ritual antigo do cigarro (o café da manhã, por exemplo) por algo novo de propósito.",
  },
  30: {
    msg: "Um mês. Isso é uma conquista real, não clichê de app.",
    tip: "Comemore de um jeito que não seja com cigarro. Você escolhe como.",
  },
};

export const MAINTENANCE_MESSAGES = [
  { msg: "Cada dia sem fumar é um dia que seu corpo agradece, mesmo sem avisar.", tip: "Beba água com calma agora — o corpo curte isso mais do que parece." },
  { msg: "Você não parou de fumar num dia só. Parou de novo hoje, e ontem, e antes.", tip: "Reveja um marco de saúde que já passou. Vale lembrar de onde você já saiu." },
  { msg: "A vontade que passa sem virar cigarro é uma vitória que ninguém vê, menos você.", tip: "Se notar um gatilho novo, anota ele no planejador de gatilhos." },
  { msg: "Seguir é mais importante que ser perfeito.", tip: "Se hoje foi difícil, amanhã começa de novo — sem punição." },
  { msg: "O dinheiro que sobra é seu. O fôlego que volta também.", tip: "Confira quanto já economizou — costuma surpreender." },
];

export function getCoachForDay(dayNumber) {
  if (COACH_BY_DAY[dayNumber]) return COACH_BY_DAY[dayNumber];
  const idx = dayNumber % MAINTENANCE_MESSAGES.length;
  return MAINTENANCE_MESSAGES[idx];
}

export const MISSIONS_POOL = [
  "Beber um copo de água agora",
  "Caminhar 10 minutos, mesmo que dentro de casa",
  "Vencer a próxima fissura sem fumar",
  "Anotar um gatilho que percebeu hoje",
  "Mandar uma mensagem pra alguém que te apoia",
  "Respirar fundo 5 vezes antes de reagir a algo que te irritou",
  "Reler seu porquê",
  "Comer uma fruta no lugar do cigarro de depois da refeição",
  "Dormir 20 minutos mais cedo hoje",
  "Anotar como você está se sentindo agora, em uma frase",
];

export function getMissionsForDay(dayNumber) {
  // 3 missões diferentes por dia, rotacionando pelo pool
  const start = (dayNumber * 3) % MISSIONS_POOL.length;
  const out = [];
  for (let i = 0; i < 3; i++) out.push(MISSIONS_POOL[(start + i) % MISSIONS_POOL.length]);
  return out;
}

export const ACHIEVEMENTS = [
  { key: "primeira_fissura", label: "Primeira fissura vencida", icon: "✦" },
  { key: "primeira_festa", label: "Primeira festa sem fumar", icon: "🎉" },
  { key: "primeiro_bar", label: "Primeiro bar sem fumar", icon: "🍻" },
  { key: "primeiro_churrasco", label: "Primeiro churrasco sem fumar", icon: "🔥" },
  { key: "primeiro_cafe", label: "Primeiro café da manhã sem fumar", icon: "☕" },
  { key: "primeiro_estresse", label: "Primeira situação de estresse sem fumar", icon: "💪" },
  { key: "primeiro_mes", label: "Primeiro mês completo", icon: "🗓️" },
  { key: "primeira_viagem", label: "Primeira viagem/voo sem fumar", icon: "✈️" },
];

export const REWARDS = [
  { days: 30, label: "10% de desconto na loja", code: "RESPIRA30" },
  { days: 90, label: "Frete grátis", code: "RESPIRA90" },
  { days: 180, label: "Camiseta exclusiva Respira", code: "RESPIRA180" },
];

export const HEALTH_MILESTONES = [
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

export const TECHNIQUES = [
  { id: "respiracao", title: "Respiração 4-7-8", tagline: "acalma o corpo", desc: "Inspire 4s, segure 7s, solte 8s. Repita 4 vezes. Ativa o sistema nervoso que desliga o alarme da fissura." },
  { id: "onda", title: "Surfar a onda", tagline: "deixa passar", desc: "A fissura sobe, bate no pico e desce sozinha — geralmente em menos de 5 minutos. Não precisa lutar contra ela, só não alimentar. Observe sem agir." },
  { id: "halt", title: "Checagem HALT", tagline: "acha a causa real", desc: "Pergunte: estou com Fome, com raiva (Angry), Sozinho(a) ou Cansado(a)? Muita fissura é na verdade uma dessas quatro coisas disfarçada." },
  { id: "movimento", title: "Mexer o corpo", tagline: "muda o estado", desc: "Uma caminhada rápida de 2 minutos, sobe e desce de escada, ou só levantar e espreguiçar. Muda a química do corpo mais rápido que parece." },
  { id: "contato", title: "Chamar alguém", tagline: "não segura sozinho", desc: "Manda uma mensagem pra alguém que sabe que você tá parando. Só o ato de contar já tira força da vontade." },
  { id: "boca", title: "Ocupar a boca", tagline: "satisfaz o gesto", desc: "Água gelada, chiclete sem açúcar, uma fruta ácida, um palito. O gesto mão-boca também pede colo, não só a nicotina." },
  { id: "porque", title: "Ler meu porquê", tagline: "lembra o motivo", desc: "Reveja por que você começou essa parada. É o argumento mais forte que existe — mais forte que qualquer fissura de 5 minutos." },
];

export const FORUM_CATEGORIES = [
  { key: "fissura", label: "Fissura", icon: "🔥" },
  { key: "recaida", label: "Recaída", icon: "🌊" },
  { key: "vitoria", label: "Vitória", icon: "✦" },
  { key: "desabafo", label: "Desabafo", icon: "💬" },
];

export const REACTIONS = [
  { key: "support", label: "Estou com você", icon: "🤍" },
  { key: "strength", label: "Força", icon: "💪" },
  { key: "congrats", label: "Parabéns", icon: "👏" },
  { key: "understand", label: "Te entendo", icon: "🫂" },
];

// Placeholder mínimo — ampliar antes de divulgar publicamente em escala
export const BLOCKED_TERMS = ["idiota", "burro", "burra", "imbecil", "escroto", "vagabundo"];

export function containsBlockedTerm(text) {
  const lower = text.toLowerCase();
  return BLOCKED_TERMS.some((t) => lower.includes(t));
}

export function generateReferralCode(userId) {
  return "OB" + userId.replace(/-/g, "").slice(0, 6).toUpperCase();
}
