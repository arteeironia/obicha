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
