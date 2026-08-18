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
    titulo: "Sistema de Automação com IA",
    icone: "🤖",
    descricao: "Sistema back-end em Python e Supabase para gestão de fluxo de estoque e pedidos.",
    tags: ["Python", "Supabase", "IA"],
    link: "#" 
  },
  {
    titulo: "E-commerce Full-Stack",
    icone: "🛒",
    descricao: "Infraestrutura de vendas completa. Banco de dados relacional e vitrine digital.",
    tags: ["JavaScript", "PostgreSQL", "HTML/CSS"],
    link: "#"
  },
  {
    titulo: "Portfólio Pessoal Interativo",
    icone: "🌐",
    descricao: "Este site, construído com Vanilla JS, CSS responsivo e animações de scroll avançadas.",
    tags: ["HTML/CSS", "JavaScript"],
    link: "https://github.com/marcosdilo" 
  }
];

const container = document.getElementById('meus-projetos');
const filterButtons = document.querySelectorAll('.filtros .skill-tag');

function renderProjetos(filtro = 'Todos') {
  if(!container) return;
  container.innerHTML = ''; 
  
  const projetosFiltrados = projetos.filter(proj => {
    if (filtro === 'Todos') return true;
    if (filtro === 'HTML/CSS') return proj.tags.includes('HTML/CSS') || proj.tags.includes('CSS');
    return proj.tags.includes(filtro);
  });

  projetosFiltrados.forEach((proj, index) => {
    const tagsHTML = proj.tags.map(tag => `<span class="proj-tag">${tag}</span>`).join('');
    
    const delay = index * 0.15; 
    
    container.innerHTML += `
      <a href="${proj.link}" target="_blank" class="project-card hidden-scroll" style="text-decoration: none; color: inherit; transition-delay: ${delay}s">
        <div class="proj-icon">${proj.icone}</div>
        <div class="proj-title">${proj.titulo}</div>
        <div class="proj-desc">${proj.descricao}</div>
        <div class="proj-tags">${tagsHTML}</div>
      </a>
    `;
  });

  // Diz ao observer para vigiar os novos cards injetados
  document.querySelectorAll('.project-card.hidden-scroll').forEach((el) => observer.observe(el));
}

renderProjetos();

if (filterButtons) {
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderProjetos(e.target.textContent);
    });
  });
}