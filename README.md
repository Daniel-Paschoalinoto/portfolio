# Portfólio — Daniel Paschoalinoto

Site: https://daniel-paschoalinoto.github.io/portfolio/

Página estática (HTML + Sass + um pequeno JS) feita com [Parcel](https://parceljs.org/). Sem frameworks de CSS, sem jQuery.

## Rodar localmente

```bash
npm install
npm start        # servidor de desenvolvimento
npm run build    # gera a pasta dist/
```

O deploy é automático: a cada push na `main`, o GitHub Actions faz o build e publica na branch `gh-pages`.

## Estrutura

- `src/index.html`: conteúdo (seções Sobre, Habilidades, Projetos e Contato)
- `src/styles.scss`: estilos, com tema claro/escuro automático
- `src/index.js`: animação de entrada ao rolar (respeita `prefers-reduced-motion`)
- `src/assets/`: imagens em WebP e currículo em PDF

Para adicionar um projeto, copie um bloco `<article class="card reveal">` em `index.html`.

## Créditos

Começou como template do [Simplefolio](https://github.com/cobidev/simplefolio) (atividade do curso FullStack da ZTM) e foi reescrito. Licença em `LICENSE.md`.
