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
    { src: 'fotografies/PXL_20260618_112801164.MP.jpeg', desc: 'Imatge 1: Vista exterior de la parcel·la des del camí d\'accés, amb el tancament de paret seca de pedra en primer pla i l\'entorn de bosc.' },
    { src: 'fotografies/PXL_20260618_112852538.MP.jpeg', desc: 'Imatge 2: Vista exterior de la façana de pedra de la casa amb la porta d\'accés de fusta i el jardí amb escala i tanca.' },
    { src: 'fotografies/PXL_20260618_113232893.PORTRAIT.ORIGINAL.jpeg', desc: 'Imatge 3: Racó de lectura al saló amb una butaca blanca, el llum de peu TMC de Miguel Milá i un prestatge de fusta amb bols de ceràmica.' },
    { src: 'fotografies/PXL_20260618_113247141.ACTION_PAN-01.jpeg', desc: 'Imatge 4: Vista general de la sala d\'estar i menjador amb la xemeneia de campana grisa, els sofàs coberts amb fundes blanques i la taula al fons.' },
    { src: 'fotografies/PXL_20260618_113255027.ACTION_PAN-01.jpeg', desc: 'Imatge 5: Zona de menjador amb la taula rodona i cadires de vímet, el moble baix de televisió de fusta fosca i una prestatgeria d\'obra encastada.' },
    { src: 'fotografies/PXL_20260618_113307533.ACTION_PAN-01.jpeg', desc: 'Imatge 6: Vista de les muntanyes i el jardí de la casa des de la terrassa o porxo cobert, sota el ràfec de formigó vist.' },
    { src: 'fotografies/PXL_20260618_113329785.ACTION_PAN-01.jpeg', desc: 'Imatge 7: Vista exterior de la vall i el jardí des de la terrassa, amb el reflex dels vidres del tancament a la dreta.' },
    { src: 'fotografies/PXL_20260618_113332264.ACTION_PAN-01.jpeg', desc: 'Imatge 8: Vista exterior del jardí a través del marc de la finestra, on s\'observa el tancament cilíndric escultòric de lames de fusta.' },
    { src: 'fotografies/PXL_20260618_113502252.ACTION_PAN-01.jpeg', desc: 'Imatge 9: Passadís de la zona de nit amb portes de fusta de pi i finestres altes de ventilació i il·luminació interior.' },
    { src: 'fotografies/PXL_20260618_113506858.ACTION_PAN-01.jpeg', desc: 'Imatge 10: Cuina original de fusta massissa amb tiradors integrats en les portes i revestiment de rajoles de color beix.' },
    { src: 'fotografies/PXL_20260618_113509453.ACTION_PAN-01.jpeg', desc: 'Imatge 11: Safareig o cambra de servei amb una pica doble profunda de porcellana blanca, sabonera encastada i la nevera al costat.' },
    { src: 'fotografies/PXL_20260618_113559552.ACTION_PAN-01_GEN_2.jpeg', desc: 'Imatge 12: Dormitori secundari amb un llit de matrimoni, sostre inclinat revestit de fusta i terra de moqueta de color granat.' },
    { src: 'fotografies/PXL_20260618_113625956.ACTION_PAN-01.jpeg', desc: 'Imatge 13: Bany original amb revestiment de rajola quadrada de color granat intens, mirall cromat i sanitaris de porcellana blanca.' },
    { src: 'fotografies/PXL_20260618_113630738.ACTION_PAN-01.jpeg', desc: 'Imatge 14: Dormitori principal amb dos llits individuals, revestiment de suro a la paret del capçal i finestra amb cortines.' },
    { src: 'fotografies/PXL_20260618_113739302.ACTION_PAN-01.jpeg', desc: 'Imatge 15: Passadís de la zona de nit amb portes de fusta de pi, finestra amb cortines i paviment de rajoles ceràmiques fosques.' },
    { src: 'fotografies/PXL_20260618_113745255.ACTION_PAN-01.jpeg', desc: 'Imatge 16: Detall del rebedor amb el tamboret Stool E60 d\'Alvar Aalto sota una petita taula de fusta flotant sobre terra ceràmic fosc.' },
    { src: 'fotografies/PXL_20260618_113751037.ACTION_PAN-01.jpeg', desc: 'Imatge 17: Garatge i taller de muntanya amb estanteries metàl·liques de fusta per a emmagatzematge i paviment de formigó.' },
    { src: 'fotografies/PXL_20260618_113754603.ACTION_PAN-01.jpeg', desc: 'Imatge 18: Detall del segon bany amb revestiment de rajola de color beix o crema, lavabo de porcellana blanca, mirall i finestra.' },
    { src: 'fotografies/PXL_20260618_113800070.ACTION_PAN-01.jpeg', desc: 'Imatge 19: Sanitaris (vàter i bidet) del segon bany de color beix o crema, amb paviment fosc i mampara de dutxa visible.' },
    { src: 'fotografies/PXL_20260618_113802002.ACTION_PAN-01.jpeg', desc: 'Imatge 20: Detall de la cuina amb els fogons de gas de color blanc, la campana extractora de ferro negre i la pica de rentar plats.' },
    { src: 'fotografies/PXL_20260618_113808012.ACTION_PAN-01.jpeg', desc: 'Imatge 21: Entrada de la casa vista des de l\'interior, destacant la porta de pi massís, el penjador de barrets i el paviment fosc.' },
    { src: 'fotografies/PXL_20260618_113816333.ACTION_PAN-01_GEN.jpeg', desc: 'Imatge 22: Detall del menjador amb el llum de suspensió M64 de Miguel Milá sobre la taula rodona i cadires de vímet.' }
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
