import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const photosDir = path.join(root, 'public', 'images', 'museu')
const bucket = 'galeria'
const credit = 'Prefeitura de Parauapebas / Assessoria de Comunicação (2023)'

const photos = [
  {
    file: 'museu-01.jpg',
    titulo: 'Sala expositiva do museu',
    categoria: 'Exposições',
    descricao:
      'Vista da sala expositiva com vitrines, painéis e amostras minerais que compõem o percurso de visitação.',
  },
  {
    file: 'museu-02.jpg',
    titulo: 'Fachada e placa institucional',
    categoria: 'O Museu',
    descricao:
      'Placa do Museu de Parauapebas Hilmar Harry Kluck na sede administrativa, com pintura de folhas na fachada.',
  },
  {
    file: 'museu-03.jpg',
    titulo: 'Memória da formação de Parauapebas',
    categoria: 'Memória',
    descricao:
      'Fotografia histórica de moradores em uma caminhonete durante o plebiscito que marcou a criação do município.',
  },
  {
    file: 'museu-04.jpg',
    titulo: 'Instrumentos e adornos indígenas',
    categoria: 'Cultura Xikrin',
    descricao:
      'Maracá e adornos com plumária integrados ao acervo de cultura indígena do museu.',
  },
  {
    file: 'museu-05.jpg',
    titulo: 'Painel da exposição Conhecer para Preservar',
    categoria: 'Exposições',
    descricao:
      'Painel de abertura da exposição que apresenta a história e o patrimônio cultural de Parauapebas.',
  },
  {
    file: 'museu-06.jpg',
    titulo: 'Cerâmica e fragmentos arqueológicos',
    categoria: 'Arqueologia',
    descricao:
      'Vasilha cerâmica e fragmentos arqueológicos organizados em uma vitrine do museu.',
  },
  {
    file: 'museu-07.jpg',
    titulo: 'Chegada da locomotiva da Estrada de Ferro Carajás',
    categoria: 'Memória',
    descricao:
      'Registro histórico da chegada da locomotiva, acompanhado por moradores e autoridades.',
  },
  {
    file: 'museu-08.jpg',
    titulo: 'Plumária e adornos Xikrin',
    categoria: 'Cultura Xikrin',
    descricao:
      'Adornos com penas coloridas que expressam saberes e a presença do povo Xikrin do Cateté.',
  },
  {
    file: 'museu-09.jpg',
    titulo: 'Amostras minerais e ametista',
    categoria: 'Geologia e mineração',
    descricao:
      'Amostras de rochas e ametista que contextualizam a riqueza mineral da região de Carajás.',
  },
  {
    file: 'museu-10.jpg',
    titulo: 'Painel sobre migração e escultura',
    categoria: 'Memória',
    descricao:
      'Painel sobre os fluxos migratórios e escultura que integram a narrativa da exposição.',
  },
]

function readJwtRole(key) {
  const parts = key.split('.')
  if (parts.length !== 3) return null

  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'))
    return typeof decoded.role === 'string' ? decoded.role : null
  } catch {
    return null
  }
}

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  console.error(
    'Defina SUPABASE_URL (ou VITE_SUPABASE_URL) e SUPABASE_SERVICE_ROLE_KEY em .env.local.',
  )
  process.exit(1)
}

const keyRole = readJwtRole(serviceRoleKey)
const isSecretKey = serviceRoleKey.startsWith('sb_secret_')
if ((keyRole && keyRole !== 'service_role') || (!isSecretKey && keyRole !== 'service_role')) {
  console.error(
    'A chave informada não é uma service_role. O seed precisa de uma chave secreta e nunca deve usá-la no frontend.',
  )
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

for (const photo of photos) {
  const filePath = path.join(photosDir, photo.file)
  const buffer = await fs.readFile(filePath)
  const storagePath = `acervo/${photo.file}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType: 'image/jpeg',
      cacheControl: '31536000',
      upsert: true,
    })

  if (uploadError) {
    console.error(`Falha ao enviar ${photo.file}:`, uploadError.message)
    process.exit(1)
  }

  const { error: rowError } = await supabase.from('galeria').upsert(
    {
      titulo: photo.titulo,
      descricao: photo.descricao,
      categoria: photo.categoria,
      caminho_storage: storagePath,
      arquivo_url: null,
      formato: 'jpg',
      credito: credit,
      publicado: true,
    },
    { onConflict: 'caminho_storage' },
  )

  if (rowError) {
    console.error(`Falha ao registrar ${photo.file}:`, rowError.message)
    process.exit(1)
  }

  console.log(`Publicado: ${photo.file} — ${photo.titulo}`)
}

console.log(`Seed concluído: ${photos.length} fotografias publicadas na galeria.`)
