# Integração da vitrine e do admin

Esta proposta integra a vitrine aprovada ao Next.js e ao painel existentes. Não importa nem substitui produtos, categorias, coleções, posts, comentários, links, analytics, configurações, contas ou conteúdo do Respira. O novo item do menu é **Vitrine & campanhas** (`/admin/vitrine`). O painel antigo de **Destaques** continua disponível e seus destaques ativos aparecem numa seção adicional da home.

## Operação no painel

1. Entre com o login de admin atual e abra Vitrine & campanhas.
2. Escolha a estampa principal e edite título, descrição e legenda. Use a foto do produto ou envie outra imagem.
3. Selecione até 12 estampas para o bloco de destaques e mude a ordem pelas setas.
4. Em Banners de promoção, adicione até 10 campanhas. Preencha título, botão, destino, imagem de computador e, opcionalmente, imagem de celular. Os uploads usam o Cloudinary atual; JPG, PNG e WebP até 8 MB. Sugestões: 1600 × 500 px / 800 × 1000 px.
5. Escolha Rascunho, Ativo ou Pausado. Início e término usam o horário de São Paulo. Sem datas, uma campanha ativa aparece a partir da publicação e permanece até ser pausada.
6. Salve o rascunho e veja a prévia de computador ou celular. A prévia inclui campanhas completas em rascunho ou agendadas e exige login. Ela não altera a vitrine pública.
7. Publique o conteúdo pelo botão do painel. Na vitrine pública, apenas campanhas ativas dentro do período aparecem. O término é exclusivo: no instante do fim, o banner deixa de aparecer. Uma aba pública já aberta precisa ser recarregada para buscar a programação atual.

Edições simultâneas usam revisão e comparação atômica no banco. Se outra pessoa salvar antes, a segunda edição recebe um aviso para recarregar, em vez de sobrescrever o conteúdo silenciosamente.

## Compatibilidade e dados

- Mesmos Postgres, JWT e Cloudinary já configurados na Vercel; sem nova conta ou variável obrigatória.
- O novo conteúdo usa a chave reservada `homepage_content` na tabela existente `site_config`. O primeiro acesso é somente leitura; a chave é criada no primeiro salvamento. Não há migração, exclusão ou importação de dados.
- A API pública de configurações exclui essa chave para não expor rascunhos. Escritas na API antiga exigem o login do admin e não podem sobrescrever a chave reservada.
- O catálogo da home continua partindo dos registros atuais. O complemento verificado de 09/10/2026 preserva as 77 estampas e 485 opções da versão aprovada somente enquanto links, tipos e preços do registro continuam iguais aos da pesquisa. Ao editar esses campos no admin, o cadastro atual de variantes passa a prevalecer. Produtos novos entram a partir do link principal e das variantes cadastradas. Fotos não definem quais modelos existem.
- As tabelas de medidas são imagens originais da Reserva Ink, por modelo. Não são aplicadas aos produtos da Uma Penca. Valores finais, cores, estoque, medidas e condições são confirmados na loja parceira.
- Formulários reais, comentários, compartilhamento do quiz, URLs/metadata das páginas e o app Respira são preservados. Cabeçalho e rodapé públicos ficam no layout compartilhado `(public)`, que não muda os caminhos das URLs.
- Os rastreadores existentes e o consentimento continuam no layout raiz. Os links dos produtos identificam a estampa para a auditoria existente.

## Publicação e retorno

1. Revisar o PR desta integração, sem mesclar o PR antigo de navegação (#5).
2. Conferir o deployment de preview da Vercel com **Deployment Protection** ativo. Não compartilhar uma prévia da Vercel sem confirmar a proteção. O preview privado já entregue continua separado.
3. Testar com um banco de staging/cópia e Cloudinary de staging: salvar rascunho, enviar imagem, prévia, publicar, pausar e conflito entre duas abas. Não publicar campanhas de teste se a Vercel de preview estiver usando o banco de produção.
4. Validar visualmente computador/celular, blog, formulário e Respira na prévia. Esses fluxos não foram renderizados por um navegador nesta sessão.
5. Mesclar o PR em `main` para o deployment de produção da Vercel. Confirmar a configuração atual de produção e aguardar o deployment concluir antes de anunciar a mudança.
6. Se necessário, retornar ao deployment anterior na Vercel ou reverter o commit da integração. Nenhuma tabela foi removida. Ao retornar ao código antigo, remover/renomear a chave reservada `homepage_content` para que a antiga API genérica não exponha o rascunho.

## Validação realizada

- `npm ci` após corrigir a entrada ausente de lucide-react no lockfile.
- `npm run test:storefront`: 26 verificações; todos os 485 destinos exercitados pelo botão real no harness DOM, filtros, modelos, imagens, medidas, atualização do cadastro, início/fim de campanhas e remoção dos listeners ao sair.
- `npm run test:storefront:access`: 11 verificações das rotas reais, JWT, autorização por papel, origem, limite de corpo e proteção do preview, sem conexão ao banco de produção.
- `npx tsc --noEmit` e `npm run build` com variáveis fictícias, sem segredos nem acesso aos dados de produção.

Limites: persistência/CAS do Postgres e upload real do Cloudinary precisam do teste em staging acima. A renderização visual não foi validada por navegador. As condições das lojas externas continuam sob controle das parceiras.
