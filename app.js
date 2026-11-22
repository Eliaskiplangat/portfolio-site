const resumeName = 'Elias_Kiplangat_Resume.pdf';

const icon = {
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6A4.6 4.6 0 0 0 18.7 6a4.2 4.2 0 0 0-.1-3.2S17.5 2.5 15 4a12.3 12.3 0 0 0-6 0C6.5 2.5 5.4 2.8 5.4 2.8A4.2 4.2 0 0 0 5.3 6 4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  external: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>'
};

const experience = [
  {
    role: 'Backend Developer Trainee',
    organization: 'Tracom Academy, Nairobi',
    period: 'April 2026 – Present',
    points: [
      'Building and testing backend services in Java, Spring Boot, and Elixir.',
      'Containerizing applications with Docker and managing multi-service development environments.',
      'Implementing API endpoints, data models, authentication, and documented service behavior.'
    ]
  },
  {
    role: 'Software Developer Attachee',
    organization: 'Tracom Services Limited, Nairobi',
    period: 'May 2023 – August 2023',
    points: [
      'Built and maintained RESTful APIs with Spring Boot for a live backend environment.',
      'Used Spring Data JPA and Hibernate for database access and object-relational mapping.',
      'Implemented authentication with Spring Security and JWT and collaborated with frontend engineers.'
    ]
  }
];

const skills = [
  ['Backend and languages', ['Java', 'Spring Boot', 'Elixir', 'SQL']],
  ['Containers and tools', ['Docker', 'Git', 'GitHub', 'REST API design']],
  ['Security and authentication', ['Spring Security', 'JWT']],
  ['Databases and ORM', ['MySQL', 'PostgreSQL', 'Hibernate', 'JPA']],
  ['Web fundamentals', ['HTML5', 'CSS3', 'JavaScript']]
];

const navItems = [
  ['about', 'About'], ['experience', 'Experience'], ['project', 'Project'],
  ['repositories', 'Repositories'], ['skills', 'Skills'], ['contact', 'Contact']
];

function sectionTitle(title) {
  return `<h2 class="pf-section-title pf-display">${title}</h2>`;
}

function setupNavigation() {
  const button = document.querySelector('.pf-nav-toggle');
  const menu = document.querySelector('.pf-mobile-menu');
  if (!button || !menu) return;

  button.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
    button.innerHTML = open ? icon.close : icon.menu;
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
      button.innerHTML = icon.menu;
    });
  });
}

async function loadRepositories() {
  const container = document.querySelector('#repository-list');
  if (!container) return;

  try {
    const response = await fetch('https://api.github.com/users/Eliaskiplangat/repos?sort=updated&per_page=100');
    if (!response.ok) throw new Error('GitHub request failed');
    const repositories = await response.json();
    const visible = repositories
      .filter((repository) => !repository.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6);

    if (!visible.length) {
      container.innerHTML = '<p class="pf-state">No public repositories are available.</p>';
      return;
    }

    container.innerHTML = visible.map((repository) => `
      <a class="pf-repo-card" href="${repository.html_url}" target="_blank" rel="noreferrer">
        <div class="pf-repo-top">
          <span class="pf-repo-name">${escapeHTML(repository.name)}</span>
          ${icon.external}
        </div>
        <p>${escapeHTML(repository.description || 'No description provided.')}</p>
        <div class="pf-repo-meta pf-mono">
          ${repository.language ? `<span>${escapeHTML(repository.language)}</span>` : ''}
          <span>${repository.stargazers_count} stars</span>
          <span>${repository.forks_count} forks</span>
        </div>
      </a>
    `).join('');
  } catch (_error) {
    container.innerHTML = '<p class="pf-state">Repositories could not be loaded. <a href="https://github.com/Eliaskiplangat" target="_blank" rel="noreferrer">View GitHub profile</a>.</p>';
  }
}

function escapeHTML(value) {
  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML;
}

function setupResumeUpload() {
  const actions = document.querySelector('.pf-hero-actions');
  if (!actions) return;

  if (!localStorage.getItem('portfolioResumeToken') && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;

  const wrapper = document.createElement('div');
  wrapper.className = 'pf-resume-upload';
  wrapper.innerHTML = `
    <label class="pf-btn pf-btn-ghost" for="pf-resume-file">Replace resume</label>
    <input id="pf-resume-file" type="file" accept="application/pdf,.pdf">
  `;
  actions.appendChild(wrapper);

  const status = document.createElement('p');
  status.className = 'pf-resume-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  wrapper.appendChild(status);

  const input = wrapper.querySelector('input');
  input.addEventListener('change', async () => {
    const file = input.files && input.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      status.textContent = 'Choose a PDF file.';
      status.dataset.state = 'error';
      input.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      status.textContent = 'Maximum file size is 10 MB.';
      status.dataset.state = 'error';
      input.value = '';
      return;
    }

    status.textContent = 'Uploading resume…';
    status.dataset.state = 'loading';
    const form = new FormData();
    form.append('resume', file, resumeName);
    const token = localStorage.getItem('portfolioResumeToken');

    try {
      const response = await fetch('/api/resume', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Upload failed.');

      const resumeURL = `/${resumeName}?v=${Date.now()}`;
      document.querySelectorAll('a[href*="Elias_Kiplangat_Resume.pdf"]').forEach((link) => {
        link.href = resumeURL;
      });
      status.textContent = 'Resume replaced successfully.';
      status.dataset.state = 'success';
    } catch (error) {
      status.textContent = error.message;
      status.dataset.state = 'error';
    } finally {
      input.value = '';
    }
  });
}

function setupPortrait() {
  const photo = document.querySelector('.pf-photo img');
  const fallback = document.querySelector('.pf-photo-fallback');
  if (!photo || !fallback) return;

  photo.addEventListener('load', () => {
    fallback.hidden = true;
    photo.hidden = false;
  });
  photo.addEventListener('error', () => {
    fallback.hidden = false;
    photo.hidden = true;
  });
}

const root = document.querySelector('#root');
root.innerHTML = `
  <nav class="pf-nav" aria-label="Primary navigation">
    <div class="pf-nav-inner">
      <a class="pf-logo pf-display" href="#top" aria-label="Elias Kiplangat home">eliaskiplangat<span>.dev</span></a>
      <div class="pf-nav-links pf-mono">
        ${navItems.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}
      </div>
      <button class="pf-nav-toggle" type="button" aria-label="Toggle menu" aria-expanded="false">${icon.menu}</button>
    </div>
    <div class="pf-mobile-menu pf-mono">
      ${navItems.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}
    </div>
  </nav>

  <main id="top">
    <header class="pf-hero">
      <div class="pf-hero-beam" aria-hidden="true"></div>
      <div class="pf-hero-inner">
        <div class="pf-hero-copy">
          <p class="pf-eyebrow pf-mono"><span class="pf-dot"></span>Available for backend roles</p>
          <h1 class="pf-display">Elias Kiplangat</h1>
          <p class="pf-hero-sub">Backend developer with experience in Java, Spring Boot, Elixir, Docker, REST APIs, and relational databases. Based in Nairobi and focused on building reliable, maintainable systems.</p>
          <div class="pf-hero-actions">
            <a class="pf-btn pf-btn-primary" href="mailto:eliaskiplangat2@gmail.com">${icon.mail}<span>Email me</span></a>
            <a class="pf-btn pf-btn-ghost" href="https://github.com/Eliaskiplangat" target="_blank" rel="noreferrer">${icon.github}<span>GitHub</span></a>
            <a class="pf-btn pf-btn-ghost" href="https://linkedin.com/in/eliaskiplangat" target="_blank" rel="noreferrer">${icon.linkedin}<span>LinkedIn</span></a>
            <a class="pf-btn pf-btn-ghost" href="/${resumeName}" download="${resumeName}">${icon.download}<span>Resume</span></a>
          </div>
        </div>
        <figure class="pf-photo" aria-label="Profile portrait">
          <div class="pf-photo-fallback">EK</div>
          <img src="/profile.jpg" alt="Elias Kiplangat" hidden>
          <label class="pf-photo-upload" for="pf-profile-file">Upload photo</label>
          <input id="pf-profile-file" type="file" accept="image/jpeg,image/png,image/webp">
        </figure>
      </div>
    </header>

    <section id="about" class="pf-section pf-about">
      ${sectionTitle('About')}
      <p>Backend developer focused on clear API design, reliable data models, authentication, and maintainable deployment practices.</p>
      <p>I am currently completing an intensive backend development program at Tracom Academy, working across Java, Spring Boot, Elixir, Docker, SQL, and service integration. My earlier internship provided practical experience supporting live RESTful APIs and collaborating with engineering teams.</p>
    </section>

    <section id="experience" class="pf-section">
      ${sectionTitle('Experience')}
      <div class="pf-timeline">
        ${experience.map((item) => `
          <article class="pf-tl-item">
            <p class="pf-tl-role">${item.role}</p>
            <p class="pf-tl-meta pf-mono">${item.organization} · ${item.period}</p>
            <ul>${item.points.map((point) => `<li>${point}</li>`).join('')}</ul>
          </article>
        `).join('')}
      </div>
    </section>

    <section id="project" class="pf-section">
      ${sectionTitle('Featured project')}
      <article class="pf-project-card">
        <div class="pf-project-bar">
          <span></span><span></span><span></span>
          <span class="pf-mono">smart_irrigation_system.md</span>
        </div>
        <div class="pf-project-body">
          <h3 class="pf-display">Smart Irrigation System</h3>
          <p class="pf-tag-sub">Final year project · Kirinyaga University</p>
          <p>An IoT-based irrigation system that uses soil moisture, temperature, and water-level data to automate field irrigation and support remote monitoring.</p>
          <ul>
            <li>Integrated soil moisture, temperature, and water-level sensors.</li>
            <li>Built backend logic to turn sensor readings into irrigation decisions.</li>
            <li>Used Firebase and Flutter for real-time monitoring and control.</li>
            <li>Connected hardware, backend services, and the user interface into one system.</li>
          </ul>
          <div class="pf-tags">
            ${['IoT', 'Firebase', 'Flutter', 'Sensors', 'Full-stack systems'].map((tag) => `<span class="pf-tag">${tag}</span>`).join('')}
          </div>
        </div>
      </article>
    </section>

    <section id="repositories" class="pf-section">
      ${sectionTitle('Repositories')}
      <p class="pf-lead">Selected public work from GitHub.</p>
      <div id="repository-list" class="pf-repo-grid pf-mono"><p class="pf-state">Loading repositories…</p></div>
    </section>

    <section id="skills" class="pf-section">
      ${sectionTitle('Skills')}
      ${skills.map(([label, items]) => `
        <div class="pf-skill-group">
          <p class="pf-skill-label">${label}</p>
          <div class="pf-skill-tags">${items.map((item) => `<span class="pf-skill-tag">${item}</span>`).join('')}</div>
        </div>
      `).join('')}
    </section>

    <section id="contact" class="pf-section pf-contact">
      ${sectionTitle('Contact')}
      <p class="pf-lead">Open to backend developer opportunities and technical collaboration.</p>
      <div class="pf-contact-links">
        <a class="pf-contact-link" href="mailto:eliaskiplangat2@gmail.com">${icon.mail}<span>eliaskiplangat2@gmail.com</span></a>
        <a class="pf-contact-link" href="https://github.com/Eliaskiplangat" target="_blank" rel="noreferrer">${icon.github}<span>github.com/Eliaskiplangat</span>${icon.external}</a>
        <a class="pf-contact-link" href="https://linkedin.com/in/eliaskiplangat" target="_blank" rel="noreferrer">${icon.linkedin}<span>linkedin.com/in/eliaskiplangat</span>${icon.external}</a>
        <div class="pf-contact-link">${icon.pin}<span>Nairobi, Kenya</span></div>
      </div>
    </section>
  </main>

  <footer class="pf-footer pf-mono">Elias Kiplangat · Backend Developer</footer>
`;

setupNavigation();
setupPortrait();
setupResumeUpload();
loadRepositories();
