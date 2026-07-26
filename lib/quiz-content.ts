// Quiz "Qual estampa combina com você" — mapeia respostas pras 8 coleções existentes

export type CollectionSlug = 'fetiche' | 'bear' | 'queer' | 'pride' | 'raca' | 'diversidade' | 'cultura-pop' | 'ironicas'

export type QuizOption = { label: string; collection: CollectionSlug }
export type QuizQuestion = { id: number; text: string; options: QuizOption[] }

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: 'Sexta à noite. Você está...',
    options: [
      { label: 'Numa festa fetiche, sem culpa nenhuma', collection: 'fetiche' },
      { label: 'No sofá, maratonando série antiga', collection: 'cultura-pop' },
      { label: 'Numa roda de amigos rindo de tudo', collection: 'ironicas' },
      { label: 'Numa balada LGBT+ lotada', collection: 'pride' },
    ],
  },
  {
    id: 2,
    text: 'Sua vibe física ideal é...',
    options: [
      { label: 'Barbudo, peludo, sem pressa de aparar nada', collection: 'bear' },
      { label: 'Andrógino, indefinido, provocador', collection: 'queer' },
      { label: 'Cor, textura, ancestralidade estampada', collection: 'raca' },
      { label: 'Um pouco de tudo, sem caixinha nenhuma', collection: 'diversidade' },
    ],
  },
  {
    id: 3,
    text: 'Quando alguém tenta te ofender, você...',
    options: [
      { label: 'Devolve com deboche na mesma hora', collection: 'ironicas' },
      { label: 'Levanta a bandeira e segue o dia', collection: 'pride' },
      { label: 'Ignora — sua existência já é resposta', collection: 'diversidade' },
      { label: 'Guarda pra usar numa estampa depois', collection: 'cultura-pop' },
    ],
  },
  {
    id: 4,
    text: 'Seu ídolo pop favorito é do tipo...',
    options: [
      { label: 'Ícone camp que virou meme eterno', collection: 'cultura-pop' },
      { label: 'Aquele que assumiu sem pedir desculpa', collection: 'queer' },
      { label: 'O que carrega a cultura no corpo', collection: 'raca' },
      { label: 'Ninguém — você é seu próprio ícone', collection: 'ironicas' },
    ],
  },
  {
    id: 5,
    text: 'No date, o que mais te atrai?',
    options: [
      { label: 'Um jeito mais peludo e caseiro de ser', collection: 'bear' },
      { label: 'Uma pegada mais ousada e sem regras', collection: 'fetiche' },
      { label: 'Alguém que não cabe em rótulo nenhum', collection: 'queer' },
      { label: 'Alguém orgulhoso de onde veio', collection: 'raca' },
    ],
  },
  {
    id: 6,
    text: 'Sua bandeira favorita pra hastear é...',
    options: [
      { label: 'O arco-íris, sem meio-termo', collection: 'pride' },
      { label: 'Nenhuma — você é a mistura de todas', collection: 'diversidade' },
      { label: 'A do seu bear pride particular', collection: 'bear' },
      { label: 'Uma que ainda não inventaram', collection: 'queer' },
    ],
  },
  {
    id: 7,
    text: 'O que nunca pode faltar no seu closet?',
    options: [
      { label: 'Couro, corrente, algo que provoque', collection: 'fetiche' },
      { label: 'Estampa de referência que só quem entende pega', collection: 'cultura-pop' },
      { label: 'Cor que grita orgulho de longe', collection: 'pride' },
      { label: 'Frase afiada que resume sua semana', collection: 'ironicas' },
    ],
  },
  {
    id: 8,
    text: 'Se sua vida virasse legenda de post, seria...',
    options: [
      { label: '"Deboche é resistência"', collection: 'ironicas' },
      { label: '"Orgulho não pede licença"', collection: 'pride' },
      { label: '"Minha ancestralidade não é tendência"', collection: 'raca' },
      { label: '"Não coube em nenhuma caixinha"', collection: 'diversidade' },
    ],
  },
  {
    id: 9,
    text: 'Sua energia ideal de sábado de manhã é...',
    options: [
      { label: 'Café, barba por fazer, sem pressa de nada', collection: 'bear' },
      { label: 'Playlist nostálgica e maquiagem de sobra', collection: 'cultura-pop' },
      { label: 'Sem rótulo, sem hora, sem explicação', collection: 'queer' },
      { label: 'Rindo de si mesmo antes de rirem de você', collection: 'ironicas' },
    ],
  },
]

export const QUIZ_RESULTS: Record<CollectionSlug, { title: string; tagline: string; description: string }> = {
  fetiche: {
    title: 'Fetiche',
    tagline: 'você não pede desculpa pelo que te excita',
    description: 'Sua vibe é ousada, sem papas na língua e sem vergonha do que te dá tesão. Couro, provocação e atitude — sua estampa é pra quem entende que desejo também é orgulho.',
  },
  bear: {
    title: 'Bear',
    tagline: 'peludo, caseiro e sem pressa de agradar ninguém',
    description: 'Você é aquele charme sem esforço — barba por fazer, jeito tranquilo e uma presença que enche a sala sem precisar performar nada. Sua estampa celebra o corpo do jeito que ele é.',
  },
  queer: {
    title: 'Queer',
    tagline: 'você não cabe em rótulo nenhum, e faz questão',
    description: 'Indefinido é o seu superpoder. Você provoca categorias só de existir, e sua estampa é um manifesto contra tudo que tentaram te encaixar.',
  },
  pride: {
    title: 'Pride',
    tagline: 'seu orgulho não pede licença pra existir',
    description: 'Bandeira erguida, cor no rosto e nenhuma vontade de diminuir seu brilho. Sua estampa é pra quem entende que existir em público já é um ato político.',
  },
  raca: {
    title: 'Raça',
    tagline: 'sua ancestralidade não é tendência, é raiz',
    description: 'Você carrega história, cultura e resistência no corpo — e não é modinha passageira. Sua estampa homenageia quem veio antes e afirma quem você é agora.',
  },
  diversidade: {
    title: 'Diversidade',
    tagline: 'você é a mistura que nenhuma caixinha explica',
    description: 'Você não escolhe um só jeito de ser — é várias coisas ao mesmo tempo, e tudo bem. Sua estampa celebra justamente essa recusa em se encaixar em uma única definição.',
  },
  'cultura-pop': {
    title: 'Cultura Pop',
    tagline: 'referência, nostalgia e um tiquinho de camp',
    description: 'Você fala em referência, ri de memes antigos e sabe que ícone pop também é patrimônio queer. Sua estampa é pra quem entende a piada sem precisar explicar.',
  },
  ironicas: {
    title: 'Irônicas',
    tagline: 'deboche é sua língua materna',
    description: 'Antes que zoem de você, você já zoou de si mesmo. Seu humor é afiado, seu deboche é resistência, e sua estampa é a prova de que rir também é sobreviver.',
  },
}

export function calculateQuizResult(answers: CollectionSlug[]): CollectionSlug {
  const counts: Record<string, number> = {}
  answers.forEach((slug) => { counts[slug] = (counts[slug] || 0) + 1 })
  let best: CollectionSlug = 'diversidade'
  let bestCount = -1
  for (const [slug, count] of Object.entries(counts)) {
    if (count > bestCount) { best = slug as CollectionSlug; bestCount = count }
  }
  return best
}
