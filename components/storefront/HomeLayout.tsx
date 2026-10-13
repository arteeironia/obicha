import type {Design} from '@/lib/storefront/catalog'
import type {HomeContent} from '@/lib/storefront/content'
import {CatalogCards} from './CatalogCards'
export default function HomeLayout({products,content}:{products:Design[];content:HomeContent}){
 const hero=products.find(p=>p.id===content.hero.productId);
 const collections=[...new Set(products.flatMap(p=>p.collections))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 return <>  <main >
    <section className="hero wrap" id="inicio" aria-labelledby="hero-title">
      <div className="hero-copy">
<p className="eyebrow">★ DEBOCHE, AMOR E RESISTÊNCIA</p>
<h1 id="hero-title">{content.hero.title.split('\n').map((line,i,lines)=><span key={i}>{i===lines.length-1?<em>{line}</em>:line}{i<lines.length-1&&<br/>}</span>)}</h1>
<p className="intro">{content.hero.description}</p>
<div className="hero-actions">
<a className="button red" href="#vitrine">Encontrar minha estampa <span aria-hidden="true">↓</span>
</a>
<a className="text-link" href="#modelos">Me ajuda a escolher</a>
</div>
<div className="hero-foot">
<span >ESTAMPA AUTORAL</span>
<span >PRODUÇÃO SOB DEMANDA</span>
</div>
</div>
      <div className="hero-art">
<span className="hero-stamp">ORGULHO<br  />SEM DATA<br  />MARCADA ★</span>
<button className="hero-product" id="hero-product" aria-label="Escolher modelo da Abbey Road Queer">
<img id="hero-image" width="600" height="600" fetchPriority="high" src={content.hero.image||hero?.image} alt={hero?.name||"Estampa Ô bicha!"} />
<span className="hero-product-caption"><span>{hero?.name}<small>{content.hero.caption}</small></span><span aria-hidden="true">↗</span></span></button>
<p className="hero-image-note">Imagem de referência da estampa. Veja os modelos disponíveis.</p>
</div>
    </section>
    <div className="brand-ribbon" aria-hidden="true">VISTA O DEBOCHE <span >✦</span> ESPALHE O AMOR <span >✦</span> CARREGUE A RESISTÊNCIA <span >✦</span>
</div>
    <section className="promotion-section wrap" id="promotion-banners" aria-label="Campanhas Ô bicha!" hidden>
</section>
    <section className="featured-section wrap" id="featured-section" aria-labelledby="featured-title">
<div className="section-head">
<div >
<p className="eyebrow">ESTAMPAS EM DESTAQUE</p>
<h2 id="featured-title">Orgulho em <em >boa companhia.</em>
</h2>
</div>
<a className="text-link" href="#vitrine">Ver todas as estampas ↓</a>
</div>
<div className="featured-grid" id="featured-grid">{content.featured.map(id=>products.find(p=>p.id===id)).filter((p):p is Design=>!!p).map(p=><article className="featured-card" key={p.id}><a href={p.variants[0].link} data-featured={p.id}><img src={p.image} alt={p.name} width={600} height={600} loading="lazy"/><span>{p.name} ↗</span></a></article>)}
</div>
</section>
    <section className="models-section" id="modelos" aria-labelledby="models-title">
<div className="wrap">
      <div className="section-head">
<div >
<p className="eyebrow">01 / ENCONTRE SUA PEÇA</p>
<h2 id="models-title">Mesma estampa.<br  />
<em >O seu jeito de usar.</em>
</h2>
</div>
<p >Algodão também está na regata e na oversized.<br  />O que muda é o tecido, o acabamento ou o corte. Escolha o que faz sentido pra você.</p>
</div>
      <label className="guide-picker" htmlFor="guide-model">Quero entender a diferença<select id="guide-model" aria-controls="model-panel">
<option value="cotton">Camiseta de algodão</option>
<option value="peruvian">Algodão peruano</option>
<option value="stonewashed">Camiseta estonada</option>
<option value="dryfit">Dry fit</option>
<option value="tank">Regata</option>
<option value="oversized">Oversized</option>
<option value="sweatshirt">Moletom</option>
<option value="cropped">Cropped</option>
<option value="ecobag">Ecobag</option>
<option value="bottoms">Bottons</option>
<option value="mug">Caneca</option>
</select>
</label>
      <div className="model-detail" id="model-panel" aria-live="polite">
<div >
<p className="eyebrow" id="model-kicker">
</p>
<h3 id="model-title">
</h3>
<p id="model-description">
</p>
</div>
<div className="model-facts">
<p id="model-material">
</p>
<p id="model-fit">
</p>
</div>
<button className="button navy" id="see-model">Ver estampas neste modelo ↓</button>
</div>
      <p className="model-source">A parceira e os detalhes da peça aparecem quando você escolhe o modelo. Tamanho, cor e disponibilidade são confirmados na loja.</p>
    </div>
</section>
    <section className="quiz-strip wrap" id="quiz" aria-labelledby="quiz-title">
<div >
<p className="eyebrow">NÃO SABE POR ONDE COMEÇAR?</p>
<h2 id="quiz-title">Qual estampa <em >tem a sua cara?</em>
</h2>
<p >9 perguntinhas. Zero certo ou errado. Só a sua vibe, estampada.</p>
</div>
<a className="button red" href="/quiz">Fazer o quiz da estampa ↗</a>
</section>
    <section className="catalog-section wrap" id="vitrine" aria-labelledby="catalog-title">
      <div className="section-head">
<div >
<p className="eyebrow">02 / AGORA, A SUA ESTAMPA</p>
<h2 id="catalog-title">Vista o <em >deboche.</em>
</h2>
</div>
<p >Escolha a estampa. A gente mostra os modelos<br  />e a loja certa para cada um.</p>
</div>
      <div className="catalog-controls">
<div className="search-wrap">
<label className="sr-only" htmlFor="search">Buscar estampa ou coleção</label>
<span aria-hidden="true">⌕</span>
<input type="search" id="search" placeholder="Procure uma estampa, um ícone, um deboche…" autoComplete="off" />
</div>
<label className="select-wrap">Peça ou modelo<select id="model-filter">
<option value="all">Todas as opções</option>
<option value="cotton">Camiseta de algodão</option>
<option value="peruvian">Algodão peruano</option>
<option value="stonewashed">Camiseta estonada</option>
<option value="tank">Regata</option>
<option value="oversized">Oversized</option>
<option value="sweatshirt">Moletom</option>
<option value="cropped">Cropped</option>
<option value="dryfit">Dry fit</option>
<option value="ecobag">Ecobag</option>
<option value="bottoms">Bottons</option>
<option value="mug">Caneca</option>
</select>
</label>
</div>
      <div className="collection-chips" id="collection-chips" role="group" aria-label="Filtrar por coleção">{collections.map(name=>
<button key={name} data-collection={name} aria-pressed="false">{name}</button>)}</div>
      <div className="results-row">
<p id="result-count" aria-live="polite" aria-atomic="true">{products.length} estampas</p>
<button className="clear-button" id="clear-filters" hidden>Limpar filtros ×</button>
</div>
      <div className="product-grid" id="product-grid">
<CatalogCards products={products}/>
</div>
<div className="empty-state" id="empty-state" hidden>
<span aria-hidden="true">✦</span>
<h3 >Esse encontro ainda não rolou.</h3>
<p >Tente outra estampa ou remova um dos filtros.</p>
<button className="button navy" id="empty-clear">Ver todas as estampas</button>
</div>
      <div className="load-more-wrap">
<button className="button navy" id="load-more">Ver mais estampas ↓</button>
</div>
      <p className="catalog-note" id="catalog-note">Catálogo Ô bicha!. O valor final e a disponibilidade são os da loja parceira.</p>
    </section>
    <section className="how-section" id="como-comprar" aria-labelledby="how-title">
<div className="wrap">
<div className="section-head">
<div >
<p className="eyebrow">03 / SEM MISTÉRIO</p>
<h2 id="how-title">A estampa é nossa.<br  />
<em >A compra é na parceira.</em>
</h2>
</div>
<p >Você continua com a Ô bicha!<br  />O pedido segue para quem produz e entrega.</p>
</div>
<div className="steps">
<article >
<span >01</span>
<h3 >Escolha sua estampa</h3>
<p >A foto mostra um exemplo. Abaixo dela, você encontra todas as opções de roupa e acessórios daquela estampa.</p>
</article>
<article >
<span >02</span>
<h3 >Encontre seu modelo</h3>
<p >Compare tecido, caimento e preço. O nome da parceira aparece antes de você sair daqui.</p>
</article>
<article >
<span >03</span>
<h3 >Finalize na loja</h3>
<p >O botão abre o produto escolhido. Lá você seleciona tamanho e cor, calcula o frete e paga.</p>
</article>
</div>
<div className="partner-row">
<div >
<span className="partner-name">RESERVA INK</span>
<p >Algodão, peruano, regata, oversized, cropped e moletom, conforme a estampa.</p>
</div>
<div >
<span className="partner-name">UMA PENCA</span>
<p >Dry fit, ecobags, bottons e canecas. Cada opção abre seu produto na Uma Penca.</p>
</div>
<div className="partner-help">
<p >Compras em parceiras diferentes<br  />têm pedidos e fretes separados.</p>
<a href="https://wa.me/5519989254769" target="_blank" rel="noopener noreferrer">Dúvida sobre seu pedido? Chama a gente ↗</a>
</div>
</div>
</div>
</section>
    <section className="manifesto-section" id="manifesto" aria-labelledby="manifesto-title">
<div className="wrap manifesto-layout">
<div >
<p className="eyebrow">MANIFESTO / DESDE SEMPRE, UM GRITO DE LIBERDADE</p>
<h2 id="manifesto-title">Bicha.<br  />
<em >Com orgulho.</em>
<br  />E ponto.</h2>
<p className="manifesto-signature">VISTA O DEBOCHE.<br  />ESPALHE O AMOR.<br  />CARREGUE A RESISTÊNCIA.</p>
</div>
<div className="manifesto-copy">
<blockquote >Pegamos uma palavra que tentaram usar para nos silenciar e a transformamos no nosso maior selo de orgulho, autoridade visual e estilo.</blockquote>
<p >A Ô bicha! nasceu da urgência de ressignificar. Tem a vibração da Pop Art, a paixão pela cultura geek e a potência da cultura queer. Tem marra, representatividade e deboche fino.</p>
<p >É pra quem já ouviu que precisava baixar o tom, esconder o afeto ou caber num padrão. Pra quem ocupa as ruas e quer se reconhecer no que veste.</p>
<p className="manifesto-punch">Camisetas, ecobags, canecas e bottons.<br  />Manifestos portáteis. Pra existir do seu jeito.</p>
<a className="text-link" href="/blog/quando-a-arte-e-ironia-virou-o-bicha-1779670650134" target="_blank" rel="noopener noreferrer">Como a Arte &amp; Ironia virou Ô bicha! ↗</a>
</div>
</div>
</section>
    <section className="mission-section wrap" id="missao" aria-labelledby="mission-title">
<div className="section-head">
<div >
<p className="eyebrow">NOSSA MISSÃO</p>
<h2 id="mission-title">Peças com identidade.<br  />
<em >Escolhas com propósito.</em>
</h2>
</div>
<p >Da criação ao cuidado com quem veste.<br  />O que a gente acredita precisa aparecer no que faz.</p>
</div>
<div className="mission-points">
<article >
<span >01 / REPRESENTATIVIDADE</span>
<h3 >Se reconhecer também é vestir.</h3>
<p >Estampas autorais que colocam a cultura queer, o humor e o orgulho no centro da conversa.</p>
</article>
<article >
<span >02 / SOB DEMANDA</span>
<h3 >A peça começa no seu pedido.</h3>
<p >Nossas parceiras produzem depois da compra. A Ô bicha! cria a estampa; elas fabricam e entregam.</p>
</article>
<article >
<span >03 / CUIDADO</span>
<h3 >O atendimento é com a gente.</h3>
<p >Dúvidas sobre prazo, pagamento ou troca? A conversa continua com a Ô bicha!, pelo WhatsApp ou e-mail.</p>
</article>
</div>
</section>
    <section className="cause-section" id="causa" aria-labelledby="cause-title">
<div className="wrap cause-layout">
<div >
<p className="eyebrow">NOSSA CAUSA / INSTITUTO AMARGEN</p>
<h2 id="cause-title">O orgulho veste.<br  />
<em >O apoio transforma.</em>
</h2>
<p >As compras pela Uma Penca ajudam o Instituto Amargen. Sua estampa também pode fortalecer uma rede de acolhimento e apoio.</p>
<div className="cause-actions">
<a className="button navy" href="/projeto-social">Conheça o projeto social ↗</a>
<a className="text-link" href="https://institutoamargen.com.br" target="_blank" rel="noopener noreferrer">Conheça o Instituto ↗</a>
</div>
</div>
<blockquote >“Amar gente<br  />é o nosso<br  />
<em >compromisso.</em>”</blockquote>
</div>
</section>
    <section className="universe-section wrap" id="universo" aria-labelledby="universe-title">
<div className="section-head">
<div >
<p className="eyebrow">PRA ALÉM DA ESTAMPA</p>
<h2 id="universe-title">A gente também<br  />
<em >tem o que dizer.</em>
</h2>
</div>
<p >Tem opinião, tem cuidado e tem espaço<br  />pra construir junto.</p>
</div>
<div className="universe-layout">
<article className="blog-feature">
<p className="eyebrow">BLOG / DEBOCHE COM CONTEÚDO</p>
<p className="article-date">09 de outubro de 2026</p>
<h3 >Eu tenho medo.<br  />E é por isso que<br  />não vou me calar.</h3>
<a className="button red" href="/blog/eu-tenho-medo-e-e-por-isso-que-nao-vou-me-calar-1791580200480" target="_blank" rel="noopener noreferrer">Ler o texto ↗</a>
<a className="text-link" href="/blog">Todos os textos do blog ↗</a>
</article>
<article className="universe-item">
<p className="eyebrow">RESPIRA / POR Ô BICHA!</p>
<h3 >Um dia de cada vez.</h3>
<p >Um app para acompanhar a vida sem cigarro, com espaço para os dias fáceis e os difíceis.</p>
<a className="text-link" href="/respira">Abrir o Respira</a>
</article>
<article className="universe-item">
<p className="eyebrow">PARCERIAS</p>
<h3 >Você tem uma ideia?<br  />A gente tem ouvidos.</h3>
<p >Colabs com criadores, influenciadores, lojas e marcas que compartilham deboche, amor e resistência.</p>
<a className="text-link" href="/parcerias">Vamos criar juntos ↗</a>
</article>
</div>
</section>
    <section className="social-section" id="redes" aria-labelledby="social-title">
<div className="wrap">
<p className="eyebrow">SIGA, CONVERSE, COMPARTILHE</p>
<h2 id="social-title">A gente vive <em >nas redes.</em>
</h2>
<div className="social-links">
<a href="https://www.instagram.com/obicha_camisetas/" target="_blank" rel="noopener noreferrer">
<span >Instagram</span>
<span aria-hidden="true">↗</span>
</a>
<a href="https://www.tiktok.com/@obicha_camisetas" target="_blank" rel="noopener noreferrer">
<span >TikTok</span>
<span aria-hidden="true">↗</span>
</a>
<a href="https://br.pinterest.com/Obicha_camisetas/" target="_blank" rel="noopener noreferrer">
<span >Pinterest</span>
<span aria-hidden="true">↗</span>
</a>
<a href="https://wa.me/5519989254769" target="_blank" rel="noopener noreferrer">
<span >WhatsApp</span>
<span aria-hidden="true">↗</span>
</a>
</div>
</div>
</section>
  </main>
  <dialog id="product-dialog" aria-labelledby="dialog-title">
<button className="dialog-close" id="dialog-close" aria-label="Fechar detalhes do produto">×</button>
<div className="dialog-layout">
<div className="dialog-picture">
<img id="dialog-image" alt="" width="600" height="600" />
<p id="dialog-image-note">
</p>
</div>
<div className="dialog-content">
<p className="eyebrow">SUA ESTAMPA, SEU MODELO</p>
<h2 id="dialog-title">
</h2>
<p className="dialog-label">Escolha sua peça</p>
<div className="variant-options" id="variant-options" role="group" aria-label="Modelos desta estampa">
</div>
<div className="selected-detail">
<h3 id="selected-title">
</h3>
<p id="selected-description">
</p>
</div>
<details className="size-guide" id="size-guide">
<summary id="size-guide-title">Medidas deste modelo</summary>
<div id="size-guide-content">
</div>
</details>
<div id="product-reviews" className="product-review-panel" hidden>
</div>
<p className="dialog-label" id="partner-choice-label">Disponível nas duas parceiras</p>
<div id="partner-options" className="partner-options" role="group" aria-label="Loja parceira deste modelo">
</div>
<div className="purchase-panel">
<div className="purchase-heading">
<span id="selected-partner">
</span>
<strong id="selected-price">
</strong>
</div>
<p id="destination-message">
</p>
<a className="button red buy-link" id="buy-link" target="_blank" rel="noopener noreferrer">
</a>
<p className="purchase-note">Tamanho, cor, frete e pagamento são escolhidos na loja. O preço final é o de lá.</p>
</div>
</div>
</div>
</dialog>
</>
}
