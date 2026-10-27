# Revisão de segurança da Ô bicha! — 27/10/2026

## Resultado e escopo

Revisão do código de `arteeironia/obicha`, permissões e políticas do projeto Supabase `dbihqhzskcxzvkewhhtp`, funções SQL, Edge Function disponível, metadados de Storage e dependências resolvidas no lockfile. Não é certificação de ausência de vulnerabilidades, pentest destrutivo ou perícia de incidente.

As correções de banco abaixo já foram aplicadas e verificadas. As correções de código deste conjunto só entram em produção quando a revisão for incorporada e a hospedagem concluir a publicação. Build e testes locais não comprovam o estado da publicação atual.

## Aplicado no banco

- RLS habilitado nas quatro tabelas apontadas pelo alerta; privilégios de clientes retirados; acesso de servidor preservado. Nenhuma linha apagada.
- Execução direta de três funções de trigger retirada de clientes; execução das funções pessoais limitada aos usuários conectados e servidor.
- Bloqueada inserção e edição de `quit_profiles.is_admin` pelo cliente. O usuário continua podendo criar o próprio perfil e editar campos pessoais. Verificação por privilégios de coluna confirmou ambos os comportamentos.
- `notify_solicitacao_insert` passou a usar `search_path=pg_catalog, net`; sua dependência `net.http_post` já é explicitamente qualificada.
- Security Advisor após essas alterações: zero erros e nove avisos (somatório das ocorrências).

## Correções de código preparadas

| Prioridade | Problema encontrado | Tratamento |
| --- | --- | --- |
| Crítica | Algumas operações administrativas não validavam a sessão na própria rota | Verificação de administrador e origem em edição, upload e moderação; conteúdo público continua disponível |
| Alta | Perfil permitia alteração do próprio campo administrativo | Resolvido no banco, independentemente do frontend |
| Alta | HTML do blog era renderizado sem sanitização | Sanitização na gravação, leitura administrativa e renderização pública; impede scripts, eventos e destinos de script |
| Alta | Callback no navegador aceitava destino arbitrário | Destino limitado à própria origem, incluindo bloqueio de esquemas de script e barras invertidas |
| Alta | Lockfile resolvia Next.js 16.2.11, anterior aos patches de outubro | Next.js 16.4.1 e sharp 0.35.5; lockfile atualizado e auditado |
| Média | Consulta pública de comentários incluía e-mail e relatório geral | Projeção pública sem e-mail; relatório e estatísticas pessoais restritos ao administrador |
| Média | Exclusão de comentário não comprovava propriedade | Administrador pode moderar; usuário autenticado só exclui a própria linha |
| Média | Cron aceitava chamadas se a variável secreta estivesse ausente | Recusa chamadas quando o segredo não está configurado |
| Média | Upload genérico não validava assinatura da imagem | JPG, PNG e WebP conferidos pelo tipo e assinatura; pasta fixa; login e origem exigidos |
| Média | Destino de push controlado pelo usuário poderia provocar acesso do servidor a endereços indevidos | Validação de HTTPS e provedores conhecidos tanto no cadastro quanto no envio |
| Média | Contato inseria texto diretamente no HTML do e-mail | Escape de HTML, limites de campos e limitação de frequência |
| Média | Tentativas de senha sem contenção local | Limite por instância, validação de tamanho e origem; ainda requer proteção distribuída |
| Baixa | Parâmetros numéricos sem limites | Paginação e quantidade de imagens limitadas |
| Preventiva | Criação das tabelas internas não habilitava RLS | Inicialização do catálogo agora estabelece RLS e retira acesso de clientes |

## Validações

- 85 verificações de segurança em código: requisições sem autenticação, origem externa, separação entre conteúdo público e administração, exclusão limitada ao proprietário, redirecionamentos, HTML e endpoints push. Dependências de banco e envio são simuladas; não houve escrita em dados reais nem envio de notificações ou e-mails.
- 14 verificações já existentes de acesso da vitrine.
- 26 verificações da vitrine, exercitando 485 opções de compra.
- TypeScript sem erros e build de produção concluído com configurações fictícias, sem conexão ao banco real.
- `npm audit --omit=dev`: zero vulnerabilidades conhecidas na árvore atualizada. Isso não cobre falhas de lógica da aplicação.
- Busca por padrões de credenciais privadas nos arquivos de aplicação, bibliotecas, componentes e scripts públicos: nenhuma correspondência. Não cobre histórico completo do Git, variáveis da hospedagem ou credenciais com formatos não reconhecidos.
- Todas as tabelas de `public` verificadas estão com RLS ativo. Nenhuma view em `public` e nenhum bucket no Storage foram retornados.

## Pendências e limites

1. **Publicar e validar as correções do site.** Este conjunto precisa ser incorporado e publicado; depois, conferir login administrativo, edição, comentário próprio, Google OAuth, uploads, cron e push em ambiente real. Não é correto declarar essas rotas corrigidas em produção antes disso.
2. **Privilégios amplos do banco.** Há concessões de TRUNCATE em tabelas além das quatro iniciais. RLS não controla TRUNCATE, mas o acesso depende de uma interface capaz de executar essa operação; a presença da concessão não prova exploração via REST. A revisão automática bloqueou a retirada global de TRUNCATE/REFERENCES/TRIGGER e CREATE no esquema por considerar a alteração ampla e não especificamente autorizada. Não foi aplicada. Preparar aprovação e validação por conjunto de tabelas.
3. **Proteção contra senhas vazadas.** Permanece desativada. O recurso exige plano Pro ou superior. Não houve contratação nem alteração de plano; a conexão não disponibiliza ferramenta para editar a configuração de Auth.
4. **`pg_net` no esquema público.** Extensão marcada `extrelocatable=false`; não executar simplesmente `ALTER EXTENSION ... SET SCHEMA`. Exige procedimento próprio e validação das dependências, sem apagar/recriar às cegas.
5. **Funções privilegiadas.** Parte dos avisos restantes corresponde a funções intencionalmente disponíveis para usuários conectados ou agregados públicos. `is_forum_admin`, `connect_buddy` e `get_buddy_stats` referenciam tabelas legadas não encontradas no inventário atual (`quit_forum_admins`/`quit_buddies`); tratar a compatibilidade antes de reativar essas funcionalidades. Não foram removidas nem reescritas nesta revisão.
6. **Sessões e abuso.** Limites locais reiniciam e não são compartilhados entre instâncias. Recomenda-se limite distribuído/WAF e revisão de MFA, expiração, revogação de sessões e invalidação de tokens administrativos após troca de senha. Não foi possível auditar integralmente as configurações de Auth ou da hospedagem pelos recursos disponíveis.
7. **Dados e incidente.** Não há evidência suficiente para afirmar nem excluir acesso indevido passado. Não houve perícia de todo o histórico de logs, backups, usuários administrativos atuais ou recuperação de desastre. Recomenda-se confirmar os administradores legitimamente autorizados e os mecanismos de backup.
8. **CSP.** O site ainda permite scripts inline e `unsafe-eval`; proteção por nonce exigiria adaptação e testes completos das integrações. Não foi endurecida cegamente para evitar quebra de login, métricas e páginas.

## Referências

- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public
- https://supabase.com/docs/guides/auth/password-security
- https://nextjs.org/blog/nextjs-security-update-october-14-2026
