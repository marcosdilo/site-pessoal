const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show-scroll');
    }
  });
}, {
  threshold: 0.15 
});

const hiddenElements = document.querySelectorAll('.hidden-scroll');
hiddenElements.forEach((el) => observer.observe(el));


const sections = document.querySelectorAll('.page-section');
const navLinks = document.querySelectorAll('.contact a');

window.addEventListener('scroll', () => {
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    link.style = "";
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
      link.style.opacity = '1';
      link.style.filter = 'drop-shadow(0 0 4px rgba(255,255,255,0.5))';
    }
  });
});


const projetos = [
  {
    titulo: 'automationTitle',
    icone: "🤖",
    descricao: 'automationDescription',
    tags: ["Python", "Supabase", "IA"],
    link: "#" 
  },
  {
    titulo: 'storeTitle',
    icone: "🛒",
    descricao: 'storeDescription',
    tags: ["JavaScript", "PostgreSQL", "HTML/CSS"],
    link: "#"
  },
  {
    titulo: 'portfolioTitle',
    icone: "🌐",
    descricao: 'portfolioDescription',
    tags: ["HTML/CSS", "JavaScript"],
    link: "https://github.com/marcosdilo" 
  }
];

const container = document.getElementById('meus-projetos');
const filterButtons = document.querySelectorAll('.filtros [data-filter]');
const languageSelect = document.getElementById('site-language');
const defaultLanguage = 'pt-BR';
const languageStorageKey = 'marcos-sousa-portfolio-language';
let activeLanguage = defaultLanguage;
let activeFilter = 'all';
let manualLanguageSelected = false;

const localizedElements = Array.from(document.querySelectorAll('[data-i18n]'), (element) => {
  const attribute = element.dataset.i18nAttribute;
  const property = element.hasAttribute('data-i18n-html') ? 'innerHTML' : 'textContent';
  return {
    element,
    attribute,
    property,
    original: attribute ? element.getAttribute(attribute) : element[property],
  };
});

function renderProjetos() {
  const strings = translations[activeLanguage];
  container.querySelectorAll('.project-card').forEach((card) => observer.unobserve(card));
  const projetosFiltrados = projetos.filter(proj => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'HTML/CSS') return proj.tags.includes('HTML/CSS') || proj.tags.includes('CSS');
    return proj.tags.includes(activeFilter);
  });

  container.innerHTML = projetosFiltrados.map((proj, index) => {
    const tagsHTML = proj.tags.map(tag => `<span class="proj-tag">${tag === 'IA' ? strings.ai : tag}</span>`).join('');
    
    const delay = index * 0.15; 
    
    return `
      <a href="${proj.link}" target="_blank" rel="noopener" class="project-card hidden-scroll" style="text-decoration: none; color: inherit; transition-delay: ${delay}s">
        <div class="proj-icon">${proj.icone}</div>
        <div class="proj-title">${strings[proj.titulo]}</div>
        <div class="proj-desc">${strings[proj.descricao]}</div>
        <div class="proj-tags">${tagsHTML}</div>
      </a>
    `;
  }).join('');

  // Diz ao observer para vigiar os novos cards injetados
  container.querySelectorAll('.project-card').forEach((el) => observer.observe(el));
}

function applyLanguage(language) {
  activeLanguage = language;
  const strings = translations[language];
  document.documentElement.lang = language;
  languageSelect.value = language;

  // O HTML traduzido vem apenas do arquivo de traduções incluído no site.
  localizedElements.forEach(({ element, attribute, property, original }) => {
    const value = strings[element.dataset.i18n] ?? original;
    if (attribute) element.setAttribute(attribute, value);
    else element[property] = value;
  });

  renderProjetos();
}

function supportedLanguage(locale) {
  const language = locale.trim().toLowerCase().split(/[-_]/)[0];
  if (language === 'pt') return defaultLanguage;
  return Object.hasOwn(translations, language) ? language : undefined;
}

function getSavedLanguage() {
  try {
    return localStorage.getItem(languageStorageKey);
  } catch {
    return null;
  }
}

async function detectIpLanguage() {
  try {
    const response = await fetch('https://ipapi.co/languages/', {
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: AbortSignal.timeout(1800),
    });
    if (!response.ok) return;

    const locales = (await response.text()).trim();
    if (!/^[a-z]{2,3}(?:-[a-z0-9]+)*(?:\s*,\s*[a-z]{2,3}(?:-[a-z0-9]+)*)*$/i.test(locales)) return;

    const language = locales.split(',').map(supportedLanguage).find(Boolean);
    if (language && !manualLanguageSelected && language !== activeLanguage) applyLanguage(language);
  } catch {
    // O site já está disponível no idioma padrão se a consulta falhar.
  }
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const selected = filterButton === button;
      filterButton.classList.toggle('active', selected);
      filterButton.setAttribute('aria-pressed', String(selected));
    });
    renderProjetos();
  });
});

languageSelect.addEventListener('change', () => {
  const language = languageSelect.value;
  if (!Object.hasOwn(translations, language)) return;

  manualLanguageSelected = true;
  applyLanguage(language);
  try {
    localStorage.setItem(languageStorageKey, language);
  } catch {
    // A seleção continua valendo nesta página quando o armazenamento está bloqueado.
  }
});

const savedLanguage = getSavedLanguage();
const browserLocales = navigator.languages?.length ? navigator.languages : [navigator.language || ''];
const preferredLanguage = Object.hasOwn(translations, savedLanguage)
  ? savedLanguage
  : browserLocales.map(supportedLanguage).find(Boolean);

applyLanguage(preferredLanguage ?? defaultLanguage);
languageSelect.hidden = false;
if (!preferredLanguage && /^https?:$/.test(location.protocol)) detectIpLanguage();
