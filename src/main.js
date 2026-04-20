import './style.css';
import yaml from 'js-yaml';
import siteConfigRaw from '../config.yaml?raw';

const DEFAULT_FEATURED_LIMIT = 5;
const VALID_ROUTES = ['home', 'projects', 'articles'];

function resolveFeaturedLimit(value) {
  if (Number.isInteger(value) && value >= 0) {
    return value;
  }
  return DEFAULT_FEATURED_LIMIT;
}

function loadSiteConfig(rawYaml) {
  try {
    const parsed = yaml.load(rawYaml);
    return {
      featuredProjects: resolveFeaturedLimit(parsed?.featured?.projects),
      featuredArticles: resolveFeaturedLimit(parsed?.featured?.articles)
    };
  } catch (error) {
    console.warn('Failed to parse config.yaml; using defaults.', error);
    return {
      featuredProjects: DEFAULT_FEATURED_LIMIT,
      featuredArticles: DEFAULT_FEATURED_LIMIT
    };
  }
}

const siteConfig = loadSiteConfig(siteConfigRaw);

const profileContentEl = document.querySelector('#profile-content');
const featuredProjectsListEl = document.querySelector('#featured-projects-list');
const featuredArticlesListEl = document.querySelector('#featured-articles-list');
const projectsListEl = document.querySelector('#projects-list');
const articlesListEl = document.querySelector('#articles-list');
const pageSections = document.querySelectorAll('.page-section');
const navEl = document.querySelector('#page-nav');

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeLinkGroup(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => ({
      label: isNonEmptyString(item?.label) ? item.label.trim() : '',
      url: isNonEmptyString(item?.url) ? item.url.trim() : ''
    }))
    .filter((item) => item.label && item.url);
}

function normalizeHeadlines(value) {
  if (Array.isArray(value)) {
    return value.filter(isNonEmptyString).map((text) => text.trim());
  }

  if (isNonEmptyString(value)) {
    return [value.trim()];
  }

  return [];
}

function createLinkGroup(title, links) {
  const wrapper = document.createElement('div');
  wrapper.className = 'meta';

  const heading = document.createElement('strong');
  heading.textContent = title;
  wrapper.append(heading);

  const list = document.createElement('div');
  list.className = 'link-group';

  links.forEach((item, index) => {
    const link = document.createElement('a');
    link.href = item.url;
    link.textContent = item.label;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    list.append(link);

    if (index < links.length - 1) {
      const separator = document.createElement('span');
      separator.className = 'separator';
      separator.textContent = '|';
      list.append(separator);
    }
  });

  wrapper.append(list);
  return wrapper;
}

function createPhoto(photoConfig, name) {
  const hasValidSrc = isNonEmptyString(photoConfig?.src);
  if (!hasValidSrc) {
    const fallback = document.createElement('div');
    fallback.className = 'photo photo-fallback';
    fallback.textContent = name?.slice(0, 2)?.toUpperCase() || 'NA';
    fallback.setAttribute('aria-label', 'Profile photo placeholder');
    return fallback;
  }

  const img = document.createElement('img');
  img.className = 'photo';
  img.src = photoConfig.src.trim();
  img.alt = isNonEmptyString(photoConfig?.alt)
    ? photoConfig.alt.trim()
    : `Portrait of ${name || 'profile owner'}`;
  img.loading = 'lazy';

  img.addEventListener('error', () => {
    const fallback = document.createElement('div');
    fallback.className = 'photo photo-fallback';
    fallback.textContent = name?.slice(0, 2)?.toUpperCase() || 'NA';
    fallback.setAttribute('aria-label', 'Profile photo placeholder');
    img.replaceWith(fallback);
  });

  return img;
}

function renderProfile(profile) {
  profileContentEl.innerHTML = '';

  const name = isNonEmptyString(profile?.name) ? profile.name.trim() : 'Unnamed';
  const email = isNonEmptyString(profile?.email) ? profile.email.trim() : '';
  const currentPosition = isNonEmptyString(profile?.current_position)
    ? profile.current_position.trim()
    : '';
  const headlines = normalizeHeadlines(profile?.headlines);
  const cvLinks = normalizeLinkGroup(profile?.cv_links);
  const socialLinks = normalizeLinkGroup(profile?.social_links);

  const layout = document.createElement('div');
  layout.className = 'profile-layout';

  layout.append(createPhoto(profile?.photo, name));

  const main = document.createElement('div');
  main.className = 'profile-main';

  const titleMeta = document.createElement('div');
  titleMeta.className = 'meta';

  const nameEl = document.createElement('h3');
  nameEl.textContent = name;
  titleMeta.append(nameEl);

  if (email) {
    const emailEl = document.createElement('a');
    emailEl.href = `mailto:${email}`;
    emailEl.textContent = email;
    titleMeta.append(emailEl);
  }

  if (currentPosition) {
    const positionEl = document.createElement('p');
    positionEl.className = 'current-position';
    positionEl.textContent = currentPosition;
    titleMeta.append(positionEl);
  }

  main.append(titleMeta);

  if (headlines.length > 0) {
    const headlinesWrap = document.createElement('div');
    headlinesWrap.className = 'meta';

    const heading = document.createElement('strong');
    heading.textContent = 'Headlines';
    headlinesWrap.append(heading);

    const list = document.createElement('div');
    list.className = 'headlines';
    headlines.forEach((item) => {
      const line = document.createElement('p');
      line.textContent = item;
      list.append(line);
    });

    headlinesWrap.append(list);
    main.append(headlinesWrap);
  }

  if (cvLinks.length > 0) {
    main.append(createLinkGroup('CVs', cvLinks));
  }

  if (socialLinks.length > 0) {
    main.append(createLinkGroup('Social', socialLinks));
  }

  layout.append(main);
  profileContentEl.append(layout);
}

function normalizeEntries(rawArray, urlField, label) {
  if (!Array.isArray(rawArray)) {
    console.warn(`${label} data must be a JSON array.`);
    return [];
  }

  const entries = [];

  rawArray.forEach((item, idx) => {
    const hasFields =
      Number.isInteger(item?.score) &&
      isNonEmptyString(item?.title) &&
      isNonEmptyString(item?.summary) &&
      isNonEmptyString(item?.[urlField]);

    if (!hasFields) {
      console.warn(`Skipped invalid ${label} item at index ${idx}`);
      return;
    }

    entries.push({
      score: item.score,
      title: item.title.trim(),
      summary: item.summary.trim(),
      url: item[urlField].trim(),
      index: entries.length
    });
  });

  return entries.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.index - b.index;
  });
}

function renderEntryList(listEl, entries, linkLabel, emptyMessage) {
  listEl.innerHTML = '';

  if (entries.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'message';
    empty.textContent = emptyMessage;
    listEl.append(empty);
    return;
  }

  entries.forEach((entry) => {
    const article = document.createElement('article');
    article.className = 'portfolio-item';

    const title = document.createElement('h3');
    title.className = 'project-title';
    title.textContent = entry.title;

    const summary = document.createElement('p');
    summary.className = 'muted';
    summary.textContent = entry.summary;

    const link = document.createElement('a');
    link.href = entry.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = linkLabel;

    article.append(title, summary, link);
    listEl.append(article);
  });
}

async function loadJson(path, urlField, label) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${label} data.`);
  }

  return normalizeEntries(await response.json(), urlField, label);
}

async function loadProfile() {
  const response = await fetch('/config/profile.yaml');
  if (!response.ok) {
    throw new Error('Failed to load profile data.');
  }

  return yaml.load(await response.text());
}

function getRouteFromHash() {
  const raw = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  const route = raw.split(/[/?]/)[0] || 'home';
  return VALID_ROUTES.includes(route) ? route : 'home';
}

function applyRoute(route) {
  pageSections.forEach((section) => {
    const isActive = section.dataset.page === route;
    section.hidden = !isActive;
  });

  navEl.querySelectorAll('a[data-route]').forEach((link) => {
    const isActive = link.dataset.route === route;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function initRouter() {
  window.addEventListener('hashchange', () => applyRoute(getRouteFromHash()));
  applyRoute(getRouteFromHash());
}

async function bootstrap() {
  try {
    const [profile, projects, articles] = await Promise.all([
      loadProfile(),
      loadJson('/data/projects.json', 'repo_url', 'projects'),
      loadJson('/data/articles.json', 'article_url', 'articles')
    ]);

    renderProfile(profile || {});

    renderEntryList(
      featuredProjectsListEl,
      projects.slice(0, siteConfig.featuredProjects),
      'View GitHub Repository',
      'No projects configured yet.'
    );
    renderEntryList(
      featuredArticlesListEl,
      articles.slice(0, siteConfig.featuredArticles),
      'Read Article',
      'No articles configured yet.'
    );
    renderEntryList(
      projectsListEl,
      projects,
      'View GitHub Repository',
      'No projects configured yet.'
    );
    renderEntryList(
      articlesListEl,
      articles,
      'Read Article',
      'No articles configured yet.'
    );

    initRouter();
  } catch (error) {
    console.error(error);
    profileContentEl.innerHTML = '<p class="message">Unable to load profile data.</p>';
    featuredProjectsListEl.innerHTML =
      '<p class="message">Unable to load projects data.</p>';
    featuredArticlesListEl.innerHTML =
      '<p class="message">Unable to load articles data.</p>';
    projectsListEl.innerHTML = '<p class="message">Unable to load projects data.</p>';
    articlesListEl.innerHTML = '<p class="message">Unable to load articles data.</p>';
  }
}

bootstrap();
