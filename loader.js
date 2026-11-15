// loader.js

// --------------------------------------
// Manejo de carga de secciones + menú activo
// --------------------------------------
// Cada sección tiene su propio enlace (#experiencia, #recursos/cap-24-...).
// loadSection cambia el hash; el listener de hashchange carga el contenido.
function sectionFromHash() {
  let h = decodeURIComponent(location.hash.replace(/^#/, '')).trim();
  if (h === 'experiencia') h = 'inicio'; // la experiencia ahora está en Inicio
  return (h ? h : 'inicio') + '.html';
}

function loadSection(filename) {
  const name = filename.replace(/\.html$/, '');
  if (sectionFromHash() === filename) {
    renderSection(filename);
  } else {
    location.hash = name;
  }
}

window.addEventListener('hashchange', () => renderSection(sectionFromHash()));

function toggleMobileMenu(forceClose) {
  const sidebar = document.querySelector('.topbar');
  const btn = document.querySelector('.menu-toggle');
  if (!sidebar) return;
  const open = forceClose ? false : !sidebar.classList.contains('menu-open');
  sidebar.classList.toggle('menu-open', open);
  if (btn) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? '✕' : '☰';
  }
}

function renderSection(filename) {
  // Cerrar menú móvil y desplegables al navegar
  toggleMobileMenu(true);
  document.querySelectorAll('.nav-parent.open').forEach(p => p.classList.remove('open'));

  // Quitar estado activo de todos
  document.querySelectorAll('.nav a').forEach(a => a.classList.remove('active'));

  // Marcar el link correspondiente como activo
  const activeLink = document.querySelector(`.nav a[data-section="${filename}"]`);
  document.querySelectorAll('.nav-parent').forEach(p => p.classList.remove('active'));
  if (activeLink) {
    activeLink.classList.add('active');
    const parent = activeLink.closest('.nav-parent');
    if (parent) parent.classList.add('active');
  }

  // Cambiar título sticky
  const sticky = document.getElementById("sticky-title");
  if (sticky && activeLink) {
    sticky.innerText = activeLink.innerText;
  }

  const content = document.getElementById('content');
  content.classList.remove('chapter');
  content.innerHTML = `
    <div class="loading">
      <p>Cargando contenido...</p>
    </div>
  `;
  
  // CAMBIO: Resetear barra de progreso
  const bar = document.getElementById("myBar");
  if(bar) bar.style.width = "0%";

  fetch("secciones/" + filename)
    .then(response => {
      if (!response.ok) throw new Error('Error al cargar ' + response.status);
      return response.text();
    })
    .then(html => {
      content.innerHTML = html;
      decorateSection(filename, content);
      const main = document.querySelector('.main-content');
      if (main) main.scrollTop = 0;
      window.scrollTo({ top: 0 });
      setTimeout(handleImageLoad, 100);
    })
    .catch(error => {
      content.innerHTML = `
        <div class="error">
          <h3>Error al cargar la sección</h3>
          <p><small>${error.message}</small></p>
          <button onclick="loadSection('inicio.html')">Volver al inicio</button>
        </div>
      `;
    });
}

// --------------------------------------
// Manejo de estados de carga de imágenes
// --------------------------------------
function handleImageLoad() {
  const images = document.querySelectorAll('.project-image');

  images.forEach(img => {
    const wrap = img.closest('.project-image-wrap');
    if (!wrap) return;

    // Estado inicial
    if (!img.complete || img.naturalWidth === 0) {
      wrap.classList.add('loading');
    }

    img.addEventListener('load', function () {
      wrap.classList.remove('loading');
    });

    img.addEventListener('error', function () {
      wrap.classList.remove('loading');
      wrap.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #64748b;">
          <p>⚠️ Imagen no disponible</p>
          <small>No se pudo cargar la imagen: ${img.alt || ''}</small>
        </div>
      `;
    });
  });
}

// --------------------------------------
// CAMBIO: Lógica de Barra de Progreso
// --------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Detectar scroll en el contenedor principal
  const mainContent = document.documentElement;
  if (mainContent) {
    window.onscroll = function() {
      var winScroll = mainContent.scrollTop;
      var height = mainContent.scrollHeight - mainContent.clientHeight;
      // Evitar division por 0
      var scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      
      var bar = document.getElementById("myBar");
      if (bar) {
        bar.style.width = scrolled + "%";
      }
    };
  }
});

// =============================================
//  FUNCIONES PARA FLASHCARDS INTERACTIVAS
// =============================================

function flipCard(card) {
  card.classList.toggle('flipped');
}

function resetAllCards() {
  const cards = document.querySelectorAll('.flashcard');
  cards.forEach(card => {
    card.classList.remove('flipped');
  });
}

function flipAllCards() {
  const cards = document.querySelectorAll('.flashcard');
  cards.forEach(card => {
    card.classList.add('flipped');
  });
}

// =============================================
//  FUNCIONES ESPECÍFICAS PARA INTERVIEW-PREP
// =============================================

function practiceByCategory(category) {
  const categorySection = document.querySelector('.category-section');
  const cards = categorySection.querySelectorAll('.flashcard');
  
  // Reiniciar solo las de esta categoría
  cards.forEach(card => card.classList.remove('flipped'));
  
  // Voltear la primera tarjeta de la categoría
  if (cards.length > 0) {
    setTimeout(() => flipCard(cards[0]), 300);
  }
}

function practiceRandom() {
  const cards = document.querySelectorAll('.flashcard');
  resetAllCards();
  setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * cards.length);
    flipCard(cards[randomIndex]);
  }, 300);
}

// Manejar el menú desplegable
document.addEventListener('DOMContentLoaded', function() {
    // Manejar clics en los toggle del menú
    document.querySelectorAll('.nav-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const parent = this.parentElement;
            parent.classList.toggle('open');
        });
    });

    // Cargar la sección indicada en la URL (o Inicio)
    renderSection(sectionFromHash());
});
// --------------------------------------
// Visor de imágenes: clic para ampliar, Esc o clic para cerrar
// --------------------------------------
document.addEventListener('click', function (e) {
  const img = e.target.closest('#content img.zoomable, #content img.project-image, #content .photo-grid img, #content .gallery img, #content .dash-card img');
  if (!img) return;
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', img.alt || 'Imagen ampliada');
  box.innerHTML = '<button class="lightbox-close" aria-label="Cerrar">✕</button>';
  const big = document.createElement('img');
  big.src = img.currentSrc || img.src;
  big.alt = img.alt;
  box.appendChild(big);
  const close = () => { box.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (ev) => { if (ev.key === 'Escape') close(); };
  box.addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  document.body.appendChild(box);
  box.querySelector('.lightbox-close').focus();
});

// Cerrar el desplegable de Recursos al hacer clic fuera
document.addEventListener('click', function (e) {
  if (!e.target.closest('.nav-parent')) {
    document.querySelectorAll('.nav-parent.open').forEach(p => p.classList.remove('open'));
  }
});

// --------------------------------------
// Capítulos de Recursos: cabecera, migas y anterior/siguiente
// --------------------------------------
const CHAPTERS = [
  { file: 'recursos/cap-01-introduction.html',        stage: 'Opportunity', num: 1,  title: 'Introduction' },
  { file: 'recursos/cap-02-knowledge.html',           stage: 'Opportunity', num: 2,  title: 'Knowledge' },
  { file: 'recursos/cap-03-ethics.html',              stage: 'Opportunity', num: 3,  title: 'Ethics' },
  { file: 'recursos/cap-04-governance.html',          stage: 'Opportunity', num: 4,  title: 'Governance' },
  { file: 'recursos/cap-05-scoping-evaluation.html',  stage: 'Opportunity', num: 5,  title: 'Scoping Evaluation' },
  { file: 'recursos/cap-06-management-review.html',   stage: 'Opportunity', num: 6,  title: 'Management Review' },
  { file: 'recursos/cap-07-prefeasibility-study.html', stage: 'Viability',  num: 7,  title: 'Prefeasibility Study' },
  { file: 'recursos/cap-08-feasibility-study.html',   stage: 'Viability',   num: 8,  title: 'Feasibility Study' },
  { file: 'recursos/cap-24-project-controls.html',    stage: 'Planning',    num: 24, title: 'Project Controls' },
  { file: 'recursos/cap-27-document-control.html',    stage: 'Planning',    num: 27, title: 'Document Management and Document Control' }
];
const PAGE_TITLES = { 'inicio.html': '', 'dashboards.html': 'Dashboards', 'recursos.html': 'Recursos', 'contacto.html': 'Contacto' };
const SITE_TITLE = 'Ander Huallpa | Control de Proyectos y PMO en construcción';

function chapterLink(ch, label) {
  return `<a href="#${ch.file.replace(/\.html$/, '')}" onclick="loadSection('${ch.file}'); return false;">
            <small>${label}</small><span>Cap. ${ch.num}, ${ch.title}</span></a>`;
}

function decorateSection(filename, content) {
  const i = CHAPTERS.findIndex(c => c.file === filename);
  if (i === -1) {
    const t = PAGE_TITLES[filename];
    document.title = t ? t + ' | Ander Huallpa' : SITE_TITLE;
    return;
  }
  const ch = CHAPTERS[i];
  document.title = `Cap. ${ch.num}, ${ch.title} | Ander Huallpa`;
  content.classList.add('chapter');
  const head = document.createElement('header');
  head.className = 'section-head chapter-head';
  head.innerHTML = `
    <p class="crumbs"><a href="#recursos" onclick="loadSection('recursos.html'); return false;">Recursos</a><span>/</span>${ch.stage}<span>/</span>Capítulo ${ch.num}</p>
    <h2>${ch.title}</h2>`;
  content.prepend(head);
  const nav = document.createElement('nav');
  nav.className = 'chapter-nav';
  nav.setAttribute('aria-label', 'Otros capítulos');
  nav.innerHTML =
    (i > 0 ? chapterLink(CHAPTERS[i - 1], 'Anterior') : '<span></span>') +
    (i < CHAPTERS.length - 1 ? chapterLink(CHAPTERS[i + 1], 'Siguiente').replace('<a ', '<a class="next" ') : '<span></span>');
  const note = content.querySelector('.source-note');
  if (note) note.before(nav); else content.append(nav);
}
