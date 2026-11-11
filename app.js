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


const githubProfile = 'https://github.com/marcosdilo';
const profileProjects = githubProfile + '/marcosdilo#-projetos-em-destaque';
const projetos = [
  {
    key: 'downloadStudio',
    icon: '📁',
    tags: ['Python', 'PySide6', 'watchdog', 'Windows'],
    links: {
      repository: githubProfile + '/downloadstudio',
      download: githubProfile + '/downloadstudio/releases/latest',
    },
  },
  {
    key: 'automation',
    icon: '🤖',
    tags: ['Python', 'Supabase', 'IA'],
    links: { projectDetails: profileProjects },
  },
  {
    key: 'cortaLocal',
    icon: '🎬',
    tags: ['TypeScript', 'Electron', 'Python', 'Whisper'],
    inDevelopment: true,
  },
  {
    key: 'missaoCfo',
    icon: '🎯',
    tags: ['TypeScript', 'React', 'Cloudflare D1'],
    inDevelopment: true,
  },
  {
    key: 'monitorPc',
    icon: '📊',
    tags: ['C#', 'WinForms', 'LibreHardwareMonitor'],
  },
  {
    key: 'portfolio',
    icon: '🌐',
    tags: ['HTML/CSS', 'JavaScript', 'GitHub Pages'],
    links: { repository: githubProfile + '/site-pessoal' },
  },
  {
    key: 'store',
    icon: '🛒',
    tags: ['JavaScript', 'PostgreSQL', 'HTML/CSS'],
    links: { projectDetails: profileProjects },
    inDevelopment: true,
  },
  {
    key: 'calculator',
    icon: '🧮',
    tags: ['HTML/CSS', 'JavaScript', 'GitHub Pages'],
    links: {
      repository: githubProfile + '/calculadora',
      demo: 'https://marcosdilo.github.io/calculadora/',
    },
  },
  {
    key: 'pizza',
    icon: '🍕',
    tags: ['HTML/CSS', 'PHP'],
    links: { repository: githubProfile + '/pizza-chefe' },
    inDevelopment: true,
  },
  {
    key: 'codedex',
    icon: '📚',
    tags: ['Python'],
    links: { repository: githubProfile + '/estudos-codedex' },
  },
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
  const projetosFiltrados = projetos.filter(({ tags }) => activeFilter === 'all' || tags.includes(activeFilter));

  container.innerHTML = projetosFiltrados.map(({ key, icon, tags, links, inDevelopment }) => {
    const title = strings[key + 'Title'];
    const tagsHTML = tags.map(tag => `<span class="proj-tag">${tag === 'IA' ? strings.ai : tag}</span>`).join('');
    const footer = links
      ? Object.entries(links).map(([label, url]) => `
          <a href="${url}" target="_blank" rel="noopener" aria-label="${strings[label]} — ${title}">${strings[label]} ↗</a>
        `).join('')
      : `<span>${strings.unpublishedSource}</span>`;
    const status = inDevelopment ? `<span class="proj-status">${strings.inDevelopment}</span>` : '';

    return `
      <article class="project-card">
        <div class="proj-header">
          <div class="proj-icon" aria-hidden="true">${icon}</div>
          ${status}
        </div>
        <h4 class="proj-title">${title}</h4>
        <div class="proj-desc">${strings[key + 'Description']}</div>
        <div class="proj-tags">${tagsHTML}</div>
        <div class="proj-links">${footer}</div>
      </article>
    `;
  }).join('');
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
