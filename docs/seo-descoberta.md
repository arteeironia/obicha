# Primeira melhoria de descoberta orgânica

## Problemas encontrados

- Os cartões ligavam a foto e o título às parceiras, enfraquecendo o caminho até as páginas locais de estampas. A grade interativa também não oferecia links permanentes a essas páginas.
- Coleções estavam no menu, mas não no sitemap. Metadados de coleções novas podiam herdar a canonical da home.
- As três páginas editoriais usavam listas ou categorias antigas e podiam mostrar registros ocultos ou omitir camisetas presentes como variantes.
- Camisetas LGBT e Orgulho Gay afirmavam algodão sustentável e DTG para todo o catálogo; uma página citava selo PETA. A contribuição social era generalizada para todas as compras, em vez de identificar a Uma Penca.
- Páginas locais de produtos repetiam a marca em alguns títulos, tinham canonical de alias antigo e ofereciam preços ausentes como zero nos dados estruturados.

## Correções

URLs existentes preservadas. Conteúdo distinto para Camisetas LGBT, Moda Queer e Orgulho Gay, com modelos reais e links entre coleções, peças e projeto social. Moda Queer mantém o título principal que já aparecia no Google. Bear ganha uma introdução própria; os títulos e descrições de Bear, Pride e Fetiche descrevem as coleções.

O catálogo propaga a slug local. Os cartões e a grade interativa oferecem links rastreáveis às páginas de produto. Os links externos de compra continuam por variante, com sua parceira. Páginas editoriais usam o banco e respeitam ocultação editorial e disponibilidade.

Coleções entram no sitemap. Páginas editoriais e de coleção incluem CollectionPage, ItemList e BreadcrumbList com URLs locais, sem conteúdo oculto. JSON-LD escapa texto editável. Canonical de produtos usa a slug principal e URLs de aliases redirecionam para ela. Ofertas sem preço válido não são publicadas como gratuitas; estoque das lojas externas não é presumido.

## Validação e limite

`node scripts/validate-discovery.cjs`, testes de vitrine e visibilidade, TypeScript e build. Verificar HTML e sitemap no deployment publicado. Não foram usados volumes de palavra-chave nem acesso aos relatórios do Search Console; não se promete posicionamento. Não há integração nova com Merchant Center.

Próximo diagnóstico: exportar Consultas e Páginas em Search Console → Desempenho → Resultados da pesquisa, com intervalo explícito. Comparar buscas sem o nome da marca por impressões, cliques, CTR e posição média. As pesquisas dos prints combinavam vários termos; elas não comprovam a posição de cada termo individual.
