(function () {
  const currentPath = window.location.pathname.replaceAll('\\', '/');
  if (!(currentPath.endsWith('/') || currentPath.endsWith('/index.html'))) return;

  const ready = () => {
    const main = document.querySelector('#main-content');
    if (!main || main.dataset.hambuSectionsReady) return;
    main.dataset.hambuSectionsReady = 'true';

    const siteHeader = document.querySelector('.site-header');
    if (siteHeader) {
      const links = [
        { label: 'Inicio', href: '/', active: true },
        { label: 'Juegos', href: '/pages/juegos.html' },
        { label: 'Información', href: '/pages/aprende.html' },
        { label: 'Consejos', href: '/pages/recursos.html' }
      ];
      siteHeader.innerHTML = `<div class="header-row"><a class="brand" href="/" aria-label="Cuenca Cimarrona, inicio"><img src="/brand/uabc-escudo-menu.png" alt="Escudo UABC" width="26" height="36" onerror="this.onerror=null;this.src='/brand/uabc-escudo.png'"><span>Cuenca Cimarrona</span></a><nav class="site-nav" aria-label="Navegación principal">${links.map((link) => `<a class="nav-link${link.active ? ' active' : ''}" href="${link.href}"${link.active ? ' aria-current="page"' : ''}>${link.label}</a>`).join('')}</nav></div>`;
    }

    const dependencyHeading = [...main.querySelectorAll('h2, h3')].find((element) => /otros números/i.test(element.textContent));
    if (dependencyHeading) dependencyHeading.textContent = 'Números de dependencias';

    const formalCopy = new Map([
      ['Llama al 911', 'Llame al 911'],
      ['Toca para llamar', 'Seleccione un número para llamar'],
      ['llama a su delegación', 'llame a su delegación'],
      ['Prepárate antes de que llueva', 'Prepárese antes de que llueva'],
      ['Búscala en el mapa de inundaciones y deslaves del municipio', 'Consulte el mapa de inundaciones y deslaves del municipio']
    ]);
    const copyWalker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    while (copyWalker.nextNode()) {
      const node = copyWalker.currentNode;
      if (node.parentElement?.closest('script,style')) continue;
      let text = node.nodeValue.replace(/\btu\b/g, 'su').replace(/\bTu\b/g, 'Su');
      formalCopy.forEach((replacement, phrase) => { text = text.replaceAll(phrase, replacement); });
      node.nodeValue = text;
    }

    const preparationHeading = [...main.querySelectorAll('h2, h3')].find((element) => /prepárate|prepárese antes de que llueva/i.test(element.textContent));
    preparationHeading?.closest('section')?.remove();

    const footer = document.querySelector('.footer');
    const visitsTag = footer?.querySelector('.visits-tag');
    footer?.classList.add('hambu-footer', 'site-footer');
    if (footer) footer.innerHTML = `<div class="footer-main"><a class="footer-brand" href="/" aria-label="Cuenca Cimarrona, inicio"><img src="/assets/images/logo_uabc.png" alt="Escudo UABC"></a><span class="footer-copy">© 2026 · Proyecto académico UABC</span><nav class="social-block" aria-label="Redes sociales"><div class="social-links"><a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">◎</a><a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube">▶</a><a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="TikTok" title="TikTok">♪</a><a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook">f</a></div></nav></div>`;

    const wrapper = document.createElement('div');
    wrapper.className = 'hambu-sections';
    const informationTitleRain = Array.from({ length: 130 }, () => {
      const left = (Math.random() * 104 - 4).toFixed(1);
      const height = (12 + Math.random() * 10).toFixed(0);
      const delay = (Math.random() * -1.4).toFixed(2);
      const duration = (0.7 + Math.random() * 0.4).toFixed(2);
      const opacity = (0.7 + Math.random() * 0.3).toFixed(2);
      return `<span style="left:${left}%;height:${height}px;opacity:${opacity};animation-delay:${delay}s;animation-duration:${duration}s"></span>`;
    }).join('');
    wrapper.innerHTML = `
      <section class="hambu-content-section" id="hambu-juegos" aria-labelledby="hambu-juegos-title">
        <div class="hambu-section-heading hambu-games-heading"><div><span class="hambu-kicker">APRENDA JUGANDO</span><h2 id="hambu-juegos-title">Juegos y dinámicas</h2><p class="hambu-section-intro">Explore retos sobre rutas seguras, decisiones y mochila de emergencia.</p></div><div class="hambu-section-actions hambu-game-actions"><a href="/pages/juegos.html" class="hambu-link">Ver todos los juegos <span>↗</span></a></div></div>
        <div class="hambu-card-grid hambu-game-grid">
          <a class="hambu-card hambu-game-card" href="/pages/juegos.html" aria-label="Ver juegos: Escape de la tormenta"><img src="/assets/images/game-rally.png" alt="Ruta ilustrada durante una tormenta" loading="lazy"><span class="hambu-playing-badge" aria-label="8 personas jugando"><i aria-hidden="true"></i><strong>08</strong><span>jugando</span></span><span class="hambu-tag">RALLY · EQUIPOS</span><h3>Escape de la tormenta</h3><p>Resuelva retos sobre rutas seguras y decisiones ante la lluvia.</p></a>
          <a class="hambu-card hambu-game-card" href="/pages/juegos.html" aria-label="Ver juegos: Cada decisión cuenta"><img src="/assets/images/game-decisions.png" alt="Caminos ilustrados que representan decisiones" loading="lazy"><span class="hambu-playing-badge" aria-label="11 personas jugando"><i aria-hidden="true"></i><strong>11</strong><span>jugando</span></span><span class="hambu-tag blue">DECISIONES · INTERACTIVO</span><h3>Cada decisión cuenta</h3><p>Observe cómo cambia el recorrido al elegir una opción.</p></a>
          <a class="hambu-card hambu-game-card" href="/pages/juegos.html" aria-label="Ver juegos: Arme su mochila"><img src="/assets/images/game-backpack.png" alt="Mochila ilustrada con artículos de emergencia" loading="lazy"><span class="hambu-playing-badge" aria-label="6 personas jugando"><i aria-hidden="true"></i><strong>06</strong><span>jugando</span></span><span class="hambu-tag green">RETO · 60 SEGUNDOS</span><h3>Arme su mochila</h3><p>Identifique los artículos indispensables para una emergencia.</p></a>
        </div>
      </section>
      <section class="hambu-content-section" id="hambu-informacion" aria-labelledby="hambu-informacion-title">
        <div class="hambu-section-heading"><div><span class="hambu-kicker">INFORMACIÓN PARA COMPRENDER</span><div class="hambu-rain-title"><h2 id="hambu-informacion-title">Prepárese antes de que llueva</h2><span class="hambu-title-rain" aria-hidden="true">${informationTitleRain}</span></div><p class="hambu-section-intro">Conozca lo esencial sobre El Niño, su familia y los artículos que conviene tener listos.</p></div><div class="hambu-section-actions"><a href="/pages/aprende.html" class="hambu-link">Ver toda la información <span>↗</span></a></div></div>
        <div class="hambu-card-grid hambu-info-grid">
          <a class="hambu-info-card info-feature-card" href="/pages/aprende-detalle.html?tema=conozca" aria-label="Consulte qué es El Niño y qué puede cambiar en Tijuana"><span class="hambu-info-icon" aria-hidden="true"><svg class="pi-wind" viewBox="0 0 48 48"><path d="M4 16h26c5 0 6-8 1-8"/><path d="M4 25h36"/><path d="M4 34h22c5 0 6 8 1 8"/></svg></span><strong>Qué es El Niño</strong><p>Y qué puede cambiar en Tijuana.</p><span class="info-card-arrow" aria-hidden="true">↗</span></a>
          <a class="hambu-info-card info-feature-card" href="/pages/aprende-detalle.html?tema=planfamiliar" aria-label="Consulte cómo organizar un plan familiar"><span class="hambu-info-icon" aria-hidden="true"><svg class="pi-fold" viewBox="0 0 48 48"><path class="pf-left" d="M4 9 17 6v33L4 42Z"/><path class="pf-mid" d="M17 6l14 3v33l-14-3Z"/><path class="pf-right" d="M31 9l13-3v33l-13 3Z"/><path class="pf-route" d="M10 30c6-8 10 4 17-6s10-2 13-8"/></svg></span><strong>Plan familiar</strong><p>Acuerde dónde reunirse y cómo comunicarse.</p><span class="info-card-arrow" aria-hidden="true">↗</span></a>
          <a class="hambu-info-card info-feature-card" href="/pages/aprende-detalle.html?tema=mochila" aria-label="Consulte qué incluir en la mochila de emergencia"><span class="hambu-info-icon" aria-hidden="true"><svg class="pi-pack" viewBox="0 0 48 48"><g class="pp-item"><rect x="20" y="3" width="8" height="13" rx="2.5"/><rect class="pp-cap" x="21.5" y=".5" width="5" height="3.5" rx="1"/></g><path class="pp-handle" d="M19 12v-2a5 5 0 0 1 10 0v2"/><rect class="pp-strap" x="6.5" y="24" width="4" height="14" rx="2"/><rect class="pp-strap" x="37.5" y="24" width="4" height="14" rx="2"/><rect class="pp-body" x="10" y="13" width="28" height="33" rx="9"/><rect class="pp-pocket" x="15" y="31" width="18" height="11" rx="4"/><path class="pp-seam" d="M18 35h12"/><g class="pp-lid"><path d="M10 24v-2a9 9 0 0 1 9-9h10a9 9 0 0 1 9 9v2Z"/><rect class="pp-buckle" x="22" y="20" width="4" height="8" rx="1.5"/></g></svg></span><strong>Mochila de emergencia</strong><p>Artículos esenciales para estar preparado.</p><span class="info-card-arrow" aria-hidden="true">↗</span></a>
        </div>
      </section>
      <section class="hambu-content-section" id="hambu-consejos" aria-labelledby="hambu-consejos-title">
        <div class="hambu-section-heading"><div><span class="hambu-kicker">PARA LLEVAR CONSIGO</span><h2 id="hambu-consejos-title">Consejos para actuar mejor</h2><p class="hambu-section-intro">Recomendaciones claras para antes, durante y después de la lluvia.</p></div><div class="hambu-section-actions"><a href="/pages/recursos.html" class="hambu-link">Ver todos los consejos <span>↗</span></a></div></div>
        <div class="hambu-card-grid hambu-advice-grid">
          <a class="hambu-advice-card yellow" href="/pages/recursos.html#antes"><span class="advice-icon" aria-hidden="true"><svg class="advice-umbrella" viewBox="0 0 48 48"><path class="umbrella-canopy" d="M5 23a19 19 0 0 1 38 0c-4-3-8-3-12 0-4-3-8-3-12 0-5-3-9-3-14 0Z"/><path class="umbrella-stem" d="M24 22v15c0 5 8 6 8 0"/><path class="umbrella-rain rain-a" d="m12 30-2 5"/><path class="umbrella-rain rain-b" d="m37 31-2 5"/></svg></span><strong>Antes de la lluvia</strong><p>Revise coladeras, techos y objetos importantes antes de que comience.</p><span class="advice-card-arrow" aria-hidden="true">↗</span></a>
          <a class="hambu-advice-card blue" href="/pages/recursos.html#durante"><span class="advice-icon" aria-hidden="true"><svg class="advice-storm" viewBox="0 0 48 48"><path class="storm-cloud" d="M11 27a8 8 0 0 1 1-16 12 12 0 0 1 23 4 7 7 0 0 1 2 13H11Z"/><path class="storm-rain rain-a" d="m17 32-2 6"/><path class="storm-rain rain-b" d="m26 32-2 8"/><path class="storm-rain rain-c" d="m35 32-2 6"/></svg></span><strong>Durante una tormenta</strong><p>Evite cruzar arroyos y siga información oficial.</p><span class="advice-card-arrow" aria-hidden="true">↗</span></a>
          <a class="hambu-advice-card green" href="/pages/recursos.html#despues"><span class="advice-icon" aria-hidden="true"><svg class="advice-home" viewBox="0 0 48 48"><circle class="home-sun" cx="34" cy="13" r="5"/><path class="home-rays" d="M34 3v3m0 14v3m10-10h-3M27 13h-3m17-7-2 2m-10 10-2 2m14 0-2-2M28 8l-2-2"/><path class="home-shape" d="m7 23 17-14 17 14M12 20v21h24V20M20 41V28h9v13"/></svg></span><strong>Después de la lluvia</strong><p>Revise su entorno y reporte riesgos.</p><span class="advice-card-arrow" aria-hidden="true">↗</span></a>
        </div>
      </section>`;
    visitsTag?.remove();
    main.appendChild(wrapper);


    const socialIcons = ['<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1"></circle></svg>', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8.2a2.6 2.6 0 0 0-1.8-1.8C17.6 6 12 6 12 6s-5.6 0-7.2.4A2.6 2.6 0 0 0 3 8.2 27 27 0 0 0 2.6 12 27 27 0 0 0 3 15.8a2.6 2.6 0 0 0 1.8 1.8C6.4 18 12 18 12 18s5.6 0 7.2-.4a2.6 2.6 0 0 0 1.8-1.8 27 27 0 0 0 .4-3.8 27 27 0 0 0-.4-3.8Z"></path><path d="m10 15 5-3-5-3v6Z" fill="currentColor" stroke="none"></path></svg>', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4c.3 2.2 1.6 3.5 4 3.7v3.1c-1.4 0-2.7-.4-4-1.1v5.7a5.6 5.6 0 1 1-4.8-5.5v3.1a2.5 2.5 0 1 0 1.7 2.4V4H15Z"></path></svg>', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1V10H8v3h2.4v8h3.1Z"></path></svg>'];
    document.querySelectorAll('.site-footer .social-links a').forEach((link, index) => { if (socialIcons[index]) link.innerHTML = socialIcons[index]; });
  };

  window.addEventListener('load', ready, { once: true });
  setTimeout(ready, 1200);
})();
