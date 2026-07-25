// Conteúdo textual do Respira — separado do componente para facilitar edição futura

export const WELCOME_TEXT = `Parar de fumar é um presente pra versão mais bonita de você.

Se você chegou até aqui, provavelmente já pensou algumas vezes em parar de fumar. Talvez tenha tentado. Talvez tenha desistido. Talvez esteja adiando "só mais um pouquinho". Tá tudo bem. Você não precisa ser perfeito para começar. Só precisa começar. E a gente vai estar aqui para lembrar que vale a pena continuar.

O cigarro não rouba tudo de uma vez. Ele vai pegando pequenas coisas, um pouquinho por dia: o cheiro da sua roupa, o seu hálito, o brilho da sua pele, o seu fôlego, o sabor da comida, o dinheiro da sua carteira, a confiança. E a gente acaba se acostumando — até perceber que está evitando escada, correndo atrás de ônibus e chegando morto, beijando pensando no cheiro.

A boa notícia é que seu corpo adora perdoar, e começa a fazer isso muito antes do que você imagina. Ele não vai brigar contra você — vai brigar contra a nicotina. Nos primeiros dias pode vir irritação, ansiedade, vontade de comer tudo, dificuldade pra dormir. Não é falta de força, é abstinência. Seu cérebro passou anos aprendendo que a nicotina fazia parte da rotina — agora ele vai aprender de novo. E ele aprende.

Alguns dias serão ótimos. Outros serão um saco. Pode até acontecer um deslize — e um deslize não apaga tudo o que você já conquistou. Respira, bebe uma água, dá uma volta, liga pra alguém, volta pro app, e continua. Cada cigarro que você deixa de fumar já é uma vitória. Uma vida sem cigarro não é feita de perfeição. É feita de decisões, uma de cada vez.

Bora respirar.`;

export const HEALTH_MILESTONES = [
  { mins: 20, label: "20 minutos", icon: "❤️", fact: "Sua pressão começa a melhorar." },
  { mins: 8 * 60, label: "8 horas", icon: "🫁", fact: "Seu sangue recebe mais oxigênio." },
  { mins: 48 * 60, label: "48 horas", icon: "👅", fact: "Você sente melhor o gosto da comida." },
  { mins: 7 * 24 * 60, label: "7 dias", icon: "👕", fact: "Suas roupas já ficam menos impregnadas de cheiro." },
  { mins: 15 * 24 * 60, label: "15 dias", icon: "🏃", fact: "Talvez você já consiga caminhar mais sem cansar." },
  { mins: 30 * 24 * 60, label: "30 dias", icon: "💋", fact: "Seu beijo agradece." },
  { mins: 90 * 24 * 60, label: "90 dias", icon: "✨", fact: "Sua pele pode parecer mais bonita." },
  { mins: 365 * 24 * 60, label: "1 ano", icon: "❤️", fact: "Seu risco cardiovascular já caiu bastante." },
];

// Marcos emocionais — pequenas vitórias, marcadas manualmente pela pessoa
export const EMOTIONAL_MILESTONES = [
  { key: "primeira_manha", label: "Primeira manhã sem cigarro", icon: "🌅" },
  { key: "primeiro_cafe", label: "Primeiro café sem cigarro", icon: "☕" },
  { key: "primeira_sexta", label: "Primeira sexta-feira sem cigarro", icon: "🎉" },
  { key: "primeiro_churrasco", label: "Primeiro churrasco sem cigarro", icon: "🔥" },
  { key: "primeira_balada", label: "Primeira balada sem cigarro", icon: "💃" },
  { key: "primeiro_beijo", label: "Primeiro beijo sem cigarro", icon: "💋" },
];

// Mensagens diárias — combinam fase (dias) com contexto de dia da semana
export const COACH_BY_DAY = {
  0: "Hoje é o primeiro dia. Não precisa ser perfeito, precisa só ser hoje.",
  1: "O corpo já começou a se limpar. A cabeça ainda vai reclamar um pouco — é esperado.",
  2: "Esse é um dos dias mais difíceis fisicamente. Não é fraqueza, é abstinência de verdade.",
  3: "Você já passou por 2 dias que muita gente não consegue passar. Isso importa.",
  4: "A irritação pode estar alta. Ela não é sobre as pessoas ao redor — é sobre o corpo pedindo nicotina.",
  5: "Cinco dias. O pico físico já está passando pra maioria das pessoas.",
  7: "Uma semana. O corpo já mudou mais do que a cabeça percebeu ainda.",
  10: "Dez dias é quando a parte física começa a perder força — agora o trabalho é mais mental.",
  14: "Duas semanas. Muita gente que recai, recai por aqui — não porque é mais fraca, mas porque relaxa a guarda.",
  21: "Três semanas é tempo suficiente pra um hábito novo começar a virar automático.",
  30: "Um mês. Isso é uma conquista real, não clichê de app.",
};

export const MAINTENANCE_MESSAGES = [
  "Cada dia sem fumar é um dia que seu corpo agradece, mesmo sem avisar.",
  "Você não parou de fumar num dia só. Parou de novo hoje, e ontem, e antes.",
  "A vontade que passa sem virar cigarro é uma vitória que ninguém vê, menos você.",
  "Seguir é mais importante que ser perfeito.",
  "O dinheiro que sobra é seu. O fôlego que volta também.",
];

export const WEEKDAY_TIPS = {
  0: "Domingo costuma ser dia de rotina mais solta. Se notar vontade, ela geralmente é tédio disfarçado.",
  5: "Hoje é sexta. Vai encontrar os amigos? Álcool costuma aumentar a vontade de fumar — já deixa um plano na cabeça.",
  6: "Sábado costuma vir com mais tempo livre e mais chance de bebida. Vale ter um plano pronto.",
};

export function getCoachMessage(dayNumber, date = new Date()) {
  const base = COACH_BY_DAY[dayNumber] || MAINTENANCE_MESSAGES[dayNumber % MAINTENANCE_MESSAGES.length];
  const weekdayTip = WEEKDAY_TIPS[date.getDay()];
  return { msg: base, tip: weekdayTip || null };
}

export const MISSIONS_POOL = [
  "Caminhar 20 minutos",
  "Beber 2 litros de água",
  "Comer uma fruta",
  "Dormir antes da meia-noite",
  "Vencer a primeira fissura do dia",
  "Reler seu porquê",
  "Anotar como está se sentindo",
  "Mandar mensagem pra alguém que te apoia",
];

export function getMissionsForDay(dayNumber) {
  const start = (dayNumber * 3) % MISSIONS_POOL.length;
  const out = [];
  for (let i = 0; i < 3; i++) out.push(MISSIONS_POOL[(start + i) % MISSIONS_POOL.length]);
  return out;
}

export const MOOD_OPTIONS = [
  { key: "excelente", label: "Excelente", icon: "😀" },
  { key: "bom", label: "Bom", icon: "🙂" },
  { key: "dificil", label: "Difícil", icon: "😕" },
  { key: "pessimo", label: "Péssimo", icon: "😖" },
];

export const SELFESTEEM_OPTIONS = [
  { value: 1, icon: "😞" },
  { value: 2, icon: "😕" },
  { value: 3, icon: "😐" },
  { value: 4, icon: "🙂" },
  { value: 5, icon: "😁" },
];

export const MOVEMENT_ACTIVITIES = [
  { key: "caminhada", label: "Caminhada", icon: "🚶" },
  { key: "academia", label: "Academia", icon: "🏋️" },
  { key: "bike", label: "Bike", icon: "🚴" },
  { key: "natacao", label: "Natação", icon: "🏊" },
  { key: "yoga", label: "Yoga", icon: "🧘" },
  { key: "danca", label: "Dança", icon: "💃" },
  { key: "esporte", label: "Esporte", icon: "⚽" },
];

export const MOVEMENT_DURATIONS = [15, 30, 45, 60];

// Gatilhos e substitutos — usados no onboarding (Plano de Emergência) e no registro de recaída
export const TRIGGER_OPTIONS = [
  { key: "cafe", label: "Depois do café", icon: "☕" },
  { key: "dirigindo", label: "Dirigindo", icon: "🚗" },
  { key: "bebendo", label: "Bebendo", icon: "🍺" },
  { key: "estressado", label: "Estressado", icon: "😡" },
  { key: "trabalhando", label: "Trabalhando", icon: "☎️" },
  { key: "tv", label: "Assistindo TV", icon: "📺" },
  { key: "antes_dormir", label: "Antes de dormir", icon: "😴" },
  { key: "outro", label: "Outro", icon: "•" },
];

export const SUBSTITUTE_OPTIONS = [
  { key: "agua", label: "Beber água" },
  { key: "chiclete", label: "Chiclete" },
  { key: "respirar", label: "Respirar fundo" },
  { key: "caminhar", label: "Caminhar um pouco" },
  { key: "escovar", label: "Escovar os dentes" },
  { key: "mensagem", label: "Mandar mensagem" },
  { key: "descafeinado", label: "Café descafeinado" },
  { key: "outro", label: "Outro" },
];

// SOS — técnicas usadas apenas quando a intensidade é "forte"
export const SOS_TECHNIQUES = [
  { id: "caminhar", title: "Caminhar 5 minutos", icon: "🚶" },
  { id: "agua", title: "Beber água", icon: "💧" },
  { id: "gelo", title: "Segurar gelo", icon: "🧊" },
  { id: "respirar", title: "Respirar", icon: "🧘" },
  { id: "boca", title: "Colocar algo na boca", icon: "🍬" },
  { id: "porque", title: "Ler seu motivo", icon: "📖" },
  { id: "conquistas", title: "Ver quanto você já conquistou", icon: "📱" },
];

export const REWARD_THRESHOLDS = [
  { amount: 80, label: "Que tal um almoço legal?" },
  { amount: 200, label: "Um perfume novo?" },
  { amount: 350, label: "Aquela camiseta da Ô bicha 😏" },
  { amount: 1500, label: "Uma viagem?" },
];

export const LEARN_CARDS = [
  { title: "Quanto tempo dura uma fissura?", text: "O pico de uma fissura raramente passa de 5 minutos. Ela sobe, bate no auge e desce sozinha — mesmo sem fazer nada além de esperar." },
  { title: "Por que dá ansiedade?", text: "A nicotina altera a química do cérebro. Sem ela, o corpo reajusta os níveis de dopamina — isso gera ansiedade temporária que passa conforme os dias avançam." },
  { title: "Por que engorda?", text: "A nicotina acelera levemente o metabolismo e reduz o apetite. Sem ela, é comum sentir mais fome nas primeiras semanas — costuma se estabilizar." },
  { title: "Álcool atrapalha?", text: "Bebida reduz o autocontrole e é um dos gatilhos mais fortes de recaída. Vale ter um plano específico pra quando for beber." },
  { title: "Vape é melhor?", text: "O vape ainda contém nicotina e mantém a dependência ativa, mesmo sem os componentes da queima do tabaco. Não é considerado uma forma segura de parar." },
  { title: "Maconha interfere?", text: "Fumar maconha misturada com tabaco mantém a exposição à nicotina e prejudica o processo de parar de fumar cigarro." },
  { title: "O que a nicotina faz?", text: "A nicotina ativa receptores no cérebro que liberam dopamina, criando a sensação de prazer e recompensa — é isso que gera a dependência." },
];

export const RELAPSE_CAUSES = [
  { key: "bebida", label: "Bebida", icon: "🍺" },
  { key: "estresse", label: "Estresse", icon: "😡" },
  { key: "cafe", label: "Café", icon: "☕" },
  { key: "amigos", label: "Amigos fumando", icon: "👥" },
  { key: "ansiedade", label: "Ansiedade", icon: "😔" },
  { key: "outro", label: "Outro", icon: "•" },
];

export const FORUM_REACTIONS = [
  { key: "like", label: "Gostei", icon: "👍" },
  { key: "love", label: "Amei", icon: "❤️" },
  { key: "forca", label: "Força", icon: "💪" },
];

// Placeholder mínimo — ampliar antes de divulgar publicamente em escala
const BLOCKED_TERMS = ["idiota", "burro", "burra", "imbecil", "escroto", "vagabundo"];
export function containsBlockedTerm(text) {
  const lower = text.toLowerCase();
  return BLOCKED_TERMS.some((t) => lower.includes(t));
}

export function formatMinutesAsLifeTime(mins) {
  // ~11 minutos de expectativa de vida recuperados por cigarro evitado (estimativa amplamente citada)
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} dia${days !== 1 ? "s" : ""}`;
  if (hours > 0) return `${hours}h`;
  return `${Math.floor(mins)}min`;
}

export const DISCLAIMER_TEXT = "Este aplicativo tem caráter educativo e de apoio. Ele não substitui acompanhamento médico, psicológico ou tratamento para dependência de nicotina. O Respira é um companheiro de jornada, não uma promessa de cura. Se sentir que está difícil demais, procure orientação profissional — o SUS oferece programas gratuitos para parar de fumar. Disque Saúde: 136.";
