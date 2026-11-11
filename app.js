const defaultLanguage = 'pt-BR';
const storageKey = 'marcos-sousa-portfolio-language';
const languageSelect = document.getElementById('site-language');
const resumeLink = document.getElementById('resume-link');
const filters = document.querySelector('.filters');
const filterButtons = filters.querySelectorAll('button[data-filter]');
const projectCards = document.querySelectorAll('[data-project-tags]');
const certificateDates = document.querySelectorAll('[data-certificate-date]');
const translationAttributes = new Set(['alt', 'aria-label', 'content']);
let manualLanguageSelected = false;

const resumes = {
  'pt-BR': 'Curriculo Marcos_Sousa.pdf?v=portfolio-6',
  en: 'assets/CV_Marcos_Sousa_EN.pdf',
  es: 'assets/CV_Marcos_Sousa_ES.pdf',
  fr: 'assets/CV_Marcos_Sousa_EN.pdf',
};

const localizedElements = Array.from(document.querySelectorAll('[data-i18n]'), (element) => {
  const requestedAttribute = element.dataset.i18nAttribute;
  const attribute = translationAttributes.has(requestedAttribute) ? requestedAttribute : null;
  const original = attribute ? element.getAttribute(attribute) : element.textContent;
  return { element, attribute, original };
});

function applyLanguage(language) {
  const strings = translations[language];
  document.documentElement.lang = language;
  languageSelect.value = language;
  resumeLink.setAttribute('href', resumes[language]);

  for (const { element, attribute, original } of localizedElements) {
    const value = strings[element.dataset.i18n] ?? original;
    if (attribute) element.setAttribute(attribute, value);
    else element.textContent = value;
  }

  const dateFormat = new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeZone: 'UTC' });
  for (const element of certificateDates) {
    element.textContent = dateFormat.format(new Date(element.dateTime));
  }
}

function supportedLanguage(locale) {
  const language = locale.trim().toLowerCase().split(/[-_]/)[0];
  if (language === 'pt') return defaultLanguage;
  return Object.hasOwn(translations, language) ? language : undefined;
}

function savedLanguage() {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

async function detectIpLanguage() {
  try {
    const response = await fetch('https://ipapi.co/languages/', {
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      redirect: 'error',
      signal: AbortSignal.timeout(1800),
    });
    if (!response.ok) return;

    const locales = (await response.text()).trim();
    if (locales.length > 256 || !/^[a-z]{2,3}(?:-[a-z0-9]+)*(?:\s*,\s*[a-z]{2,3}(?:-[a-z0-9]+)*)*$/i.test(locales)) return;

    const language = locales.split(',').map(supportedLanguage).find(Boolean);
    if (language && !manualLanguageSelected) applyLanguage(language);
  } catch {
    // O site já está disponível em português se a consulta falhar.
  }
}

for (const button of filterButtons) {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    for (const item of filterButtons) {
      item.setAttribute('aria-pressed', String(item === button));
    }
    for (const card of projectCards) {
      card.hidden = filter !== 'all' && !card.dataset.projectTags.split('|').includes(filter);
    }
  });
}

languageSelect.addEventListener('change', () => {
  const language = languageSelect.value;
  if (!Object.hasOwn(translations, language)) return;

  manualLanguageSelected = true;
  applyLanguage(language);
  try {
    localStorage.setItem(storageKey, language);
  } catch {
    // A seleção continua valendo nesta página quando o armazenamento está bloqueado.
  }
});

const saved = savedLanguage();
const locales = navigator.languages?.length ? navigator.languages : [navigator.language || ''];
const preferredLanguage = Object.hasOwn(translations, saved)
  ? saved
  : locales.map(supportedLanguage).find(Boolean);

applyLanguage(preferredLanguage ?? defaultLanguage);
languageSelect.hidden = false;
filters.hidden = false;
if (!preferredLanguage && location.protocol === 'https:') detectIpLanguage();
