// loader.js

// --------------------------------------
// Manejo de carga de secciones + menú activo
// --------------------------------------
function loadSection(filename) {
  // Quitar estado activo de todos
  document.querySelectorAll('.nav a').forEach(a => a.classList.remove('active'));

  // Marcar el link correspondiente como activo
  const activeLink = document.querySelector(`.nav a[data-section="${filename}"]`);
  if (activeLink) activeLink.classList.add('active');

  // Cambiar título sticky
  const sticky = document.getElementById("sticky-title");
  if (sticky && activeLink) {
    sticky.innerText = activeLink.innerText;
  }

  const content = document.getElementById('content');
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
      window.scrollTo({ top: 0, behavior: "smooth" });
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
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.onscroll = function() {
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
            parent.classList.toggle('active');
        });
    });

    // Cargar la sección inicial
    loadSection('inicio.html');
});