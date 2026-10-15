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
