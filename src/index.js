// Podengo: no Windows o botão abre direto o app da Microsoft Store (ms-windows-store), como no site do
// Podengo. Em outros aparelhos continua o link web da loja. O target some, senão fica uma aba em branco.
if (/Windows NT 10/.test(navigator.userAgent || "")) {
  document.querySelectorAll("a[data-baixar]").forEach((a) => {
    a.href = `ms-windows-store://pdp/?productid=${a.dataset.baixar}`;
    a.removeAttribute("target");
    a.removeAttribute("rel");
  });
}

// Botão "Copiar" do e-mail (mailto só funciona com app de e-mail padrão).
document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const original = btn.textContent;
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent = "Copiado!";
    } catch {
      btn.textContent = "Selecione e copie";
    }
    setTimeout(() => (btn.textContent = original), 2000);
  });
});

// Rolagem por "paradas": cada seção e cada card de projeto é uma parada. Seção = topo logo abaixo do cabeçalho;
// card = centralizado na área visível (inteiro) se couber, senão alinhado no topo (o 1º, no título "Projetos").
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const headerAltura = () => document.querySelector(".site-header")?.offsetHeight || 0;
const maxRolagem = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

// Posição absoluta que ignora transform (os cards entram com translateY na animação de revelação).
const topoAbs = (el) => {
  let y = 0;
  for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
  return y;
};

// Retorna as posições de rolagem (em ordem) em que a parada deve ser vista. Seção: uma. Card que cabe na tela:
// uma, centralizado. Card mais alto que a tela: do topo até a base, em passos com um pouco de sobreposição.
function posicoesDaParada(el) {
  const headerH = headerAltura();
  const limita = (v) => Math.round(Math.min(maxRolagem(), Math.max(0, v)));
  if (!el.matches(".card")) {
    return [limita(el.id === "top" ? 0 : topoAbs(el) - headerH + 1)];
  }
  const area = window.innerHeight - headerH;
  const h = el.offsetHeight;
  if (h + 8 <= area) return [limita(topoAbs(el) - headerH - (area - h) / 2)];
  const primeiro = el === document.querySelector("#projects .card");
  const titulo = document.querySelector("#projects .section-title");
  const inicio = (primeiro && titulo ? topoAbs(titulo) : topoAbs(el)) - headerH - 16;
  const fim = topoAbs(el) + h - window.innerHeight + 16;
  const passo = Math.max(120, area - 64);
  const pos = [limita(inicio)];
  for (let y = inicio + passo; y < fim - 8; y += passo) pos.push(limita(y));
  pos.push(limita(fim));
  return pos;
}

// Paradas a menos de 100px uma da outra viram uma só (a rolagem não pode parecer parada); fica a de baixo.
const todasAsParadas = () =>
  [...new Set(paradas.flatMap(posicoesDaParada))]
    .sort((a, b) => a - b)
    .filter((p, i, lista) => i === lista.length - 1 || lista[i + 1] - p >= 100);

const rolarPara = (top, suave) =>
  window.scrollTo({ top, behavior: suave && !reduceMotion ? "smooth" : "instant" });

const paradas = [...document.querySelectorAll("main section[data-rail]:not(#projects), #projects .card")];
const primeiroCard = document.querySelector("#projects .card");

function rolarParaProjetos(suave) {
  if (primeiroCard) rolarPara(posicoesDaParada(primeiroCard)[0], suave);
}

document.querySelectorAll('a[href="#projects"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    history.pushState(null, "", "#projects");
    rolarParaProjetos(true);
  });
});

// Link direto com #projects: o navegador pula para o início da seção e pode reajustar quando fontes e imagens
// carregam, então a centralização roda depois do carregamento (e uma vez mais, logo em seguida).
if (location.hash === "#projects") {
  window.addEventListener("load", () => {
    requestAnimationFrame(() => rolarParaProjetos(false));
    setTimeout(() => rolarParaProjetos(false), 250);
  });
}

// Barra lateral: setas vão à parada anterior/seguinte; bolinhas vão à seção. Montada aqui para não existir sem JS.
// A seção atual (bolinha acesa) vem do IntersectionObserver, sem ouvir o scroll.
const secoes = [...document.querySelectorAll("main section[data-rail]")];

if (secoes.length && "IntersectionObserver" in window) {
  const iconeCima = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
  const iconeBaixo = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  const rail = document.createElement("nav");
  rail.className = "rail";
  rail.setAttribute("aria-label", "Navegar entre as seções");
  rail.innerHTML =
    `<button type="button" class="rail-btn" aria-label="Parada anterior">${iconeCima}</button>` +
    '<div class="rail-dots"></div>' +
    `<button type="button" class="rail-btn" aria-label="Próxima parada">${iconeBaixo}</button>`;
  const [btnCima, btnBaixo] = rail.querySelectorAll(".rail-btn");
  const caixaBolinhas = rail.querySelector(".rail-dots");

  const bolinhas = secoes.map((sec) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", sec.dataset.rail);
    b.innerHTML = `<span>${sec.dataset.rail}</span>`;
    b.addEventListener("click", () =>
      rolarPara(posicoesDaParada(sec.id === "projects" && primeiroCard ? primeiroCard : sec)[0], true)
    );
    caixaBolinhas.appendChild(b);
    return b;
  });

  const marcar = (i) =>
    bolinhas.forEach((b, k) => (k === i ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current")));

  btnBaixo.addEventListener("click", () => {
    const y = window.scrollY;
    const alvo = todasAsParadas().find((p) => p > y + 8);
    rolarPara(alvo ?? maxRolagem(), true);
  });
  btnCima.addEventListener("click", () => {
    const y = window.scrollY;
    const alvo = todasAsParadas().reverse().find((p) => p < y - 8);
    rolarPara(alvo ?? 0, true);
  });

  // Faixa fina no meio da janela: a seção que a cruza é a atual.
  const olho = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) marcar(secoes.indexOf(e.target));
      });
    },
    { rootMargin: "-40% 0px -59% 0px", threshold: 0 }
  );
  secoes.forEach((sec) => olho.observe(sec));

  // Pontas da página: sentinela no topo e rodapé inteiro visível desligam a seta correspondente.
  const sentinela = document.createElement("div");
  sentinela.style.cssText = "position:absolute;top:0;left:0;width:1px;height:4px;pointer-events:none";
  document.body.prepend(sentinela);
  new IntersectionObserver((en) => (btnCima.disabled = en[0].isIntersecting)).observe(sentinela);
  const rodape = document.querySelector(".footer");
  if (rodape) {
    new IntersectionObserver(
      (en) => {
        btnBaixo.disabled = en[0].isIntersecting;
        if (en[0].isIntersecting) marcar(secoes.length - 1);
      },
      { threshold: 0.98 }
    ).observe(rodape);
  }

  marcar(0);
  btnCima.disabled = true;
  document.body.appendChild(rail);
}

// Revelação ao rolar. Sem JS (ou sem IntersectionObserver) o conteúdo fica visível.
const items = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && items.length) {
  document.documentElement.classList.add("js");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((el) => observer.observe(el));
}
