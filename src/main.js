import './style.css';
import yaml from 'js-yaml';

const profileContentEl = document.querySelector('#profile-content');
const portfolioListEl = document.querySelector('#portfolio-list');

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

function normalizePortfolio(rawArray) {
  if (!Array.isArray(rawArray)) {
    console.warn('Portfolio data must be a JSON array.');
    return [];
  }

  const projects = [];

  rawArray.forEach((item, idx) => {
    const hasFields =
      Number.isInteger(item?.score) &&
      isNonEmptyString(item?.title) &&
      isNonEmptyString(item?.summary) &&
      isNonEmptyString(item?.repo_url);

    if (!hasFields) {
      console.warn(`Skipped invalid portfolio item at index ${idx}`);
      return;
    }

    projects.push({
      score: item.score,
      title: item.title.trim(),
      summary: item.summary.trim(),
      repoUrl: item.repo_url.trim(),
      index: projects.length
    });
  });

  return projects.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.index - b.index;
  });
}

function renderPortfolio(projects) {
  portfolioListEl.innerHTML = '';

  if (projects.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'message';
    empty.textContent = 'No portfolio projects configured yet.';
    portfolioListEl.append(empty);
    return;
  }

  projects.forEach((project) => {
    const article = document.createElement('article');
    article.className = 'portfolio-item';

    const title = document.createElement('h3');
    title.className = 'project-title';
    title.textContent = project.title;

    const summary = document.createElement('p');
    summary.className = 'muted';
    summary.textContent = project.summary;

    const link = document.createElement('a');
    link.href = project.repoUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'View GitHub Repository';

    article.append(title, summary, link);
    portfolioListEl.append(article);
  });
}

async function loadPortfolio() {
  const response = await fetch('/data/portfolio.json');
  if (!response.ok) {
    throw new Error('Failed to load portfolio data.');
  }

  return normalizePortfolio(await response.json());
}

async function loadProfile() {
  const response = await fetch('/config/profile.yaml');
  if (!response.ok) {
    throw new Error('Failed to load profile data.');
  }

  return yaml.load(await response.text());
}

async function bootstrap() {
  try {
    const [profile, portfolio] = await Promise.all([loadProfile(), loadPortfolio()]);
    renderProfile(profile || {});
    renderPortfolio(portfolio);
  } catch (error) {
    console.error(error);
    profileContentEl.innerHTML = '<p class="message">Unable to load profile data.</p>';
    portfolioListEl.innerHTML = '<p class="message">Unable to load portfolio data.</p>';
  }
}

bootstrap();
