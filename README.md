# Museu Municipal Hilmar Harry Kluck

Site institucional do Museu Municipal Hilmar Harry Kluck, em Parauapebas (PA). O projeto reúne conteúdo histórico, acervo, exposições, ações educativas, informações de visitação e um fluxo de contribuições com validação de arquivos.

## Stack

- React 19, TypeScript, Vite e Tailwind CSS 4
- Supabase para galeria em tempo real, Storage e Edge Functions
- Lucide React para ícones
- Fontes Fraunces e Inter via Fontsource

## Desenvolvimento

Requisitos: Node.js 20 ou superior.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

No macOS ou Linux, use `cp .env.example .env.local`.

Sem as variáveis do Supabase, a galeria e o formulário exibem estados de configuração pendente. Nenhum envio é simulado.

## Configuração do Supabase

1. Crie um projeto no Supabase.
2. Aplique a migração `supabase/migrations/20261102120000_museu_schema.sql` pelo SQL Editor ou pela CLI:

```powershell
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

A migração cria:

- tabela pública `galeria`, com leitura apenas de registros publicados;
- tabela privada `contribuicoes`, acessível apenas por administradores autenticados;
- tabela `museu_administradores` para autorização de edição;
- bucket público `galeria` e bucket privado `contribuicoes`;
- políticas de RLS para tabelas e Storage;
- publicação realtime da tabela `galeria`.

3. Preencha `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-ou-publishable
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-somente-para-o-seed
```

A chave `SUPABASE_SERVICE_ROLE_KEY` é usada apenas pelo script de seed. Nunca a exponha no frontend nem a versione.

4. Publique a Edge Function:

```powershell
npx supabase functions deploy enviar-contribuicao --no-verify-jwt
```

5. Configure os segredos da função:

```powershell
npx supabase secrets set ALLOWED_ORIGINS=https://www.seu-dominio.com RATE_LIMIT_SALT=uma-frase-aleatoria-longa
```

`ALLOWED_ORIGINS` aceita uma lista separada por vírgulas. Para desenvolvimento local, inclua `http://127.0.0.1:5173` e `http://localhost:5173`.

6. Publique as fotografias iniciais:

```powershell
npm run seed:galeria
```

O seed envia as dez imagens de `public/images/museu` para o bucket `galeria` e cria os registros publicados. Ele pode ser executado novamente para atualizar os mesmos arquivos.

## Administração

Para permitir que uma pessoa edite a galeria e analise contribuições:

1. Crie o usuário em Authentication no painel do Supabase.
2. Copie o UUID do usuário e execute:

```sql
insert into public.museu_administradores (user_id)
values ('UUID_DO_USUARIO');
```

O painel do Supabase, com a service role, também pode publicar imagens e revisar contribuições sem essa tabela.

## Fluxo de contribuições

O formulário envia os dados para a Edge Function `enviar-contribuicao`. A função:

- valida nome, e-mail, telefone, título, categoria, descrição e autorização;
- aplica honeypot e tempo mínimo de preenchimento;
- limita envios por IP;
- confere extensão, MIME declarado, assinatura real do arquivo e integridade estrutural;
- aceita JPG, PNG e WEBP até 10 MB e PDF até 15 MB;
- armazena o arquivo no bucket privado `contribuicoes`;
- registra a contribuição com status `pendente`, sem publicação automática.

A validação do navegador é apenas a primeira camada. A Edge Function repete todas as verificações no servidor.

## Galeria

A galeria consulta apenas registros com `publicado = true`. Novas imagens ou alterações publicadas aparecem automaticamente por meio do Supabase Realtime. O site não usa uma lista estática de imagens como substituta do banco.

## Scripts

```powershell
npm run dev
npm run build
npm run preview
npm run qa
npm run seed:galeria
```

O script de QA usa Playwright com o Microsoft Edge instalado e pressupõe o servidor em `http://127.0.0.1:5173`.

## Conteúdo e créditos

As fotografias institucionais foram obtidas na publicação oficial da Prefeitura de Parauapebas:

`https://parauapebas.pa.gov.br/destaque/museu-de-parauapebas-retrata-a-historia-e-a-cultura-dos-primeiros-habitantes/`

Crédito: Prefeitura de Parauapebas / Assessoria de Comunicação (2023).

Legendas, categorias e informações de visitação devem ser confirmadas pela equipe do museu antes da publicação definitiva.
