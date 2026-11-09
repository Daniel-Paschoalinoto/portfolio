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

// "Ver projetos" / menu Projetos: rola para mostrar o card do Podengo INTEIRO e centralizado na área visível
// (abaixo do cabeçalho). Se o card for maior que a tela, alinha no título "Projetos".
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function rolarParaProjetos(suave) {
  const header = document.querySelector(".site-header");
  const card = document.querySelector(".card--featured");
  const titulo = document.querySelector("#projects .section-title");
  if (!header || !card || !titulo) return;
  const headerH = header.offsetHeight;
  const area = window.innerHeight - headerH;
  const cardTop = card.getBoundingClientRect().top + window.scrollY;
  const tituloTop = titulo.getBoundingClientRect().top + window.scrollY;
  const cabe = card.offsetHeight + 24 <= area;
  const alvo = cabe ? cardTop - headerH - (area - card.offsetHeight) / 2 : tituloTop - headerH - 16;
  window.scrollTo({ top: Math.max(0, alvo), behavior: suave && !reduceMotion ? "smooth" : "instant" });
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
