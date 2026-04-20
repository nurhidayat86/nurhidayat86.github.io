# Single-Page Portfolio Web Template

A mobile-friendly, dark-themed, vertically organized portfolio template for GitHub Pages.

This project renders:
- A **Profile** section from `YAML` config
- A **Portfolio** section from `JSON` data sorted by `score` (highest first)

## Features

- Single-page layout
- Responsive design (mobile-first)
- Dark theme
- Profile photo with fallback placeholder
- Horizontal CV/social links with `|` separators
- Portfolio project ordering by priority score

## Tech Stack

- [Vite](https://vite.dev/) (build/dev server)
- Vanilla JavaScript
- CSS
- [`js-yaml`](https://www.npmjs.com/package/js-yaml) (parse YAML profile config)

## Project Structure

```text
.
├─ index.html
├─ src/
│  ├─ main.js
│  └─ style.css
├─ public/
│  ├─ config/
│  │  └─ profile.yaml
│  └─ data/
│     └─ portfolio.json
├─ docs/
│  └─ portfolio-prd.md
├─ package.json
├─ eslint.config.js
└─ .prettierrc
```

## Prerequisites

Install Node.js (which includes npm):

- Recommended: Node.js 20+

Check installation:

```bash
node -v
npm -v
```

## Install Packages

From project root:

```bash
npm install
```

This installs all dependencies listed in `package.json`.

## Run Locally

Start development server:

```bash
npm run dev
```

Vite will print a local URL (usually `http://localhost:5173`).

## Lint and Format Checks

Run linter:

```bash
npm run lint
```

Run Prettier check:

```bash
npm run prettier
```

## Build for Production

```bash
npm run build
```

Build output is generated in `dist/`.

Preview production build locally:

```bash
npm run preview
```

## How to Use This Template

### 1) Configure Profile (`YAML`)

Edit `public/config/profile.yaml`:

```yaml
photo:
  src: "/assets/profile.jpg"
  alt: "Portrait of Your Name"

name: "Your Name"
email: "you@example.com"
current_position: "Senior Software Engineer"
headlines:
  - "Building scalable web apps"
  - "Open source contributor"

cv_links:
  - label: "CV (English)"
    url: "https://example.com/cv-en.pdf"
  - label: "CV (Bahasa)"
    url: "https://example.com/cv-id.pdf"

social_links:
  - label: "GitHub"
    url: "https://github.com/username"
  - label: "LinkedIn"
    url: "https://linkedin.com/in/username"
```

Notes:
- `photo.src` can be a local path (for example `/assets/profile.jpg`) or external URL.
- If photo is missing/invalid, a placeholder avatar is shown.
- Email is rendered as a `mailto:` link.

### 2) Configure Portfolio (`JSON`)

Edit `public/data/portfolio.json`.

The file must be a JSON array of objects. Each object must include:
- `score` (integer)
- `title`
- `summary`
- `repo_url`

Example:

```json
[
  {
    "score": 95,
    "title": "Project Alpha",
    "summary": "A web platform for managing digital workflows.",
    "repo_url": "https://github.com/username/project-alpha"
  },
  {
    "score": 88,
    "title": "Project Beta",
    "summary": "Automation tools for repetitive engineering tasks.",
    "repo_url": "https://github.com/username/project-beta"
  }
]
```

Behavior:
- Higher `score` appears first.
- If scores are equal, file order is preserved.
- Invalid items are skipped with a warning in the browser console.

### 3) Add Profile Photo Asset (Optional)

If using local image path, place your photo in `public/assets/`, for example:

```text
public/assets/profile.jpg
```

Then set:

```yaml
photo:
  src: "/assets/profile.jpg"
  alt: "Portrait of Your Name"
```

## Deploy to GitHub Pages

This repository already includes GitHub Actions workflows:
- `.github/workflows/deploy.yml`
- `.github/workflows/test-deploy.yml`

### One-Time Setup (Required)

1. Push this project to a GitHub repository.
2. In your repository, open **Settings** > **Pages**.
3. In **Build and deployment**, set **Source** to `GitHub Actions`.
4. Ensure your default branch is `main` (or update workflow triggers if using a different branch).

### What GitHub Actions Does

When you push to `main`, `.github/workflows/deploy.yml` runs automatically:
1. Checks out your repository code.
2. Sets up Node.js.
3. Installs packages with `npm ci`.
4. Builds the site with `npm run build` (output in `dist/`).
5. Uploads the build artifact.
6. Deploys the artifact to GitHub Pages.

When you open a pull request to `main`, `.github/workflows/test-deploy.yml` runs checks:
- `npm ci`
- `npm run lint`
- `npm run prettier`
- `npm run build`

### Day-to-Day Deployment Flow

1. Edit your files (`profile.yaml`, `portfolio.jsonl`, or UI files).
2. Commit your changes:

```bash
git add .
git commit -m "Update portfolio content"
```

3. Push to `main`:

```bash
git push origin main
```

4. Open the **Actions** tab in GitHub and wait for the workflow to finish.
5. After success, your site is published at your GitHub Pages URL.

### First Deployment Checklist

Use this quick checklist if you are deploying for the first time:

- [ ] Node.js and npm are installed locally (`node -v`, `npm -v`)
- [ ] Dependencies installed (`npm install`)
- [ ] Local build works (`npm run build`)
- [ ] Repository pushed to GitHub
- [ ] GitHub Pages source is set to `GitHub Actions`
- [ ] Changes pushed to `main`
- [ ] Workflow run is green in **Actions**
- [ ] Site URL opens successfully in browser
- [ ] Hard refresh performed if updates do not appear immediately

## Troubleshooting

- **`npm: command not found`**  
  Install Node.js and npm first, then re-run `npm install`.

- **No deployment is triggered**  
  Check that:
  - you pushed to the branch configured in workflow (`main`)
  - GitHub Pages source is set to `GitHub Actions`

- **Profile/portfolio not showing**  
  Check:
  - `public/config/profile.yaml` is valid YAML
  - `public/data/portfolio.json` is a valid JSON array
  - required fields exist on each project object

- **Photo does not appear**  
  Verify the image path exists under `public/` and `photo.src` is correct.
