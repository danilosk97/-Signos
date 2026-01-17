function $(q){ return document.querySelector(q); }
function $all(q){ return document.querySelectorAll(q); }
function esc(str){ return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }

function baseLayoutCurrentYear(){
  const el = $("#year");
  if (el) el.textContent = String(new Date().getFullYear());
}

function mountNavActive(){
  const path = location.pathname.replace(/\/+$/, "");
  $all("[data-nav]").forEach(a => {
    const href = a.getAttribute("href");
    if (!href) return;
    const target = href.replace(/\/+$/, "");
    if (path.endsWith(target) || (target.endsWith("index.html") && (path.endsWith("") || path.endsWith("index.html")))) {
      a.style.color = "var(--text)";
      a.style.borderColor = "var(--border)";
      a.style.background = "rgba(255,255,255,.03)";
    }
  });
}

function wireToTop(){
  const btn = $("#toTop");
  if (!btn) return;

  const onScroll = () => {
    btn.style.display = (window.scrollY > 350) ? "block" : "none";
  };

  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", onScroll, { passive:true });
  onScroll();
}

function renderHome(){
  const grid = $("#signosGrid");
  if (!grid) return;

  href="./signos/${s.slug}.html"


  const q = ($("#q")?.value || "").trim().toLowerCase();
  const list = window.SIGNOS.filter(s => {
    if (!q) return true;
    return (
      s.nome.toLowerCase().includes(q) ||
      s.elemento.toLowerCase().includes(q) ||
      s.planeta.toLowerCase().includes(q) ||
      s.modalidade.toLowerCase().includes(q)
    );
  });

  grid.innerHTML = list.map(s => `
    <a class="card" href="signos/${s.slug}.html" aria-label="Ver ${esc(s.nome)}">
      <div class="card-top">
        <span class="badge">${esc(s.elemento)} • ${esc(s.modalidade)}</span>
        <span class="badge">${esc(s.datas)}</span>
      </div>
      <div class="title">${esc(s.nome)}</div>
      <p class="desc">${esc(s.resumo)}</p>
      <div class="kv">
        <span class="chip">Planeta: ${esc(s.planeta)}</span>
      </div>
    </a>
  `).join("");

  const count = $("#count");
  if (count) count.textContent = `${list.length} de ${window.SIGNOS.length}`;
}

function wireHomeEvents(){
  const q = $("#q");
  const btn = $("#btnBuscar");
  if (!q || !btn) return;

  const go = () => renderHome();
  q.addEventListener("input", go);
  btn.addEventListener("click", go);
}

function renderSignoPage(){
  const root = $("#signoPage");
  if (!root) return;

  const slug = root.getAttribute("data-signo");
  const s = window.getSigno(slug);

  if (!s){
    root.innerHTML = `<div class="panel"><h1 class="h1">Signo não encontrado</h1><p class="p">Volte para a home.</p></div>`;
    return;
  }

  // Breadcrumbs (SEO/UX)
  const bc = $("#breadcrumbs");
  if (bc){
    bc.innerHTML = `
      <a href="../index.html">Home</a>
      <span>›</span>
      <a href="../index.html">Signos</a>
      <span>›</span>
      <span>${esc(s.nome)}</span>
    `;
  }

  // JSON-LD (SEO)
  injectJsonLd({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${s.nome}: Perfil, Amor, Trabalho e Horóscopo do Dia`,
    "description": `Tudo sobre ${s.nome}: perfil, pontos fortes, desafios, amor, trabalho e horóscopo do dia.`,
    "inLanguage": "pt-BR"
  });

  const hoje = new Date();
  const horoscopo = gerarHoroscopoDoDia(s.slug, hoje);
  const faq = buildFaq(s);

  root.innerHTML = `
    <div class="panel">
      <div class="breadcrumbs" id="breadcrumbsInner" style="margin-bottom:10px"></div>

      <h1 class="h1">${esc(s.nome)} <span class="badge">${esc(s.datas)}</span></h1>
      <p class="p">${esc(s.resumo)}</p>

      <div class="kv">
        <span class="chip">Elemento: ${esc(s.elemento)}</span>
        <span class="chip">Modalidade: ${esc(s.modalidade)}</span>
        <span class="chip">Planeta regente: ${esc(s.planeta)}</span>
      </div>

      <div class="hr"></div>

      <h2 style="margin:0 0 6px">Horóscopo de hoje</h2>
      <p class="p">${esc(horoscopo)}</p>
      <p class="note">Obs: conteúdo de entretenimento (sem promessa). Depois você pode substituir por textos editoriais.</p>
    </div>

    <div class="panel" style="margin-top:14px">
      <h2 style="margin:0 0 6px">Pontos fortes</h2>
      <div class="kv">${s.pontosFortes.map(x=>`<span class="chip">${esc(x)}</span>`).join("")}</div>

      <div class="hr"></div>

      <h2 style="margin:0 0 6px">Desafios</h2>
      <div class="kv">${s.desafios.map(x=>`<span class="chip">${esc(x)}</span>`).join("")}</div>

      <div class="hr"></div>

      <h2 style="margin:0 0 6px">Amor</h2>
      <p class="p">${esc(s.amor)}</p>

      <div class="hr"></div>

      <h2 style="margin:0 0 6px">Trabalho</h2>
      <p class="p">${esc(s.trabalho)}</p>

      <div class="hr"></div>

      <h2 style="margin:0 0 6px">Dica prática</h2>
      <p class="p">${esc(s.dica)}</p>
    </div>

    <div class="panel" style="margin-top:14px">
      <h2 style="margin:0 0 10px">Perguntas frequentes sobre ${esc(s.nome)}</h2>
      <div class="faq" id="faqBox">
        ${faq}
      </div>
      <p class="note">FAQ ajuda muito no SEO. Depois a gente expande com mais perguntas.</p>
    </div>

    <div class="ad" style="margin-top:14px">
      Espaço de anúncio (ex: Adsense retângulo)
      <br><small>Depois você cola o bloco de anúncio aqui</small>
    </div>
  `;

  // Copia breadcrumbs pro topo se existir
  const inner = $("#breadcrumbsInner");
  if (inner && bc) inner.innerHTML = bc.innerHTML;

  wireFaq();
}

function buildFaq(s){
  const itens = [
    { q:`Quais são as principais características de ${s.nome}?`, a:s.resumo },
    { q:`${s.nome} combina com quais signos?`, a:`Em geral, o elemento ${s.elemento} influencia bastante nas combinações. Mas compatibilidade real depende de vários fatores do mapa astral.` },
    { q:`Como é ${s.nome} no amor?`, a:s.amor },
    { q:`Como é ${s.nome} no trabalho?`, a:s.trabalho },
    { q:`Qual a dica prática para ${s.nome} hoje?`, a:s.dica },
  ];

  return itens.map((it, i) => `
    <div class="faq-item">
      <button class="faq-q" type="button" data-faq="${i}">
        <span>${esc(it.q)}</span>
        <span aria-hidden="true">+</span>
      </button>
      <div class="faq-a">${esc(it.a)}</div>
    </div>
  `).join("");
}

function wireFaq(){
  $all(".faq-q").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      if (!item) return;
      item.classList.toggle("open");
    });
  });
}

// Horóscopo simples (custo zero) – determinístico por dia e signo
function gerarHoroscopoDoDia(slug, date){
  const frases = [
    "Hoje o foco é simplificar. Corte excessos e faça o essencial bem feito.",
    "Uma conversa resolve mais do que suposição. Seja claro e direto.",
    "Evite reatividade. Responda com calma e você sai na frente.",
    "Se organizar 30 minutos, o resto do dia flui muito melhor.",
    "Aposte em constância: uma pequena ação hoje vale mais que prometer muito.",
    "Cuide do seu tempo. Diga não para o que drena energia.",
    "Boa hora para revisar planos e ajustar rota sem se culpar.",
    "Confie no processo: faça o próximo passo, não o perfeito.",
    "Uma oportunidade aparece quando você se coloca em movimento.",
    "Hoje é sobre limites: proteja sua energia e suas prioridades.",
  ];

  const seed = (date.getFullYear()*10000 + (date.getMonth()+1)*100 + date.getDate());
  let h = 0;
  for (let i=0;i<slug.length;i++) h = (h*31 + slug.charCodeAt(i)) >>> 0;
  const idx = (h + seed) % frases.length;

  return frases[idx];
}

function renderCompatibilidade(){
  const box = $("#compatBox");
  if (!box) return;

  const selA = $("#signoA");
  const selB = $("#signoB");
  const btn = $("#btnCalc");
  const out = $("#resultado");

  const opts = window.SIGNOS.map(s => `<option value="${esc(s.slug)}">${esc(s.nome)}</option>`).join("");
  selA.innerHTML = opts;
  selB.innerHTML = opts;

  function calc(){
    const a = window.getSigno(selA.value);
    const b = window.getSigno(selB.value);
    if (!a || !b) return;

    const score = compatScore(a, b);
    const texto = compatTexto(score, a, b);

    injectJsonLd({
      "@context":"https://schema.org",
      "@type":"WebPage",
      "name": `Compatibilidade: ${a.nome} e ${b.nome}`,
      "inLanguage":"pt-BR"
    });

    out.innerHTML = `
      <div class="panel">
        <h2 style="margin:0 0 6px">Compatibilidade: ${esc(a.nome)} + ${esc(b.nome)}</h2>
        <p class="p"><b>Nível:</b> ${score.label} (${score.value}%)</p>
        <div class="hr"></div>
        <p class="p">${esc(texto)}</p>
        <div class="hr"></div>
        <div class="kv">
          <span class="chip">${esc(a.elemento)} • ${esc(a.modalidade)}</span>
          <span class="chip">${esc(b.elemento)} • ${esc(b.modalidade)}</span>
        </div>
      </div>
    `;
  }

  btn.addEventListener("click", calc);
  calc();
}

function compatScore(a, b){
  let base = 30;

  if (a.elemento === b.elemento) base += 35;
  else if ((a.elemento==="Fogo" && b.elemento==="Ar") || (a.elemento==="Ar" && b.elemento==="Fogo")) base += 25;
  else if ((a.elemento==="Terra" && b.elemento==="Água") || (a.elemento==="Água" && b.elemento==="Terra")) base += 25;
  else base += 10;

  if (a.modalidade === b.modalidade) base += 15;

  const value = Math.max(10, Math.min(95, base));

  let label = "Média";
  if (value >= 75) label = "Alta";
  else if (value >= 55) label = "Boa";
  else if (value >= 40) label = "Ok";
  else label = "Desafiadora";

  return { value, label };
}

function compatTexto(score, a, b){
  const map = {
    "Alta": "Combinação forte: muita sintonia natural. O segredo é manter respeito e espaço individual.",
    "Boa": "Boa química e chance real de dar certo. Ajustes pequenos tornam a relação sólida.",
    "Média": "Funciona bem com comunicação e acordos claros. Rotina e expectativa precisam alinhar.",
    "Ok": "Dá certo se houver maturidade. Evitem jogos e foquem em combinar estilo de vida.",
    "Desafiadora": "Não é impossível, mas exige esforço e empatia. Sem diálogo, vira desgaste."
  };
  const extra = `Dica: ${a.nome} tende a ${a.resumo.toLowerCase()} Já ${b.nome} tende a ${b.resumo.toLowerCase()}`;
  return `${map[score.label] || map["Média"]} ${extra}`;
}

function injectJsonLd(obj){
  try{
    const existing = document.querySelector('script[data-jsonld="1"]');
    if (existing) existing.remove();
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute("data-jsonld","1");
    s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  } catch(e){}
}

document.addEventListener("DOMContentLoaded", () => {
  baseLayoutCurrentYear();
  mountNavActive();
  wireToTop();
  wireHomeEvents();
  renderHome();
  renderSignoPage();
  renderCompatibilidade();
});
