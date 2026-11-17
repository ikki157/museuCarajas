export const museum = {
  name: 'Museu Municipal Hilmar Harry Kluck',
  shortName: 'Museu Hilmar Harry Kluck',
  city: 'Parauapebas',
  state: 'Pará',
  stateCode: 'PA',
  tagline: 'Memória, arqueologia e cultura de Parauapebas e da região de Carajás.',
}

export const sourceUrl =
  'https://parauapebas.pa.gov.br/destaque/museu-de-parauapebas-retrata-a-historia-e-a-cultura-dos-primeiros-habitantes/'

export const photoCredit = 'Prefeitura de Parauapebas / Assessoria de Comunicação'

export const navItems = [
  { id: 'inicio', label: 'Início', href: '#inicio' },
  { id: 'galeria', label: 'Registros', href: '#galeria' },
  { id: 'acervo', label: 'Acervo', href: '#acervo' },
  { id: 'contribua', label: 'Enviar Registro', href: '#contribua' },
  { id: 'museu', label: 'História Local', href: '#museu' },
  { id: 'visite', label: 'Visitação', href: '#visite' },
] as const

export const sectionIds = [
  'inicio',
  'galeria',
  'acervo',
  'contribua',
  'exposicoes',
  'museu',
  'educacao',
  'visite',
] as const

export const visit = {
  addressLine1: 'Rua E, bairro Cidade Nova',
  addressLine2: 'Ao lado da Praça de Eventos · Parauapebas – PA',
  addressFull: 'Rua E, bairro Cidade Nova, ao lado da Praça de Eventos, Parauapebas – PA',
  weekdays: 'Segunda a sexta-feira, das 8h às 18h',
  weekends: 'Sábado e domingo, das 10h às 16h',
  hoursNote:
    'Horários divulgados em publicação oficial de 2023. Recomendamos confirmar por e-mail antes da visita.',
  groupInfo:
    'Visitas em grupo, como de escolas e outras instituições, devem ser solicitadas com ofício enviado aos e-mails institucionais.',
  emails: ['museudeparauapebas@gmail.com', 'museu.secult@parauapebas.pa.gov.br'],
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=Museu+Municipal+Hilmar+Harry+Kluck+Parauapebas+PA',
  sourceLabel: 'Publicação oficial da Prefeitura de Parauapebas (05/04/2023)',
}

export type CollectionCategory = {
  id: string
  title: string
  description: string
  image: string
  alt: string
  focus?: string
}

export const collectionCategories: CollectionCategory[] = [
  {
    id: 'xikrin',
    title: 'Cultura indígena Xikrin do Cateté',
    description:
      'Adornos, instrumentos e objetos que expressam saberes e a presença do povo Xikrin do Cateté, cuja trajetória se entrelaça com a história de Parauapebas.',
    image: '/images/museu/museu-08.jpg',
    alt: 'Adornos com plumária colorida em exposição no museu.',
  },
  {
    id: 'arqueologia',
    title: 'Arqueologia de Carajás',
    description:
      'Vestígios de povos que habitaram a região muito antes da fundação do município. Pesquisas na Serra dos Carajás apontam datações com mais de 11 mil anos.',
    image: '/images/museu/museu-09.jpg',
    alt: 'Ametista e outras amostras minerais em exposição sobre uma superfície escura.',
  },
  {
    id: 'liticos',
    title: 'Artefatos líticos',
    description:
      'Lâminas de machado e objetos em pedra que ajudam a contar a história da ocupação humana e do uso do território amazônico.',
    image: '/images/museu/museu-01.jpg',
    alt: 'Sala de exposição com vitrines, peças arqueológicas e rochas em primeiro plano.',
    focus: 'center 68%',
  },
  {
    id: 'ceramica',
    title: 'Cerâmica e osso',
    description:
      'Vasilhas cerâmicas, fragmentos e objetos de osso que compõem o repertório material do acervo arqueológico do museu.',
    image: '/images/museu/museu-06.jpg',
    alt: 'Vasilha de cerâmica e fragmentos arqueológicos organizados em uma vitrine.',
  },
  {
    id: 'fotografias',
    title: 'Fotografias e documentos',
    description:
      'Registros visuais e documentais que preservam a memória de instituições, famílias e indivíduos da sociedade parauapebense.',
    image: '/images/museu/museu-07.jpg',
    alt: 'Fotografia histórica em preto e branco mostrando a chegada de uma locomotiva da Estrada de Ferro Carajás.',
  },
  {
    id: 'memoria',
    title: 'Memória e formação de Parauapebas',
    description:
      'Narrativas sobre os ciclos econômicos, os deslocamentos e a construção do município, da extração do caucho à mineração de Carajás.',
    image: '/images/museu/museu-10.jpg',
    alt: 'Painel sobre a migração ao lado de uma escultura escura com figuras humanas.',
  },
]

export const hilmarBio = [
  'Nascido em Bagé, no Rio Grande do Sul, Hilmar Harry Kluck mudou-se para o Pará em 1949. Conviveu por muitos anos com os povos Assurini, Parakanã, Gavião, Suruí, Kayapó e Arara, nas regiões dos rios Araguaia, Tocantins, Xingu e Tapajós.',
  'Participou e auxiliou a caminhada do povo Xikrin, da Casa de Passagem indígena em São Geraldo do Araguaia até Parauapebas, onde se fixaram na Terra Indígena Xikrin do Cateté. Morou no bairro Rio Verde com a esposa, Neuza Kluck, até seu falecimento, aos 86 anos, em maio de 2011.',
  'Em homenagem à sua atuação na causa indigenista e à contribuição para o desenvolvimento do município, a Prefeitura de Parauapebas deu seu nome ao museu.',
]

export const educationAudiences = [
  {
    title: 'Escolas e instituições',
    description:
      'Visitas em grupo e ações educativas podem ser solicitadas com ofício enviado à equipe do museu.',
  },
  {
    title: 'Professores e educadores',
    description:
      'A exposição propõe um percurso pela arqueologia, pela cultura Xikrin e pela memória da formação de Parauapebas.',
  },
  {
    title: 'Famílias e visitantes',
    description:
      'A visitação livre convida a conhecer o acervo e a refletir sobre a importância de preservar o patrimônio regional.',
  },
] as const

export const donationItems = [
  'Objetos antigos ligados à história de Parauapebas e da região',
  'Fotografias e documentos originais ou cópias',
  'Itens indígenas e artefatos arqueológicos',
  'Registros audiovisuais, sonoros, cartográficos e textuais',
] as const

export const materialCategories = [
  { value: 'fotografia', label: 'Fotografia' },
  { value: 'documento', label: 'Documento' },
  { value: 'objeto', label: 'Objeto histórico' },
  { value: 'arqueologico', label: 'Artefato arqueológico' },
  { value: 'outro', label: 'Outro' },
] as const

export const heroImage = {
  src: '/images/museu/museu-01.jpg',
  alt: 'Sala expositiva do Museu Municipal Hilmar Harry Kluck, com vitrines de artefatos arqueológicos e amostras minerais.',
}
