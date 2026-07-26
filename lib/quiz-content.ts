// Quiz "Qual estampa combina com você" — mapeia respostas pras 8 coleções existentes

export type CollectionSlug = 'fetiche' | 'bear' | 'queer' | 'pride' | 'raca' | 'diversidade' | 'cultura-pop' | 'ironicas'

export type QuizOption = { label: string; collection: CollectionSlug }
export type QuizQuestion = { id: number; text: string; options: QuizOption[] }

export const ALL_QUIZ_QUESTIONS: QuizQuestion[] = [
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
  {
    id: 10,
    text: 'Na roda de amigos, você é aquele(a) que...',
    options: [
      { label: 'Solta a piada mais ácida da noite', collection: 'ironicas' },
      { label: 'Puxa o assunto de resistência e história', collection: 'raca' },
      { label: 'Não se define, e adora ver todo mundo tentando', collection: 'queer' },
      { label: 'Chega com o look mais provocante', collection: 'fetiche' },
    ],
  },
  {
    id: 11,
    text: 'Qual filme/série resume seu gosto?',
    options: [
      { label: 'Algo trash noventista que virou cult', collection: 'cultura-pop' },
      { label: 'Um documentário sobre movimentos sociais', collection: 'raca' },
      { label: 'Comédia com humor negro e sem filtro', collection: 'ironicas' },
      { label: 'Um drama sobre gente que não se encaixa', collection: 'queer' },
    ],
  },
  {
    id: 12,
    text: 'Seu tipo de festa favorita é...',
    options: [
      { label: 'Fetiche night, dress code liberado', collection: 'fetiche' },
      { label: 'Parada do orgulho, calor de multidão', collection: 'pride' },
      { label: 'Uma reunião tranquila de barba e cerveja', collection: 'bear' },
      { label: 'Qualquer uma, contanto que ninguém julgue', collection: 'diversidade' },
    ],
  },
  {
    id: 13,
    text: 'O que mais te define hoje?',
    options: [
      { label: 'Minha ancestralidade e de onde eu vim', collection: 'raca' },
      { label: 'Minha recusa em ser categorizado(a)', collection: 'queer' },
      { label: 'Meu orgulho, sem filtro nenhum', collection: 'pride' },
      { label: 'Minha capacidade de rir de tudo, inclusive de mim', collection: 'ironicas' },
    ],
  },
  {
    id: 14,
    text: 'Sua estampa ideal tem que ter...',
    options: [
      { label: 'Referência pop que só quem é da cena entende', collection: 'cultura-pop' },
      { label: 'Algo com couro, corrente ou provocação', collection: 'fetiche' },
      { label: 'Cor forte que não passa despercebida', collection: 'pride' },
      { label: 'Uma mistura de tudo, sem regra fixa', collection: 'diversidade' },
    ],
  },
  {
    id: 15,
    text: 'Qual desses papos você puxaria primeiro?',
    options: [
      { label: 'Cultura ursina e a comunidade bear', collection: 'bear' },
      { label: 'Política de representatividade racial', collection: 'raca' },
      { label: 'Aquele meme/ícone pop que ninguém esquece', collection: 'cultura-pop' },
      { label: 'A última cena que te tirou do armário mental', collection: 'queer' },
    ],
  },
  {
    id: 16,
    text: 'Como você reage a preconceito?',
    options: [
      { label: 'Com deboche afiado, sem dar trabalho', collection: 'ironicas' },
      { label: 'Erguendo a bandeira mais alto ainda', collection: 'pride' },
      { label: 'Lembrando de onde vim e seguindo em frente', collection: 'raca' },
      { label: 'Simplesmente não cabendo na caixinha deles', collection: 'diversidade' },
    ],
  },
  {
    id: 17,
    text: 'Seu jeito de paquerar é...',
    options: [
      { label: 'Direto, provocante, sem rodeios', collection: 'fetiche' },
      { label: 'Tranquilo, caseiro, sem pressa', collection: 'bear' },
      { label: 'Ambíguo de propósito, ninguém te encaixa', collection: 'queer' },
      { label: 'Engraçado — rir junto é meu flerte favorito', collection: 'ironicas' },
    ],
  },
  {
    id: 18,
    text: 'Se você fosse uma camiseta, seria a que...',
    options: [
      { label: 'Tem uma referência pop escondida', collection: 'cultura-pop' },
      { label: 'Grita orgulho de longe', collection: 'pride' },
      { label: 'Ninguém sabe definir de primeira', collection: 'diversidade' },
      { label: 'Faz todo mundo rir e se identificar', collection: 'ironicas' },
    ],
  },
]

// Sorteia N perguntas do banco (sem repetir), embaralhando também a ordem das opções de cada uma
export function pickQuizQuestions(n = 9): QuizQuestion[] {
  const shuffled = [...ALL_QUIZ_QUESTIONS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n).map((q) => ({
    ...q,
    options: [...q.options].sort(() => Math.random() - 0.5),
  }))
}

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
