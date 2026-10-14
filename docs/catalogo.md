# Controle do catálogo

O banco `products` é a fonte de verdade da vitrine, das coleções e da lista de produtos. A migração `database-catalog-v1` transfere as opções históricas para `manual_variants` uma única vez e grava a cópia integral anterior em `catalog_migrations.backup`, dentro da mesma transação. O arquivo verificado não participa mais da renderização nem substitui edições do admin.

`catalog_group_id` mantém a associação entre registros antigos da mesma estampa. O admin lista apenas o registro principal, que contém as variantes de todo o grupo. As coleções dos registros antigos são preservadas e copiadas para o principal. Excluir o principal exclui o grupo; editar não altera a associação. URLs antigas de produtos resolvem para os dados do registro principal.

## Admin → Produtos

Cada modelo tem preço, link, foto opcional, indicação da parceira e uma seleção **Ativo**. O link determina a parceira. `active` é a escolha editorial; `available` é a disponibilidade na última conferência da Reserva. A sincronização não altera `active`, imagens, nomes, coleções nem campanhas. Edições concorrentes com uma sincronização retornam 409 antes de sobrescrever o cadastro.

O botão **Atualizar preços e disponibilidade da Reserva** força uma conferência. A vitrine também confere automaticamente ao ser acessada, no máximo uma vez por hora, com controle persistente entre instâncias da Vercel. Sem acessos não há execução em segundo plano. Novas estampas continuam sendo cadastradas no admin; esta rotina atualiza opções existentes, não cria ou associa estampas por semelhança de nome.

Links ausentes no feed e opções sem estoque ficam indisponíveis. Uma estampa que conserva uma opção da Uma Penca continua visível. Se todas as opções ficarem indisponíveis/inativas, a estampa deixa a vitrine. A Reserva tem preferência de seleção; opções da Uma Penca permanecem editáveis, sobretudo dry fit, ecobags, canecas e bottons.

O feed é validado antes da escrita: resposta HTTP bem-sucedida, colunas e registros válidos, catálogo não vazio. Se mais de 20% dos links conhecidos sumirem de uma vez, a atualização é interrompida. Falhas preservam os dados anteriores; a mensagem e a última conferência bem-sucedida aparecem no admin. Erros transitórios podem manter uma opção antiga até a próxima conferência; disponibilidade final é confirmada na loja parceira.

## Renderização e navegação

HomeLayout e CatalogCards geram componentes React com a grade completa e links de compra no HTML inicial. O JavaScript acrescenta busca, paginação, comparação e diálogo de medidas. Sem JavaScript, os links por modelo continuam acessíveis. `/colecao/[slug]` e `/produtos` usam a mesma fonte e cartões. Coleções cadastradas aparecem no menu de computador e de celular. O aviso de cookies tem texto compacto e preserva as escolhas de consentimento.

## Verificação

- `node scripts/validate-catalog-control.cjs`: preservação das variantes do Rainbow Cat após edição, pausa editorial, remoção de opções da Reserva preservando Uma Penca, rejeição de feeds inválidos e HTML completo sem JavaScript.
- `npm run test:storefront` e `npm run test:storefront:access`.
- TypeScript e build de produção com variáveis fictícias.
- Comparação somente leitura do feed atual da Reserva com o cadastro atual antes da publicação.

Não executar campanhas de teste ou edições fictícias contra o banco de produção. A cópia da migração pode ser usada para recuperação seletiva; não restaurar cegamente toda a tabela após novas edições.

## Visibilidade e ações em massa

O novo campo `products.hidden` inicia como falso, sem ocultar registros existentes. Ocultar a estampa altera apenas esse campo. Ocultar modelos altera apenas `manual_variants[].active` nos tipos e na parceira selecionados. `available` continua sob controle da Reserva. O botão Reexibir estampas não reativa modelos individualmente ocultos; Reexibir modelos não desfaz uma estampa inteira oculta nem uma indisponibilidade da loja.

No painel Produtos, filtre por nome, coleção, modelo, parceira e situação. Selecione os resultados e escolha a ação em massa. Para uma coleção de inverno: Modelo → Moletons → Selecionar resultados → Ocultar modelos → Confirmar. Hoodie, suéter e cropped de moletom são tratados juntos; camisetas e acessórios permanecem como estão. A confirmação mostra a quantidade de modelos e a parceira afetada. As ações são transacionais e exigem login e origem do próprio site. A exclusão definitiva permanece individual e separada dentro da edição.

O painel usa as situações Visível, Oculta por você, Modelos ocultos por você e Indisponível na loja. A data e os erros da última conferência da Reserva aparecem em uma seção própria. O catálogo completo continua editável, inclusive registros ocultos ou sem opções disponíveis. Coleções, categorias, quiz e sitemap respeitam a ocultação; produtos ocultos não têm página pública disponível.

Verificação adicional: `node scripts/validate-catalog-visibility.cjs` testa ocultação/restauração dos três moletons, continuidade da camiseta/ecobag, pausa após sincronização, escopo por parceira e registros de modelo único. O teste de acesso verifica autorização, origem e comandos inválidos antes de conectar ao banco. Os testes não ocultam produtos reais.

## Importação e links alterados
O admin permite buscar estampas novas no arquivo da Reserva ou importar um produto por link. A importação abre o formulário para revisar e salvar; produtos existentes são reconhecidos sem duplicação na revisão, preservando os outros fornecedores e modelos pausados. Somente modelos confirmados são importados. Links alterados são recuperados quando há uma única correspondência do slug da estampa (sem UUID e prefixo camiseta) e do modelo. Correspondências ambíguas não são usadas. Produtos consultados diretamente na loja têm tolerância de 48 horas para entrar no arquivo da Reserva; após isso a ausência volta a indicar indisponibilidade. A sincronização não publica automaticamente estampas novas.

Cadastro manual novo mantém preço, link e disponibilidade sob controle do admin. Cada variante possui Controle manual; desmarcar permite a atualização pela Reserva. Importações usam controle da Reserva com tolerância inicial de 48 horas. Ocultação e pausa editorial continuam independentes. A versão de recuperação de links inicia uma nova conferência ao acessar a vitrine e permite 25 segundos para obter o arquivo.
