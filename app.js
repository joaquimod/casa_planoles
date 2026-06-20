/* app.js - Lògica interactiva per a la web de Casa de Planès */

document.addEventListener('DOMContentLoaded', () => {
  // --- NAVEGACIÓ I HAMBURGUESA ---
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
  const sections = document.querySelectorAll('.section');

  // Toggle Menú Hamburguesa
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    sidebar.classList.toggle('active');
  });

  // Tancar menú al fer clic en un enllaç
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      sidebar.classList.remove('active');
    });
  });

  // Tancar menú si es fa clic a fora
  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('active')) {
      menuToggle.classList.remove('active');
      sidebar.classList.remove('active');
    }
  });

  // ScrollSpy - Ressaltar enllaç actiu segons la posició
  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 150; // offset

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    sidebarLinks.forEach(link => {
      const parentLi = link.parentElement;
      parentLi.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        parentLi.classList.add('active');
      }
    });
  });

  // --- ACORDIONS (Detalls Arquitectònics) ---
  const accordionHeaders = document.querySelectorAll('.arch-accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = item.querySelector('.arch-accordion-content');
      
      // Tancar altres acordions
      document.querySelectorAll('.arch-accordion-item').forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.arch-accordion-content').style.maxHeight = null;
        }
      });

      // Toggle actual
      item.classList.toggle('active');
      if (item.classList.contains('active')) {
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = null;
      }
    });
  });

  // Obrir el primer acordió per defecte
  if (accordionHeaders.length > 0) {
    accordionHeaders[0].click();
  }


  // --- FILTRE I CERCA DE RUTES ---
  const searchInput = document.getElementById('route-search');
  const filterBtns = document.querySelectorAll('.filter-buttons .btn');
  const routeCards = document.querySelectorAll('.route-card');

  let activeCategory = 'all';
  let searchText = '';

  function filterRoutes() {
    routeCards.forEach(card => {
      const type = card.getAttribute('data-type');
      const name = card.querySelector('.route-name').textContent.toLowerCase();
      const desc = card.querySelector('.route-desc').textContent.toLowerCase();
      const matchesCategory = activeCategory === 'all' || type === activeCategory;
      const matchesSearch = name.includes(searchText) || desc.includes(searchText);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Cerca de text
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchText = e.target.value.toLowerCase();
      filterRoutes();
    });
  }

  // Clic en botons de filtre
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-filter');
      filterRoutes();
    });
  });


  // --- ORDENACIÓ DE LA TAULA DE PICS ---
  const table = document.getElementById('peaks-table');
  if (table) {
    const headers = table.querySelectorAll('th.sortable');
    headers.forEach(header => {
      header.addEventListener('click', () => {
        const columnIndex = Array.from(header.parentElement.children).indexOf(header);
        const isNumeric = header.getAttribute('data-type') === 'number';
        const isAscending = !header.classList.contains('sort-asc');

        // Reset caps de taula
        headers.forEach(h => {
          h.classList.remove('sort-asc', 'sort-desc');
        });

        header.classList.add(isAscending ? 'sort-asc' : 'sort-desc');

        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));

        rows.sort((rowA, rowB) => {
          let cellA = rowA.children[columnIndex].textContent.trim();
          let cellB = rowB.children[columnIndex].textContent.trim();

          if (isNumeric) {
            // Extreure el nombre (p. ex. "3,58 km" -> 3.58, "1.450 m" -> 1450)
            cellA = parseFloat(cellA.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, ''));
            cellB = parseFloat(cellB.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, ''));
          }

          if (cellA < cellB) return isAscending ? -1 : 1;
          if (cellA > cellB) return isAscending ? 1 : -1;
          return 0;
        });

        // Re-inserir files ordenades
        rows.forEach(row => tbody.appendChild(row));
      });
    });
  }


  // --- GALERIA FOTOGRÀFICA I LIGHTBOX ---
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-image');
  const lightboxDesc = lightbox.querySelector('.lightbox-desc');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  const lightboxPrev = lightbox.querySelector('.lightbox-prev');
  const lightboxNext = lightbox.querySelector('.lightbox-next');

  // Metadades i descripcions de les 22 imatges de la visita
  const imagesData = [
    { src: 'fotografies/PXL_20260618_112801164.MP.jpeg', desc: 'Imatge 1: Façana principal de pedra irregular local amb tancaments i portons protectors de fusta.' },
    { src: 'fotografies/PXL_20260618_112852538.MP.jpeg', desc: 'Imatge 2: Detall constructiu del ràfec de formigó vist amb textura encofrada i el paravents cilíndric de fusta del jardí.' },
    { src: 'fotografies/PXL_20260618_113232893.PORTRAIT.ORIGINAL.jpeg', desc: 'Imatge 3: Saló interior. Xemeneia autoportant Focus negra i el llum de peu de disseny TMC de Miguel Milá.' },
    { src: 'fotografies/PXL_20260618_113247141.ACTION_PAN-01.jpeg', desc: 'Imatge 4: Xemeneia de ferro negra vista des del sofà, amb la llum TMC com a peça clau del racó de lectura.' },
    { src: 'fotografies/PXL_20260618_113255027.ACTION_PAN-01.jpeg', desc: 'Imatge 5: Zona de menjador. Taula rodona, cadires de canya, moble de TV de Miguel Milá i estanteria d\'obra a mida.' },
    { src: 'fotografies/PXL_20260618_113307533.ACTION_PAN-01.jpeg', desc: 'Imatge 6: Portons de fusta exteriors lliscants oberts al porxo, integrant el jardí de gespa a l\'interior.' },
    { src: 'fotografies/PXL_20260618_113329785.ACTION_PAN-01.jpeg', desc: 'Imatge 7: Finestra cantonera de fusta que enquadra el paisatge de la vall del Rigart des del saló.' },
    { src: 'fotografies/PXL_20260618_113332264.ACTION_PAN-01.jpeg', desc: 'Imatge 8: Detall de la fusteria exterior de fusta massissa i el tancament de vidre que connecta amb el verd exterior.' },
    { src: 'fotografies/PXL_20260618_113502252.ACTION_PAN-01.jpeg', desc: 'Imatge 9: Passadís principal. Seqüència de finestres interiors altes que distribueixen la llum natural cap al corredor.' },
    { src: 'fotografies/PXL_20260618_113506858.ACTION_PAN-01.jpeg', desc: 'Imatge 10: Cuina original de fusta massissa amb tiradors integrats i revestiment beige.' },
    { src: 'fotografies/PXL_20260618_113509453.ACTION_PAN-01.jpeg', desc: 'Imatge 11: Safareig amb la doble pica profunda clàssica de porcellana i sabonera encastada original.' },
    { src: 'fotografies/PXL_20260618_113559552.ACTION_PAN-01_GEN_2.jpeg', desc: 'Imatge 12: Dormitori secundari amb terra de moqueta granat d\'època i sostre inclinat de fusta.' },
    { src: 'fotografies/PXL_20260618_113625956.ACTION_PAN-01.jpeg', desc: 'Imatge 13: Bany original amb rajola granat intens, mirall de vora cromada i pica de porcellana blanca.' },
    { src: 'fotografies/PXL_20260618_113630738.ACTION_PAN-01.jpeg', desc: 'Imatge 14: Dormitori principal. Revestiment de suro al capçal del llit i armaris encastats de fusta noble.' },
    { src: 'fotografies/PXL_20260618_113739302.ACTION_PAN-01.jpeg', desc: 'Imatge 15: Vista interior del passadís il·luminat per les finestres interiors altes, amb terra ceràmic fosc.' },
    { src: 'fotografies/PXL_20260618_113745255.ACTION_PAN-01.jpeg', desc: 'Imatge 16: Detall del rebedor amb el tamboret Stool E60 d\'Alvar Aalto (Artek) sota la petita taula flotant.' },
    { src: 'fotografies/PXL_20260618_113751037.ACTION_PAN-01.jpeg', desc: 'Imatge 17: Garatge de la propietat. Solera de formigó polit i espai de taller de muntanya.' },
    { src: 'fotografies/PXL_20260618_113754603.ACTION_PAN-01.jpeg', desc: 'Imatge 18: Bany. Detall de la dutxa i el tovalloler metàl·lic integrat sobre les rajoles granat brillant.' },
    { src: 'fotografies/PXL_20260618_113800070.ACTION_PAN-01.jpeg', desc: 'Imatge 19: Detall dels sanitaris de porcellana blanca (bidet i vàter) retro-il·luminats contra la rajola de color vi.' },
    { src: 'fotografies/PXL_20260618_113802002.ACTION_PAN-01.jpeg', desc: 'Imatge 20: Cuina. Detall de la cuina de gas blanca i la campana piramidal de ferro negre a sobre de les piques.' },
    { src: 'fotografies/PXL_20260618_113808012.ACTION_PAN-01.jpeg', desc: 'Imatge 21: Entrada principal de la casa des del rebedor, destacant la fusteria de seguretat de pi natural.' },
    { src: 'fotografies/PXL_20260618_113816333.ACTION_PAN-01_GEN.jpeg', desc: 'Imatge 22: Detall de la zona de menjador amb la llum de suspensió M64 de Miguel Milá sobre la taula rodona.' }
  ];

  let currentImgIndex = 0;
  let isGalleryMode = true;

  function openLightbox(indexOrSrc, optDesc) {
    if (typeof indexOrSrc === 'number') {
      isGalleryMode = true;
      currentImgIndex = indexOrSrc;
      lightboxImg.src = imagesData[currentImgIndex].src;
      lightboxDesc.textContent = imagesData[currentImgIndex].desc;
      lightboxPrev.style.display = 'block';
      lightboxNext.style.display = 'block';
    } else {
      isGalleryMode = false;
      lightboxImg.src = indexOrSrc;
      lightboxDesc.textContent = optDesc || '';
      lightboxPrev.style.display = 'none';
      lightboxNext.style.display = 'none';
    }
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Evitar scroll
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  }

  function nextImage() {
    if (!isGalleryMode) return;
    currentImgIndex = (currentImgIndex + 1) % imagesData.length;
    openLightbox(currentImgIndex);
  }

  function prevImage() {
    if (!isGalleryMode) return;
    currentImgIndex = (currentImgIndex - 1 + imagesData.length) % imagesData.length;
    openLightbox(currentImgIndex);
  }

  // Assignar esdeveniments a la galeria
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      openLightbox(index);
    });
  });

  // Assignar esdeveniments a les imatges zoomables (fora i dins de la galeria)
  const zoomableImgs = document.querySelectorAll('.zoomable-img');
  zoomableImgs.forEach(img => {
    img.addEventListener('click', () => {
      const src = img.getAttribute('src');
      const alt = img.getAttribute('alt') || '';
      // Si la imatge està a la galeria principal, l'obrim amb navegació
      const galleryIndex = imagesData.findIndex(item => item.src === src);
      if (galleryIndex !== -1) {
        openLightbox(galleryIndex);
      } else {
        openLightbox(src, alt);
      }
    });
  });

  // Assignar esdeveniments als enllaços interns de les referències de text
  const imageRefs = document.querySelectorAll('.image-ref');
  imageRefs.forEach(ref => {
    ref.addEventListener('click', (e) => {
      e.preventDefault();
      const imageNum = parseInt(ref.getAttribute('data-image'));
      const galleryIndex = imageNum - 1;
      if (galleryIndex >= 0 && galleryIndex < imagesData.length) {
        // Desplaçament suau cap a l'element de la galeria
        const targetId = `galeria-item-${imageNum}`;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // Obrir immediatament el lightbox
        openLightbox(galleryIndex);
      }
    });
  });

  // Esdeveniments del Lightbox
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', nextImage);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevImage);

  // Tancar al fer clic fora de la imatge
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
        closeLightbox();
      }
    });
  }

  // Dreceres de teclat (Escapada, Esquerra, Dreta)
  document.addEventListener('keydown', (e) => {
    if (lightbox.style.display === 'flex') {
      if (e.key === 'Escape') closeLightbox();
      if (isGalleryMode) {
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
      }
    }
  });
});
