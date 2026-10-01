/* ==========================================================================
   MARCOS PEÇAS USADAS — main.js
   --------------------------------------------------------------------------
   TUDO QUE SE EDITA NO DIA A DIA ESTÁ NO BLOCO CONFIG LOGO ABAIXO.
   ========================================================================== */
(() => {
  'use strict';

  /* ========================================================================
     CONFIG — edite só aqui
     ======================================================================== */
  const CONFIG = {

    // WhatsApp: 55 + DDD + número, só dígitos.
    whatsapp: '5581981505311',

    // Mensagem que já vai escrita quando o cliente abre a conversa.
    msgPadrao: 'Olá, Marcos Peças Usadas! Estou procurando uma peça. Meu carro é: ',

    /* Peças do carrossel de estoque.
       As imagens ficam em assets/pecas/ — o nome do arquivo é o campo "img".
       Para trocar o estoque, mexa só nesta lista. */
    pecas: [
      { nome: 'Motor',              carro: 'Renault Kwid 1.0',       ano: '2023', img: 'motor-renault-kwid-2023.jpg' },
      { nome: 'Câmbio Automático',  carro: 'Hyundai HB20S 1.6',      ano: '2019', img: 'cambio-automatico-hb20s-2019.jpg' },
      { nome: 'Central Multimídia', carro: 'Volkswagen Voyage 1.6',  ano: '2021', img: 'central-multimidia-voyage-2021.jpg' },
      { nome: 'Módulo de Câmbio',   carro: 'Jeep Compass',           ano: '2022', img: 'modulo-cambio-compass-2022.jpg' },
      { nome: 'Farol Direito',      carro: 'Hyundai Creta 1.6',      ano: '2021', img: 'farol-direito-creta-2021.jpg' },
      { nome: 'Alternador',         carro: 'Hyundai Creta 1.6',      ano: '2021', img: 'alternador-creta-2021.jpg' }
    ],

    // Botões de categoria — cada um abre o WhatsApp com o assunto certo.
    categorias: [
      'Motor e Câmbio', 'Suspensão e Freios', 'Lataria e Portas',
      'Elétrica e Módulos', 'Faróis e Lanternas', 'Interior e Bancos',
      'Rodas e Pneus', 'Vidros e Retrovisores'
    ],

    // Frases que passam na tela de carregamento.
    loadMsgs: ['Abrindo o portão', 'Olhando na prateleira', 'Pode entrar'],

    // (a seção de avaliações não existe neste site — não há número a animar)
  };

  /* ======================================================================== */

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE    = window.matchMedia('(pointer: fine)').matches;

  const wa = (txt) =>
    `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(txt || CONFIG.msgPadrao)}`;

  /* ========================================================================
     1. PRELOADER
     ======================================================================== */
  function preloader() {
    const el = $('#pre');
    if (!el) { document.body.classList.remove('is-loading'); return; }

    const fill = $('.pre__fill', el);
    const pct  = $('.pre__pct', el);
    const msg  = $('.pre__msg', el);

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      fill.style.width = '100%';
      pct.textContent  = '100';
      msg.textContent  = CONFIG.loadMsgs[2];
      setTimeout(() => {
        el.classList.add('is-done');
        document.body.classList.remove('is-loading');
        // tira da árvore depois da transição para não capturar cliques
        setTimeout(() => el.classList.add('is-gone'), 1250);
      }, 320);
    };

    if (REDUCED) { finish(); return; }

    // A montagem do escudo leva ~2,5s. O preloader nunca sai antes disso,
    // senão a animação é cortada no meio — e nunca passa do teto, senão
    // vira obstáculo.
    const MONTAGEM = 2320;
    const abriu = performance.now();

    let p = 0, etapa = 0;
    const tick = setInterval(() => {
      if (done) return clearInterval(tick);
      // o progresso acompanha a montagem em vez de correr solto
      const t = Math.min(1, (performance.now() - abriu) / MONTAGEM);
      p = Math.max(p, Math.min(92, t * 88 + Math.random() * 3));
      fill.style.width = p.toFixed(1) + '%';
      pct.textContent  = String(Math.round(p)).padStart(2, '0');

      const alvo = p > 72 ? 2 : p > 38 ? 1 : 0;
      if (alvo !== etapa && alvo < 2) {
        etapa = alvo;
        msg.style.opacity = '0';
        setTimeout(() => { msg.textContent = CONFIG.loadMsgs[alvo]; msg.style.opacity = ''; }, 240);
      }
    }, 90);

    let carregou = document.readyState === 'complete';
    if (!carregou) window.addEventListener('load', () => { carregou = true; }, { once: true });

    const tentar = () => {
      if (done) return;
      const passou = performance.now() - abriu;
      if (carregou && passou >= MONTAGEM) { clearInterval(tick); finish(); }
      else setTimeout(tentar, 120);
    };
    setTimeout(tentar, MONTAGEM);

    setTimeout(() => { clearInterval(tick); finish(); }, 5200);  // teto de segurança
  }

  /* ========================================================================
     2. NAV + MENU + PROGRESSO DE SCROLL
     ======================================================================== */
  function chrome() {
    const nav      = $('#nav');
    const bar      = $('#progress');
    const burger   = $('#burger');
    const drawer   = $('#drawer');
    const waBtn    = $('#wa');

    const onScroll = () => {
      const y   = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      nav && nav.classList.toggle('is-stuck', y > 40);
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      waBtn && waBtn.classList.toggle('is-on', y > window.innerHeight * 0.45);
    };

    let raf = 0;
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; onScroll(); });
    }, { passive: true });
    onScroll();

    if (burger && drawer) {
      const setOpen = (open) => {
        burger.setAttribute('aria-expanded', String(open));
        drawer.classList.toggle('is-open', open);
        drawer.setAttribute('aria-hidden', String(!open));
        document.body.style.overflow = open ? 'hidden' : '';
      };
      burger.addEventListener('click', () =>
        setOpen(burger.getAttribute('aria-expanded') !== 'true'));
      $$('a', drawer).forEach(a => a.addEventListener('click', () => setOpen(false)));
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
          setOpen(false); burger.focus();
        }
      });
    }
  }

  /* ========================================================================
     3. REVEAL ON SCROLL
     ======================================================================== */
  function reveal() {
    const items = $$('[data-rv]');
    if (!items.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) {
      items.forEach(i => i.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    items.forEach(i => io.observe(i));
  }

  /* ========================================================================
     4. TIMELINE DO PASSO A PASSO
     ======================================================================== */
  function timeline() {
    const wrap  = $('#steps');
    if (!wrap) return;
    const fill  = $('.steps__fill', wrap);
    const steps = $$('.step', wrap);
    if (REDUCED) { fill.style.height = '100%'; steps.forEach(s => s.classList.add('is-on')); return; }

    let raf = 0;
    const draw = () => {
      raf = 0;
      const r  = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const t  = Math.max(0, Math.min(1, (vh * 0.78 - r.top) / (r.height || 1)));
      fill.style.height = (t * 100).toFixed(2) + '%';
      const mark = r.top + r.height * t;
      steps.forEach(s => {
        const sr = s.getBoundingClientRect();
        s.classList.toggle('is-on', sr.top + 14 <= mark);
      });
    };
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(draw); }, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  }

  /* ========================================================================
     5. PARALLAX DO HERO (mouse + scroll)
     ======================================================================== */
  function heroMotion() {
    const hero = $('#hero');
    const art  = $('#heroArt');
    if (!hero || !art || REDUCED) return;

    let mx = 0, my = 0, sy = 0, raf = 0;
    const apply = () => {
      raf = 0;
      art.style.transform = `translate3d(${(-mx * 9).toFixed(2)}px,${(-my * 9 + sy).toFixed(2)}px,0)`;
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(apply); };

    if (FINE) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width) * 2 - 1;
        my = ((e.clientY - r.top) / r.height) * 2 - 1;
        queue();
      });
      hero.addEventListener('pointerleave', () => { mx = my = 0; queue(); });
    }
    window.addEventListener('scroll', () => {
      const r = hero.getBoundingClientRect();
      sy = Math.max(0, Math.min(1, -r.top / (r.height || 1))) * 54;
      queue();
    }, { passive: true });
  }

  /* ========================================================================
     6. BOTÕES MAGNÉTICOS
     ======================================================================== */
  function magnetic() {
    if (REDUCED || !FINE) return;
    $$('[data-mag]').forEach(el => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = Math.max(-7, Math.min(7, (e.clientX - r.left - r.width / 2) * 0.22));
        const y = Math.max(-7, Math.min(7, (e.clientY - r.top - r.height / 2) * 0.22));
        el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ========================================================================
     7. FAQ — abre/fecha com altura animada
     ======================================================================== */
  function faq() {
    $$('.faq details').forEach(d => {
      const body = $('.faq__a', d);
      if (!body) return;
      const sum = $('summary', d);

      sum.addEventListener('click', (e) => {
        if (REDUCED) return;
        e.preventDefault();

        if (d.open) {
          body.animate(
            { height: [body.scrollHeight + 'px', '0px'], opacity: [1, 0] },
            { duration: 260, easing: 'cubic-bezier(.65,0,.35,1)' }
          ).onfinish = () => { d.open = false; body.style.height = ''; };
        } else {
          // fecha os outros — só um aberto por vez
          $$('.faq details[open]').forEach(o => {
            if (o === d) return;
            const ob = $('.faq__a', o);
            ob.animate({ height: [ob.scrollHeight + 'px', '0px'], opacity: [1, 0] },
              { duration: 220, easing: 'cubic-bezier(.65,0,.35,1)' })
              .onfinish = () => { o.open = false; ob.style.height = ''; };
          });
          d.open = true;
          body.animate(
            { height: ['0px', body.scrollHeight + 'px'], opacity: [0, 1] },
            { duration: 330, easing: 'cubic-bezier(.16,1,.3,1)' }
          ).onfinish = () => { body.style.height = ''; };
        }
      });
    });
  }

    /* ========================================================================
     9. CONTEÚDO GERADO — peças, categorias, links de WhatsApp
     ======================================================================== */
  function content() {
    // -- links de WhatsApp espalhados pela página
    $$('[data-wa]').forEach(a => {
      const t = a.getAttribute('data-wa');
      a.href = wa(t && t.trim() ? t : CONFIG.msgPadrao);
      a.target = '_blank';
      a.rel = 'noopener';
    });

    // -- carrossel de peças
    const track = $('#rail');
    if (track) {
      const ALT = 'peça usada, Marcos Peças Usadas Olinda';
      const card = (p) => {
        const legenda = `${p.carro} · ${p.ano}`;
        const texto = `Olá, GSX! Vi no site e quero saber sobre: ${p.nome} — ${legenda}`;
        const a = document.createElement('a');
        a.className = 'pc';
        a.href = wa(texto);
        a.target = '_blank';
        a.rel = 'noopener';
        a.setAttribute('aria-label', `${p.nome}, ${legenda} — perguntar no WhatsApp`);
        // A foto entra quando existir em assets/pecas/. Enquanto não existir,
        // o card cai num estado tipográfico próprio em vez de mostrar imagem
        // quebrada — e volta a ser foto sozinho assim que o arquivo aparecer.
        a.innerHTML =
          `<img src="assets/pecas/${p.img}" alt="${p.nome} de ${legenda} — ${ALT}" width="400" height="300" loading="lazy" decoding="async">` +
          `<span class="pc__sheen" aria-hidden="true"></span>` +
          `<span class="pc__tag" aria-hidden="true">Tem essa?</span>` +
          `<span class="pc__meta"><b>${p.nome}</b><span>${legenda}</span></span>`;
        const img = a.querySelector('img');
        img.addEventListener('error', () => a.classList.add('pc--sem-foto'), { once: true });
        if (img.complete && img.naturalWidth === 0) a.classList.add('pc--sem-foto');
        return a;
      };
      // duas voltas para o loop do marquee não dar buraco
      [...CONFIG.pecas, ...CONFIG.pecas].forEach(p => track.appendChild(card(p)));
    }

    // -- grade de categorias
    const cats = $('#cats');
    if (cats) {
      CONFIG.categorias.forEach((c, i) => {
        const a = document.createElement('a');
        a.className = 'cat';
        a.href = wa(`Olá, GSX! Preciso de uma peça de ${c}. Meu carro é: `);
        a.target = '_blank';
        a.rel = 'noopener';
        a.innerHTML =
          `<span class="cat__n">${String(i + 1).padStart(2, '0')}</span>` +
          `<span class="cat__sw"><span class="cat__a">${c}</span>` +
          `<span class="cat__b">Abrir conversa →</span></span>`;
        cats.appendChild(a);
      });
    }

    // -- marquees: duplica cada faixa para o loop ficar contínuo
    $$('.marq__track').forEach(t => {
      if (t.children.length === 1) t.appendChild(t.firstElementChild.cloneNode(true));
    });

    // -- ano do rodapé
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ========================================================================
     BOOT
     ======================================================================== */
  const boot = () => {
    content();
    preloader();
    chrome();
    reveal();
    timeline();
    heroMotion();
    magnetic();
    faq();
  };

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
