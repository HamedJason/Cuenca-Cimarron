function renderSiteShell() {
  const isSubpage = window.location.pathname.replaceAll('\\', '/').includes('/pages/');
  const root = isSubpage ? '../' : '';
  const currentPath = window.location.pathname;
  const navItems = [
    { label: 'Inicio', href: `${root}index.html`, path: 'index.html' },
    { label: 'Juegos', href: `${root}pages/juegos.html`, path: 'juegos.html' },
    { label: 'Información', href: `${root}pages/aprende.html`, path: 'aprende.html' },
    { label: 'Consejos', href: `${root}pages/recursos.html`, path: 'recursos.html' }
  ];
  const activeItem = navItems.find((item) => currentPath.endsWith(item.path)) || (currentPath.endsWith('aprende-detalle.html') ? navItems[2] : navItems[0]);
  const navMarkup = navItems.map((item) => `<a class="nav-link${item === activeItem ? ' active' : ''}" href="${item.href}"${item === activeItem ? ' aria-current="page"' : ''}>${item.label}</a>`).join('');
  const header = document.querySelector('.site-header');
  if (header) {
    header.outerHTML = `<header class="site-header"><div class="header-row"><a class="brand" href="${root}index.html" aria-label="Cuenca Cimarrona, inicio"><img src="${root}brand/uabc-escudo-menu.png" alt="Escudo UABC" width="26" height="36"><span>Cuenca Cimarrona</span></a><nav class="site-nav" aria-label="Navegación principal">${navMarkup}</nav></div></header>`;
  }
  const footer = document.querySelector('.site-footer, .simple-footer');
  if (footer) {
    footer.outerHTML = `<footer class="site-footer" id="redes"><div class="footer-main"><a class="footer-brand" href="${root}index.html" aria-label="Cuenca Cimarrona, inicio"><img src="${root}assets/images/logo_uabc.png" alt="Escudo UABC"></a><span class="footer-copy">© 2026 · Proyecto académico UABC</span><nav class="social-block" aria-label="Redes sociales"><div class="social-links"><a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="4" y="4" width="16" height="16" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1"></circle></svg></a><a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M21 8.2a2.6 2.6 0 0 0-1.8-1.8C17.6 6 12 6 12 6s-5.6 0-7.2.4A2.6 2.6 0 0 0 3 8.2 27 27 0 0 0 2.6 12 27 27 0 0 0 3 15.8a2.6 2.6 0 0 0 1.8 1.8C6.4 18 12 18 12 18s5.6 0 7.2-.4a2.6 2.6 0 0 0 1.8-1.8 27 27 0 0 0 .4-3.8 27 27 0 0 0-.4-3.8Z"></path><path d="m10 15 5-3-5-3v6Z"></path></svg></a><a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="TikTok" title="TikTok"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 4c.3 2.2 1.6 3.5 4 3.7v3.1c-1.4 0-2.7-.4-4-1.1v5.7a5.6 5.6 0 1 1-4.8-5.5v3.1a2.5 2.5 0 1 0 1.7 2.4V4H15Z"></path></svg></a><a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1V10H8v3h2.4v8h3.1Z"></path></svg></a></div></nav></div></footer>`;
  }
}

renderSiteShell();
document.querySelectorAll('.brand b').forEach((element) => element.remove());
document.title = document.title.replace(/Cuencia/gi, 'Cuenca');
document.querySelectorAll('.brand strong, .footer-brand strong').forEach((element) => { element.textContent = 'CUENCA CIMARRONA'; });
document.querySelector('.intro-strip strong')?.replaceChildren(document.createTextNode('Cuenca Cimarrona reúne propuestas elaboradas de manera colaborativa.'));
document.querySelector('#directory-title')?.replaceChildren(document.createTextNode('Directorio de emergencia rápida'));
document.querySelector('.directory-note')?.replaceChildren(document.createTextNode('Seleccione un contacto para llamar desde su dispositivo. Ante una emergencia inmediata, llame al 911.'));

const resources = [
  { category: 'advice', className: 'card-yellow', icon: '☂', title: 'Antes de la lluvia', text: 'Revise coladeras, rutas y objetos importantes antes de que comience.', action: '', href: '#antes' },
  { category: 'advice', className: 'card-blue', icon: '⌁', title: 'Durante una tormenta', text: 'Evite cruzar arroyos y siga la información de fuentes confiables.', action: '', href: '#durante' },
  { category: 'publication', className: 'card-green', icon: '♧', title: 'Comparta lo aprendido', text: 'Invite a su equipo y comparta una acción de prevención en redes.', action: '', href: '#redes' },
  { category: 'advice', className: 'card-blue', icon: '⌂', title: 'Después de la lluvia', text: 'Revise su entorno, reporte riesgos y conserve las recomendaciones útiles.', action: '', href: '#despues' }
];

const resourceIconSvg = (icon) => ({
  '☂': '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 18 0H3Z"/><path d="M12 12v7a2 2 0 0 0 4 0"/><path d="M7 8h.01M12 6h.01M17 8h.01"/></svg>',
  '⌁': '<svg viewBox="0 0 24 24"><path d="M4 16h10a3 3 0 1 0-3-3"/><path d="M3 10h13a3 3 0 1 0-3-3"/><path d="M5 20h8"/></svg>',
  '♧': '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4"/></svg>',
  '⌂': '<svg viewBox="0 0 24 24"><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></svg>'
})[icon] || '';

const lessons = [
  { number: '01', slug: 'conozca', title: 'Comprenda El Niño', text: 'Conozca cómo este fenómeno puede modificar las lluvias y las condiciones del clima en nuestra región.', image: '../assets/images/hero-el-nino.png', tone: 'lesson-blue' },
  { number: '02', slug: 'planfamiliar', title: 'Organice un plan familiar', text: 'Acuerde rutas, responsabilidades, contactos y un punto de encuentro para su familia.', image: '../assets/images/game-decisions.png', tone: 'lesson-yellow' },
  { number: '03', slug: 'mochila', title: 'Prepare su mochila', text: 'Identifique los artículos esenciales y adapte el contenido a las necesidades de su hogar.', image: '../assets/images/game-backpack.png', tone: 'lesson-green' }
];

function renderResources() {
  const grid = document.querySelector('#resourceGrid');
  if (!grid) return;
  const adviceBase = document.body.classList.contains('subpage') ? '' : 'pages/recursos.html';
  const isAdvicePage = document.body.classList.contains('advice-page');
  const visibleResources = isAdvicePage ? resources.filter((item) => item.category === 'advice') : resources;
  grid.innerHTML = visibleResources.map((item, index) => {
    const body = `<span class="resource-icon" aria-hidden="true">${resourceIconSvg(item.icon)}</span><div>${isAdvicePage ? `<span class="resource-card-index">0${index + 1}</span>` : ''}<h3>${item.title}</h3><p>${item.text}</p>${item.action && !isAdvicePage ? `<a href="${adviceBase}${item.href}">${item.action} <span>→</span></a>` : ''}</div>`;
    return isAdvicePage
      ? `<a class="resource-card ${item.className}" href="${item.href}" aria-label="${item.title}: consulte la recomendación">${body}<span class="resource-card-arrow" aria-hidden="true">↘</span></a>`
      : `<article class="resource-card ${item.className}">${body}</article>`;
  }).join('');
}

function renderLessons() {
  const grid = document.querySelector('#lessonCards');
  if (!grid) return;
  grid.innerHTML = lessons.map((lesson) => `<article class="lesson-card ${lesson.tone}"><div class="lesson-card-image"><img src="${lesson.image}" alt=""><span class="lesson-card-number">${lesson.number}</span></div><div class="lesson-card-copy"><h3>${lesson.title}</h3><p>${lesson.text}</p><a class="text-link lesson-more" href="aprende-detalle.html?tema=${lesson.slug}">Ver información <span>→</span></a></div></article>`).join('');
}

function normalizeFormalCopy() {
  const replacements = new Map([
    ['Síguenos y comparte', 'Redes sociales'],
    ['Avanza por las ideas principales y aprende a tu ritmo.', 'Avance por las ideas principales y aprenda a su ritmo.'],
    ['Encuentra ideas rápidas y recomendaciones para antes, durante y después de una lluvia.', 'Encuentre ideas rápidas y recomendaciones para antes, durante y después de una lluvia.'],
    ['Elige una dinámica', 'Elija una dinámica'],
    ['Tu camino cuenta', 'Cada decisión cuenta'],
    ['Arma tu mochila', 'Arme su mochila'],
    ['Selecciona una opción', 'Seleccione una opción'],
    ['Conoce dinámica', 'Conozca la dinámica'],
    ['Comparte', 'Comparta'],
    ['Ideas rápidas para prepararte', 'Ideas rápidas para prepararse']
  ]);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => { if (node.parentElement?.closest('script,style')) return; node.nodeValue = node.nodeValue.replace(/\btu\b/g, 'su').replace(/\bTu\b/g, 'Su'); replacements.forEach((value, key) => { node.nodeValue = node.nodeValue.replaceAll(key, value); }); });
}

function setupGameLibrary() {
  const panel = document.querySelector('#gameDetail');
  if (!panel) return;
  const details = {
    rally: { title: 'Escape de la tormenta', text: 'Recorra estaciones, resuelva retos breves y elija decisiones que ayuden a mantenerse seguro durante una lluvia intensa.', steps: ['Forme un equipo de 2 a 5 jugadores.', 'Complete las estaciones y reúna las pistas.', 'Compare la ruta elegida y explique por qué es segura.'] },
    decisiones: { title: 'Cada decisión cuenta', text: 'Elija qué hacer ante una situación de lluvia y observe cómo cada decisión cambia el recorrido.', steps: ['Lea la situación inicial.', 'Seleccione una de las opciones disponibles.', 'Revise la consecuencia y aprenda de la decisión.'] },
    mochila: { title: 'Arme su mochila', text: 'Identifique en 60 segundos los artículos que realmente necesita para una emergencia.', steps: ['Tome los objetos disponibles.', 'Separe los artículos indispensables de los innecesarios.', 'Revise sus respuestas y comparta un consejo.'] }
  };
  const title = panel.querySelector('h2');
  const text = panel.querySelector('.game-detail-text');
  const steps = panel.querySelector('ol');
  document.querySelectorAll('.game-action').forEach((button) => button.addEventListener('click', () => {
    const detail = details[button.dataset.game];
    if (!detail) return;
    const isOpenForThisGame = !panel.hidden && title.textContent === detail.title;
    document.querySelectorAll('.game-action').forEach((item) => item.setAttribute('aria-expanded', 'false'));
    if (isOpenForThisGame) {
      panel.hidden = true;
      return;
    }
    title.textContent = detail.title;
    text.textContent = detail.text;
    steps.innerHTML = detail.steps.map((step) => `<li>${step}</li>`).join('');
    panel.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));
}

function setupLessonDetail() {
  const detail = document.querySelector('#lessonDetail');
  if (!detail) return;
  const topicContent = document.querySelector('#lessonTopicContent');
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const makeLink = (href, label) => {
    const link = make('a', 'text-link', label);
    link.href = href;
    if (/^https:/i.test(href)) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    return link;
  };
  const addSectionHeading = (section, eyebrow, title, intro) => {
    const heading = make('div', 'topic-heading');
    heading.append(make('p', 'eyebrow', eyebrow), make('h2', '', title));
    if (intro) heading.append(make('p', 'topic-lead', intro));
    section.append(heading);
    return heading;
  };
  const addBullets = (parent, items, className = 'topic-list') => {
    const list = make('ul', className);
    items.forEach((item) => list.append(make('li', '', item)));
    parent.append(list);
    return list;
  };
  const readChecks = (key) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
    } catch { return []; }
  };
  const writeChecks = (key, values) => {
    try { localStorage.setItem(key, JSON.stringify(values)); } catch { /* El contenido sigue disponible sin almacenamiento local. */ }
  };

  const content = {
    conozca: { title: 'Comprenda El Niño', intro: 'El Niño es un fenómeno climático que puede modificar las lluvias, la temperatura y las condiciones del clima en nuestra región.', body: 'Conocer el fenómeno ayuda a interpretar mejor los avisos y a prepararse con anticipación. Sus efectos no son iguales en todos los lugares, por eso es importante consultar información oficial y observar las condiciones locales.', points: ['Puede modificar los patrones de lluvia.', 'Sus efectos pueden sentirse de manera distinta en cada zona.', 'La prevención comienza con información confiable.'], image: '../assets/images/hero-el-nino.png', alt: 'Ilustración de una zona urbana de Tijuana durante la lluvia', topic: 'nino' },
    preparese: { title: 'Prepárese ante la lluvia', intro: 'Una preparación sencilla permite responder con más calma cuando las condiciones cambian.', body: 'Revise coladeras, techos, cables y rutas cercanas. Prepare una mochila con agua, linterna, documentos protegidos, botiquín y cargador portátil. Acuerde con su familia un punto de encuentro.', points: ['Identifique riesgos cercanos.', 'Prepare una mochila de emergencia.', 'Defina una ruta y un punto de encuentro.'], image: '../assets/images/game-backpack.png', alt: 'Mochila ilustrada con artículos para una emergencia' },
    comparta: { title: 'Comparta lo aprendido', intro: 'La prevención se fortalece cuando las recomendaciones útiles llegan a más personas.', body: 'Comparta una acción concreta con su equipo, familia o comunidad. Una publicación, una conversación o una dinámica pueden ayudar a que más personas reconozcan qué hacer antes y durante una tormenta.', points: ['Explique una recomendación con claridad.', 'Invite a otras personas a participar.', 'Utilice información de fuentes confiables.'], image: '../assets/images/game-decisions.png', alt: 'Ilustración de caminos que representan decisiones' },
    planfamiliar: { title: 'Prepare un plan familiar', intro: 'Organice en familia qué hacer, cómo comunicarse y dónde reunirse ante una emergencia.', body: 'Un plan familiar convierte recomendaciones generales en acuerdos que todas las personas del hogar conocen. Incluya las condiciones de su vivienda, las rutas posibles y las necesidades de niñas y niños, personas mayores, personas con discapacidad y mascotas.', points: ['Reconozca riesgos y zonas seguras.', 'Trace rutas y acuerde puntos de encuentro.', 'Asigne responsabilidades y practique simulacros.'], image: '../assets/images/hero-el-nino.png', alt: 'Ilustración de una comunidad durante una lluvia', topic: 'plan' },
    mochila: { title: 'Prepare su mochila de emergencia', intro: 'Reúna lo esencial con tiempo y adapte la lista a las necesidades de quienes viven en su hogar.', body: 'Una mochila accesible ayuda a tener a mano artículos básicos si necesita resguardarse o trasladarse. Revise su contenido con regularidad, proteja documentos y considere medicamentos, artículos de higiene y alimento para mascotas según las necesidades de su familia.', points: ['Guarde agua, alimentos, linterna y botiquín.', 'Incluya documentos y contactos protegidos.', 'Revise la mochila y ajuste su contenido para su familia.'], image: '../assets/images/game-backpack.png', alt: 'Mochila ilustrada con artículos para una emergencia', topic: 'mochila' }
  };
  const selected = content[new URLSearchParams(window.location.search).get('tema')] || content.conozca;
  detail.querySelector('h1').textContent = selected.title;
  detail.querySelector('.detail-intro').textContent = selected.intro;
  const detailBody = document.querySelector('.detail-body');
  if (detailBody) detailBody.textContent = selected.body;
  const detailPoints = document.querySelector('.detail-points');
  if (detailPoints) selected.points.forEach((point) => detailPoints.append(make('li', '', point)));
  const image = detail.querySelector('.lesson-detail-hero > img');
  if (image && selected.image) {
    image.src = selected.image;
    image.alt = selected.alt || '';
  }
  if (selected.topic === 'nino' && image) {
    const widget = make('div', 'weather-widget');
    widget.setAttribute('role', 'group');
    widget.setAttribute('aria-label', 'Escenas animadas del tiempo');
    widget.dataset.weather = 'wind';
    widget.innerHTML = `
      <div class="weather-stage">
        <svg class="weather-art" viewBox="0 0 560 250" role="img" aria-label="Viento: un árbol y hojas se mueven con las ráfagas">
          <defs><clipPath id="weather-stage-clip"><rect width="560" height="250" rx="18"/></clipPath><pattern id="weather-grass-pattern" width="12" height="14" patternUnits="userSpaceOnUse"><path d="M1 14q1-8 3-12m2 12q2-9 4-13m1 13q1-6 2-9" fill="none" stroke="#3f9a5a" stroke-width="1.5" stroke-linecap="round"/></pattern></defs>
          <g clip-path="url(#weather-stage-clip)">
            <rect class="weather-sky" width="560" height="250"/>
            <g class="weather-wind-art">
              <path class="wind-trail trail-one" d="M20 58c23-6 45-6 67 0"/><path class="wind-trail trail-two" d="M65 37c22-5 42-5 62 0"/><path class="wind-trail trail-three" d="M8 104c17-4 33-4 50 0"/>
              <g transform="translate(150 220)"><g class="wind-tree">
                <path class="tree-trunk" d="M-4 0 1-137l7-1L8 0Z"/>
                <path class="tree-branch" d="m3-88-22-23m27 5 25-26"/>
                <g class="tree-crown"><ellipse cx="0" cy="-151" rx="43" ry="34"/><ellipse cx="-28" cy="-130" rx="27" ry="22"/><ellipse cx="27" cy="-130" rx="29" ry="23"/><ellipse cx="4" cy="-120" rx="37" ry="21"/></g>
              </g></g>
              <ellipse class="wind-leaf leaf-one" cx="78" cy="75" rx="4" ry="2.5"/><ellipse class="wind-leaf leaf-two" cx="247" cy="114" rx="4" ry="2.5"/><ellipse class="wind-leaf leaf-three" cx="337" cy="81" rx="3.5" ry="2"/><ellipse class="wind-leaf leaf-four" cx="450" cy="119" rx="4" ry="2.5"/><ellipse class="wind-leaf leaf-five" cx="505" cy="63" rx="3.5" ry="2"/><ellipse class="wind-leaf leaf-six" cx="295" cy="42" rx="3" ry="2"/><ellipse class="wind-leaf leaf-seven" cx="385" cy="138" rx="3" ry="2"/>
            </g>
            <g class="weather-rain-art">
              <path class="rain-cloud" d="M185 94a24 24 0 0 1 8-46 34 34 0 0 1 62-14 28 28 0 0 1 48 16 22 22 0 0 1 32 22 20 20 0 0 1-12 22Z"/>
              <path class="rain-drop drop-one" d="m214 112-7 20m32-20-7 20m32-20-7 20m32-20-7 20m32-20-7 20"/>
            </g>
            <g class="weather-heat-art">
              <circle class="heat-sun" cx="280" cy="92" r="35"/><path class="heat-rays" d="M280 30v-14m0 152v-14m-62-62h-14m152 0h-14m-106-44-10-10m108 108-10-10m0-88 10-10m-108 108 10-10"/>
              <path class="heat-wave wave-one" d="M205 164c-10-12 10-17 0-29m45 29c-10-12 10-17 0-29m45 29c-10-12 10-17 0-29m45 29c-10-12 10-17 0-29"/>
            </g>
            <g class="weather-cold-art"><path class="snowflake flake-one" d="M136 57v30m-13-22 26 14m0-14-26 14m184 20v26m-11-19 22 12m0-12-22 12m128-65v30m-13-22 26 14m0-14-26 14m45 89v25m-11-18 22 12m0-12-22 12"/></g>
            <path class="weather-ground" d="M0 220H560v30H0z"/><rect class="weather-grass" x="0" y="207" width="560" height="14" fill="url(#weather-grass-pattern)"/>
          </g>
        </svg>
        <p class="weather-caption">Viento</p>
      </div>
      <div class="weather-controls" role="group" aria-label="Seleccione una escena del tiempo"></div>`;
    const modes = [
      { id: 'wind', label: 'Viento', description: 'Viento: un árbol y hojas se mueven con las ráfagas.' },
      { id: 'rain', label: 'Lluvia', description: 'Lluvia: las gotas caen desde una nube.' },
      { id: 'heat', label: 'Calor', description: 'Calor: el sol brilla y el aire se mueve con ondas.' },
      { id: 'cold', label: 'Frío', description: 'Frío: copos ligeros caen sobre el paisaje.' }
    ];
    const art = widget.querySelector('.weather-art');
    const caption = widget.querySelector('.weather-caption');
    const controls = widget.querySelector('.weather-controls');
    let activeMode = 0;
    let rotationTimer = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const selectMode = (index) => {
      activeMode = index;
      const mode = modes[index];
      widget.dataset.weather = mode.id;
      caption.textContent = mode.label;
      art.setAttribute('aria-label', mode.description);
      controls.querySelectorAll('button').forEach((button, buttonIndex) => button.setAttribute('aria-pressed', String(buttonIndex === index)));
    };
    const startRotation = () => {
      window.clearInterval(rotationTimer);
      if (!reducedMotion.matches && document.visibilityState === 'visible') {
        rotationTimer = window.setInterval(() => selectMode((activeMode + 1) % modes.length), 5000);
      }
    };
    modes.forEach((mode, index) => {
      const button = make('button', 'weather-control', mode.label);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(index === 0));
      button.addEventListener('click', () => { selectMode(index); startRotation(); });
      controls.append(button);
    });
    document.addEventListener('visibilitychange', startRotation);
    reducedMotion.addEventListener?.('change', startRotation);
    startRotation();
    image.replaceWith(widget);
  }
  document.title = `${selected.title} | Cuenca Cimarrona`;

  if (!topicContent) return;
  topicContent.replaceChildren();

  if (selected.topic === 'nino') {
    const oceanSection = make('section', 'topic-section ocean-topic');
    const oceanTitle = make('h2', '', '¿Qué cambia en el Pacífico?');
    oceanTitle.id = 'ocean-pacific-heading';
    oceanSection.setAttribute('aria-labelledby', oceanTitle.id);
    oceanSection.append(oceanTitle);
    const modeGroup = make('div', 'ocean-mode-switch');
    modeGroup.setAttribute('role', 'group');
    modeGroup.setAttribute('aria-label', 'Compare las condiciones del Pacífico');
    const figure = make('div', 'pac-figure');
    const visual = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    visual.classList.add('pacific', 'is-normal');
    visual.setAttribute('viewBox', '0 0 1000 440');
    visual.setAttribute('width', '1000');
    visual.setAttribute('height', '440');
    visual.setAttribute('role', 'img');
    visual.setAttribute('aria-label', 'Año normal: los vientos empujan el agua caliente hacia Asia y Australia; frente a América asciende agua fría.');
    visual.innerHTML = `
      <defs>
        <linearGradient id="pacific-detail-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd3ff"/><stop offset="1" stop-color="#e3f3ff"/></linearGradient>
        <linearGradient id="pacific-detail-deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a74d8"/><stop offset="1" stop-color="#0b2f75"/></linearGradient>
        <linearGradient id="pacific-detail-warm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e63946"/><stop offset="1" stop-color="#ffa62b"/></linearGradient>
        <clipPath id="pacific-detail-frame"><rect width="1000" height="440" rx="22"/></clipPath>
      </defs>
      <g clip-path="url(#pacific-detail-frame)">
        <rect width="1000" height="440" fill="url(#pacific-detail-sky)"/>
        <rect y="210" width="1000" height="230" fill="url(#pacific-detail-deep)"/>
        <path class="pac-warm warm-normal" d="M0 210H1000V216C780 222 520 250 300 300C180 326 80 340 0 344Z" fill="url(#pacific-detail-warm)"/>
        <path class="pac-warm warm-nino" d="M0 210H1000V286C760 290 500 288 260 286C150 286 70 288 0 290Z" fill="url(#pacific-detail-warm)"/>
        <path class="pac-surface" d="M0 210H1000"/>
        <text class="pac-tag" x="150" y="262">Agua caliente</text><text class="pac-tag" x="520" y="404">Agua fría</text>
        <g class="pac-upwell"><path d="M880 410C880 340 900 290 930 232"/><path d="M840 420C842 360 860 310 890 240"/><path d="M918 236l12-6 2 14M878 244l12-6 2 14"/></g>
        <g class="pac-winds"><g class="pac-wind w1"><path d="M780 160H620M634 148l-14 12 14 12"/></g><g class="pac-wind w2"><path d="M560 145H400M414 133l-14 12 14 12"/></g><g class="pac-wind w3"><path d="M350 170H200M214 158l-14 12 14 12"/></g></g>
        <g class="pac-storm"><g class="pac-rain"><line x1="-50" y1="100" x2="-58" y2="122"/><line x1="-25" y1="102" x2="-33" y2="124"/><line x1="0" y1="100" x2="-8" y2="122"/><line x1="25" y1="102" x2="17" y2="124"/><line x1="50" y1="100" x2="42" y2="122"/></g><path class="pac-cloud" d="M-78 92a24 24 0 0 1 8-46 34 34 0 0 1 62-14 28 28 0 0 1 48 16 22 22 0 0 1 32 22 20 20 0 0 1-12 22Z"/></g>
        <path class="pac-land pac-land-west" d="M0 150C40 140 70 160 88 210H0Z"/><path class="pac-land pac-land-east" d="M1000 120C960 128 935 160 915 210H1000Z"/>
      </g>`;
    const axis = make('p', 'pac-axis');
    axis.setAttribute('aria-hidden', 'true');
    axis.append(make('span', '', '← Asia y Australia'), make('span', '', 'América →'));
    const legend = make('ul', 'pac-legend');
    legend.setAttribute('aria-hidden', 'true');
    [['lg-warm', 'Agua caliente'], ['lg-cold', 'Agua fría'], ['lg-wind', 'Vientos alisios'], ['lg-rain', 'Nubes y lluvia']].forEach(([tone, label]) => {
      const item = make('li');
      item.append(make('span', `lg ${tone}`), document.createTextNode(label));
      legend.append(item);
    });
    figure.append(visual, axis, legend);
    const steps = make('ol', 'lab-steps');
    steps.setAttribute('aria-live', 'polite');
    const stateCopy = {
      normal: {
        label: 'Año normal: los vientos alisios soplan hacia Asia y Australia, empujan el agua cálida al oeste y frente a América asciende agua fría.',
        steps: ['Los vientos alisios soplan hacia Asia', 'Empujan el agua caliente hacia el oeste', 'Frente a América sube agua fría del fondo']
      },
      nino: {
        label: 'Año de El Niño: los vientos alisios se debilitan, el agua caliente se extiende hacia América y las nubes y la lluvia se mueven con ella.',
        steps: ['Los vientos alisios se debilitan', 'El agua caliente se extiende hacia América', 'Las nubes y la lluvia se mueven con ella']
      }
    };
    const renderSteps = (mode) => steps.replaceChildren(...stateCopy[mode].steps.map((line, index) => {
      const item = make('li', '', line);
      item.style.setProperty('--i', String(index));
      return item;
    }));
    renderSteps('normal');
    const modeButtons = ['normal', 'nino'].map((mode) => {
      const button = make('button', 'button secondary', mode === 'normal' ? 'Año normal' : 'Año de El Niño');
      button.type = 'button';
      button.setAttribute('aria-pressed', String(mode === 'normal'));
      button.addEventListener('click', () => {
        modeButtons.forEach((candidate, index) => candidate.setAttribute('aria-pressed', String(index === (mode === 'normal' ? 0 : 1))));
        visual.classList.toggle('is-nino', mode === 'nino');
        visual.classList.toggle('is-normal', mode === 'normal');
        visual.setAttribute('aria-label', stateCopy[mode].label);
        renderSteps(mode);
      });
      return button;
    });
    modeButtons.forEach((button) => modeGroup.append(button));
    const diagram = make('div', 'ocean-lab-body');
    diagram.append(figure, steps);
    const note = make('p', 'lab-note');
    note.append(document.createTextNode('Esquema simplificado, sin escala · '), makeLink('https://www.noaa.gov/understanding-el-nino', 'Explicación completa de NOAA'));
    oceanSection.append(modeGroup, diagram, note);
    topicContent.append(oceanSection);

    const surface = visual.querySelector('.pac-surface');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const seaPath = (time) => {
      let path = 'M0 216';
      for (let x = 0; x <= 1000; x += 20) {
        const y = 210 + Math.sin(x * 0.02 + time * 1.6) * 3 + Math.sin(x * 0.045 - time * 2.3) * 1.6;
        path += `L${x} ${y.toFixed(1)}`;
      }
      return path;
    };
    let seaFrame = 0;
    const animateSurface = (now) => {
      if (surface && !reduceMotion.matches && document.visibilityState === 'visible') surface.setAttribute('d', seaPath(now / 1000));
      seaFrame = requestAnimationFrame(animateSurface);
    };
    surface.setAttribute('d', seaPath(0));
    if (!reduceMotion.matches) seaFrame = requestAnimationFrame(animateSurface);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') cancelAnimationFrame(seaFrame);
      else if (!reduceMotion.matches) seaFrame = requestAnimationFrame(animateSurface);
    });
    reduceMotion.addEventListener?.('change', () => {
      cancelAnimationFrame(seaFrame);
      if (!reduceMotion.matches && document.visibilityState === 'visible') seaFrame = requestAnimationFrame(animateSurface);
    });

    const tijuanaSection = make('section', 'topic-section');
    addSectionHeading(tijuanaSection, 'EN NUESTRA REGIÓN', '¿Qué significa para Tijuana?', 'El Niño modifica probabilidades, pero no permite asegurar por sí solo cuándo o cuánto lloverá en una colonia. Consulte los avisos oficiales y prepárese para riesgos locales.');
    const outlookGrid = make('div', 'outlook-grid');
    [
      ['Pronóstico cambiante', 'Las autoridades municipales pidieron preparación anticipada ante el posible impacto del fenómeno. Revise las actualizaciones antes de tomar decisiones.'],
      ['Inundaciones y deslaves', 'Las lluvias intensas pueden elevar el riesgo en calles bajas, arroyos y laderas. Identifique rutas y zonas seguras cerca de su vivienda.'],
      ['No toda lluvia es El Niño', 'Una tormenta aislada no confirma por sí misma un episodio de El Niño. Siga los avisos meteorológicos y las instrucciones de Protección Civil.']
    ].forEach(([title, text], index) => {
      const card = make('article', `outlook-card outlook-${index + 1}`);
      card.append(make('span', 'outlook-number', `0${index + 1}`), make('h3', '', title), make('p', '', text));
      outlookGrid.append(card);
    });
    tijuanaSection.append(outlookGrid);
    const sourceNote = make('p', 'topic-source-note', 'La mesa municipal de preparación reportó el 2 de noviembre de 2026 que el posible impacto regional podía iniciar entre finales de noviembre y principios de diciembre. El pronóstico puede cambiar.');
    sourceNote.append(document.createTextNode(' '), makeLink('https://apps.tijuana.gob.mx/webpanel/comunicado/comunicadoCompleto.aspx?iIdComunicado=+37235', 'Consultar comunicado municipal'));
    tijuanaSection.append(sourceNote);
    topicContent.append(tijuanaSection);

    const resources = make('section', 'topic-section topic-resources');
    addSectionHeading(resources, 'FUENTES PARA SEGUIR APRENDIENDO', 'Consulte información oficial', 'Use fuentes actualizadas para revisar el fenómeno y las condiciones locales.');
    const sourceLinks = make('div', 'topic-source-links');
    sourceLinks.append(makeLink('https://www.noaa.gov/understanding-el-nino', 'NOAA · Entender El Niño y ENOS'), makeLink('https://smn.conagua.gob.mx/', 'SMN / CONAGUA · Avisos meteorológicos'), makeLink('https://proteccioncivil.tijuana.gob.mx/', 'Protección Civil Tijuana · Comunicados'));
    resources.append(sourceLinks);
    topicContent.append(resources);
  }

  if (selected.topic === 'plan') {
    const steps = [
      { title: 'Reconozca los riesgos', description: 'Observe su entorno y ubique zonas seguras dentro y fuera de casa.', tasks: ['Recorra su vivienda y detecte objetos que podrían caer.', 'Identifique zonas expuestas a inundación y revise instalaciones.', 'Ubique zonas seguras y solicite apoyo para reparaciones necesarias.'], tip: 'Revise cada espacio en familia. No manipule instalaciones dañadas si no cuenta con capacitación.' },
      { title: 'Trace rutas y puntos de encuentro', description: 'Defina cómo salir y dónde reunirse si no pueden permanecer en casa.', tasks: ['Dibuje un croquis con salidas y riesgos identificados.', 'Elija rutas accesibles y un punto de encuentro.', 'Comparta el croquis y los contactos de emergencia.'], tip: 'Incluya las necesidades de niñas y niños, personas mayores, personas con discapacidad y mascotas.' },
      { title: 'Acuerde cómo actuar', description: 'Asigne responsabilidades y formas de comunicación para cada integrante.', tasks: ['Acuerde quién apoyará a cada persona y a las mascotas.', 'Defina dónde consultar avisos y cómo comunicarse.', 'Acuerde cómo seguir una indicación de evacuación.'], tip: 'No todas las emergencias requieren la misma respuesta. Atienda las indicaciones de las autoridades locales.' },
      { title: 'Practique el plan', description: 'Realice simulacros y actualice los acuerdos cuando cambien sus necesidades.', tasks: ['Programe simulacros durante el año.', 'Practique rutas y puntos de encuentro sin exponerse a riesgos.', 'Revise lo aprendido y actualice el plan.'], tip: 'Un simulacro es una oportunidad para aprender y ajustar, no una competencia.' }
    ];
    renderChecklistTopic(topicContent, {
      eyebrow: 'GUÍA FAMILIAR', title: 'Cuatro pasos para organizarse', intro: 'Marque los acuerdos que ya tienen. Su avance se guarda en este navegador.', storageKey: 'cuenca.planfamiliar.checks', groups: steps, completeLabel: 'pasos completados', checklistLabel: 'acciones marcadas'
    });
    const extra = make('section', 'topic-section plan-extra');
    addSectionHeading(extra, 'PERSONALICE SU PLAN', 'Adáptelo a su hogar', 'Considere sus espacios, horarios, movilidad, medicamentos, apoyos y el cuidado de sus mascotas. Dibuje un croquis con habitaciones, salidas, riesgos y puntos de encuentro; colóquelo donde todas las personas puedan verlo.');
    const links = make('div', 'topic-source-links');
    links.append(makeLink('https://www.cenapred.gob.mx/es/Publicaciones/archivos/392-PLAN-FAMILIAR-DE-PROTECCION-CIVIL.PDF', 'Consultar guía de CENAPRED'), makeLink('aprende-detalle.html?tema=mochila', 'Prepare su mochila de emergencia'));
    extra.append(links);
    topicContent.append(extra);
  }

  if (selected.topic === 'mochila') {
    const supplies = [
      { name: 'Agua potable', detail: 'En envases cerrados; revise su caducidad.', group: 'Lo esencial', tone: 'blue', icon: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/><path d="M9 15a3 3 0 0 0 3 3"/>' },
      { name: 'Alimentos no perecederos', detail: 'Listos para consumir y adecuados para su familia.', group: 'Lo esencial', tone: 'orange', icon: '<path d="M5 7h14v13H5zM8 7V5h8v2M5 11h14"/><path d="M9 14h6"/>' },
      { name: 'Botiquín y medicamentos', detail: 'Material básico y tratamientos prescritos.', group: 'Lo esencial', tone: 'red', icon: '<rect x="4" y="7" width="16" height="13" rx="3"/><path d="M9 7V5a3 3 0 0 1 6 0v2m-3 3v7m-3.5-3.5h7"/>' },
      { name: 'Linterna y pilas', detail: 'Verifique que funcionen y agregue repuestos.', group: 'Lo esencial', tone: 'gold', icon: '<path d="M9 4h6l2 5-3 2v8h-4v-8L7 9l2-5Z"/><path d="M10 7h4m-2 4v3"/>' },
      { name: 'Radio portátil', detail: 'De pilas, para escuchar información oficial.', group: 'Comunicación y documentos', tone: 'purple', icon: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="m8 8 2-4m2 8h5m-5 3h5"/><circle cx="8" cy="15" r="1.5"/>' },
      { name: 'Documentos importantes', detail: 'Copias protegidas del agua y un directorio familiar.', group: 'Comunicación y documentos', tone: 'cyan', icon: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5M10 12h5m-5 4h5"/>' },
      { name: 'Dinero en efectivo', detail: 'Incluya monedas y billetes de baja denominación.', group: 'Comunicación y documentos', tone: 'green', icon: '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.6-.7-1.5-1-2.7-1-1.4 0-2.3.7-2.3 1.7 0 2.8 5.5 1 5.5 4 0 1.1-1 2-2.7 2-1.2 0-2.3-.4-3-1.2M12 6.5v11"/>' },
      { name: 'Batería para el celular', detail: 'Cargada y con el cable compatible.', group: 'Comunicación y documentos', tone: 'lime', icon: '<rect x="5" y="7" width="13" height="12" rx="2"/><path d="M18 11h2v4h-2M12 9l-2 4h3l-2 4"/>' },
      { name: 'Silbato', detail: 'Manténgalo a la mano para pedir ayuda.', group: 'Cuidado de su familia', tone: 'orange', icon: '<path d="M4 11h11l4-3v8l-4-3H4z"/><circle cx="7" cy="12" r="1.5"/><path d="M7 17v2"/>' },
      { name: 'Manta y ropa de abrigo', detail: 'Considere el clima y una muda de ropa.', group: 'Cuidado de su familia', tone: 'blue', icon: '<path d="M5 5h14v14H5z"/><path d="m5 9 14 6M5 14l11 5M11 5l8 3"/>' },
      { name: 'Artículos de higiene', detail: 'Incluya las necesidades de cada integrante.', group: 'Cuidado de su familia', tone: 'pink', icon: '<path d="M9 4h6m-5 0v4l-3 3v8h10v-8l-3-3V4"/><path d="M8 13h8"/>' },
      { name: 'Kit para sus mascotas', detail: 'Si tiene mascotas, agregue alimento, agua, correa y sus documentos.', group: 'Cuidado de su familia', tone: 'brown', icon: '<circle cx="12" cy="15" r="4"/><circle cx="6.5" cy="9" r="1.7"/><circle cx="10.5" cy="6.5" r="1.7"/><circle cx="14.5" cy="6.5" r="1.7"/><circle cx="18" cy="9" r="1.7"/>' }
    ];
    renderBackpackChecklist(topicContent, supplies, 'cuenca.mochila.checks');
    const extra = make('section', 'topic-section backpack-extra');
    addSectionHeading(extra, 'RECUERDE', 'Revise y personalice su mochila', 'Guárdela en un lugar accesible y compruebe su contenido con regularidad. Agregue artículos para niñas y niños, personas mayores, personas con discapacidad, tratamientos médicos o mascotas.');
    const linkRow = make('div', 'topic-source-links');
    linkRow.append(makeLink('https://www.gob.mx/cenapred/es/articulos/la-seguridad-empieza-en-casa-prepara-tu-mochila-de-emergencia', 'Consultar recomendaciones de CENAPRED'), makeLink('aprende-detalle.html?tema=planfamiliar', 'Organice su plan familiar'));
    extra.append(linkRow);
    topicContent.append(extra);
  }

  function renderBackpackChecklist(container, supplies, storageKey) {
    const section = make('section', 'topic-section backpack-topic');
    addSectionHeading(section, 'LISTA PARA PREPARAR', 'Doce artículos para tener a la mano', 'Marque lo que ya tiene listo y adapte la mochila a las necesidades de su hogar. Su avance se guarda en este navegador.');

    const hero = make('div', 'backpack-intro-card');
    const heroCopy = make('div', 'backpack-intro-copy');
    heroCopy.append(make('span', 'backpack-hero-kicker', 'PREPÁRESE CON TIEMPO'), make('h3', '', 'Una mochila lista ayuda a actuar con más calma.'), make('p', '', 'Colóquela en un lugar accesible y revise periódicamente su contenido. Incluya lo que cada persona y mascota pueda necesitar.'));
    const heroImage = make('div', 'backpack-hero-art');
    heroImage.innerHTML = '<svg viewBox="0 0 120 120" role="img" aria-label="Ilustración animada de una mochila de emergencia"><path class="bag-handle" d="M45 28v-7a15 15 0 0 1 30 0v7"/><path class="bag-body" d="M28 40a13 13 0 0 1 13-13h38a13 13 0 0 1 13 13v56a12 12 0 0 1-12 12H40a12 12 0 0 1-12-12V40Z"/><path class="bag-side" d="M28 52h-5v34h5m64-34h5v34h-5"/><path class="bag-pocket" d="M38 67a9 9 0 0 1 9-9h26a9 9 0 0 1 9 9v24H38V67Z"/><path class="bag-seam" d="M47 70h26m-26 8h26"/><rect class="bag-buckle" x="53" y="32" width="14" height="10" rx="3"/><path class="bag-water" d="M59 45s-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13Z"/></svg><span class="backpack-hero-spark">✦</span>';
    hero.append(heroCopy, heroImage);
    section.append(hero);

    const layout = make('div', 'backpack-checklist-layout');
    const list = make('div', 'backpack-supply-groups');
    const groups = [...new Set(supplies.map((supply) => supply.group))];
    const checkIds = supplies.map((_, index) => `item-${index}`);
    const validIds = new Set(checkIds);
    const saved = new Set(readChecks(storageKey).filter((id) => validIds.has(id)));
    const rowsByGroup = new Map();

    groups.forEach((groupName, groupIndex) => {
      const groupItems = supplies.map((supply, index) => ({ ...supply, index })).filter((supply) => supply.group === groupName);
      const group = make('section', `backpack-supply-group backpack-group-${groupIndex + 1}`);
      const heading = make('div', 'backpack-group-heading');
      heading.append(make('h3', '', groupName));
      const groupCount = make('span', 'backpack-group-count', `0 / ${groupItems.length}`);
      heading.append(groupCount);
      const rows = make('div', 'backpack-supply-rows');

      groupItems.forEach((supply) => {
        const id = `item-${supply.index}`;
        const row = make('label', `backpack-supply-row tone-${supply.tone}`);
        const icon = make('span', 'backpack-supply-icon');
        icon.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${supply.icon}</svg>`;
        const copy = make('span', 'backpack-supply-copy');
        copy.append(make('strong', '', supply.name), make('small', '', supply.detail));
        const checkbox = make('input');
        checkbox.type = 'checkbox';
        checkbox.checked = saved.has(id);
        checkbox.setAttribute('aria-label', `Marcar ${supply.name} como listo`);
        row.append(icon, copy, checkbox);
        row.classList.toggle('is-checked', checkbox.checked);
        checkbox.addEventListener('change', () => {
          checkbox.checked ? saved.add(id) : saved.delete(id);
          writeChecks(storageKey, [...saved]);
          row.classList.toggle('is-checked', checkbox.checked);
          updateProgress();
        });
        rows.append(row);
      });

      rowsByGroup.set(groupName, { count: groupCount, items: groupItems });
      group.append(heading, rows);
      list.append(group);
    });

    const summary = make('aside', 'backpack-progress-card');
    summary.append(make('span', 'backpack-summary-kicker', 'SU AVANCE'));
    const count = make('strong', 'backpack-summary-count', `${saved.size} / ${supplies.length}`);
    const label = make('span', 'backpack-summary-label', 'artículos listos');
    const progress = make('progress', 'backpack-summary-progress');
    progress.max = supplies.length;
    progress.value = saved.size;
    progress.setAttribute('aria-label', `${saved.size} de ${supplies.length} artículos listos`);
    const message = make('p', 'backpack-summary-note', 'Su avance se guarda automáticamente en este navegador.');
    const print = make('button', 'backpack-print-button', 'Imprimir mi lista');
    print.type = 'button';
    print.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7zM17 11h.01"/></svg> Imprimir mi lista';
    print.addEventListener('click', () => window.print());
    const reset = make('button', 'backpack-reset-button', 'Reiniciar marcas');
    reset.type = 'button';
    reset.addEventListener('click', () => {
      saved.clear();
      writeChecks(storageKey, []);
      list.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => { checkbox.checked = false; });
      list.querySelectorAll('.is-checked').forEach((row) => row.classList.remove('is-checked'));
      updateProgress();
    });
    summary.append(count, label, progress, message, print, reset);
    layout.append(list, summary);
    section.append(layout);

    const updateProgress = () => {
      count.textContent = `${saved.size} / ${supplies.length}`;
      label.textContent = saved.size === supplies.length ? 'lista completa' : 'artículos listos';
      progress.value = saved.size;
      progress.setAttribute('aria-label', `${saved.size} de ${supplies.length} artículos listos`);
      rowsByGroup.forEach(({ count: groupCount, items }) => {
        const complete = items.filter((item) => saved.has(`item-${item.index}`)).length;
        groupCount.textContent = `${complete} / ${items.length}`;
      });
      summary.classList.toggle('is-complete', saved.size === supplies.length);
    };
    updateProgress();
    container.append(section);
  }

  function renderChecklistTopic(container, options) {
    const section = make('section', 'topic-section checklist-topic');
    addSectionHeading(section, options.eyebrow, options.title, options.intro);
    const saved = new Set(readChecks(options.storageKey));
    const rows = options.groups || options.supplies;
    const total = rows.reduce((sum, group) => sum + (group.tasks?.length || 1), 0);
    const summary = make('div', 'checklist-progress');
    const count = make('strong', '', `${saved.size} / ${total}`);
    const progressLabel = make('span', '', `${options.checklistLabel}`);
    const progress = make('progress', 'topic-progress');
    progress.max = total;
    progress.value = saved.size;
    progress.setAttribute('aria-label', `${saved.size} de ${total} ${options.checklistLabel}`);
    const reset = make('button', 'text-button', 'Reiniciar marcas');
    reset.type = 'button';
    summary.append(count, progressLabel, progress, reset);
    section.append(summary);
    const grid = make('div', options.supplies ? 'supply-checklist-grid' : 'plan-steps-grid');
    const updateProgress = () => {
      count.textContent = `${saved.size} / ${total}`;
      progress.value = saved.size;
      progress.setAttribute('aria-label', `${saved.size} de ${total} ${options.checklistLabel}`);
      progressLabel.textContent = options.supplies ? `${saved.size} artículos listos` : `${saved.size} acciones marcadas`;
    };
    rows.forEach((group, groupIndex) => {
      const card = make('article', options.supplies ? 'supply-check-card' : 'plan-step-card');
      if (options.supplies) {
        card.append(make('span', 'supply-group-label', group.group), make('h3', '', group.name), make('p', '', group.detail));
        const id = `item-${groupIndex}`;
        const label = make('label', 'topic-check-row');
        const checkbox = make('input');
        checkbox.type = 'checkbox';
        checkbox.checked = saved.has(id);
        checkbox.setAttribute('aria-label', `Marcar ${group.name} como listo`);
        label.append(checkbox, make('span', '', 'Listo'));
        checkbox.addEventListener('change', () => {
          checkbox.checked ? saved.add(id) : saved.delete(id);
          writeChecks(options.storageKey, [...saved]);
          card.classList.toggle('is-checked', checkbox.checked);
          updateProgress();
        });
        card.append(label);
        card.classList.toggle('is-checked', checkbox.checked);
      } else {
        card.append(make('span', 'plan-step-number', String(groupIndex + 1).padStart(2, '0')), make('h3', '', group.title), make('p', '', group.description));
        const taskList = make('div', 'plan-task-list');
        group.tasks.forEach((task, taskIndex) => {
          const id = `${groupIndex}-${taskIndex}`;
          const label = make('label', 'topic-check-row');
          const checkbox = make('input');
          checkbox.type = 'checkbox';
          checkbox.checked = saved.has(id);
          checkbox.setAttribute('aria-label', `Marcar como completado: ${task}`);
          label.append(checkbox, make('span', '', task));
          checkbox.addEventListener('change', () => {
            checkbox.checked ? saved.add(id) : saved.delete(id);
            writeChecks(options.storageKey, [...saved]);
            card.classList.toggle('is-checked', group.tasks.every((_, index) => saved.has(`${groupIndex}-${index}`)));
            updateProgress();
          });
          taskList.append(label);
        });
        card.append(taskList, make('p', 'plan-step-tip', group.tip));
        card.classList.toggle('is-checked', group.tasks.every((_, index) => saved.has(`${groupIndex}-${index}`)));
      }
      grid.append(card);
    });
    reset.addEventListener('click', () => {
      saved.clear();
      writeChecks(options.storageKey, []);
      grid.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => { checkbox.checked = false; });
      grid.querySelectorAll('.is-checked').forEach((card) => card.classList.remove('is-checked'));
      updateProgress();
    });
    section.append(grid);
    container.append(section);
    updateProgress();
  }
}

renderResources();
renderLessons();
normalizeFormalCopy();
setupGameLibrary();
setupLessonDetail();
document.querySelectorAll('.site-nav a[href$="recursos.html"]').forEach((link) => { link.textContent = 'Consejos'; });
const socialUrls = ['https://www.instagram.com/', 'https://www.youtube.com/', 'https://www.tiktok.com/', 'https://www.facebook.com/'];
document.querySelectorAll('.social-links a').forEach((link, index) => { if (socialUrls[index]) { link.href = socialUrls[index]; link.target = '_blank'; link.rel = 'noopener'; } });

const menuToggle = document.querySelector('#menuToggle');
const siteNav = document.querySelector('#siteNav');
menuToggle?.addEventListener('click', () => { const open = siteNav.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', String(open)); });
siteNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { siteNav.classList.remove('open'); menuToggle?.setAttribute('aria-expanded', 'false'); }));

const navLinks = [...document.querySelectorAll('.site-nav a:not(.nav-cta)')];
const sections = navLinks.map((link) => link.getAttribute('href').startsWith('#') ? document.querySelector(link.getAttribute('href')) : null).filter(Boolean);
navLinks.forEach((link) => { if (link.pathname === window.location.pathname) link.classList.add('active'); });
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`)); } }), { rootMargin: '-35% 0px -55% 0px' });
  sections.forEach((section) => observer.observe(section));
}
