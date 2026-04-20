# Product Requirements Document (PRD)

## Product
Single-page personal portfolio website hosted on GitHub Pages (`username.github.io`).

## Version
v1.1

## Overview
Build a mobile-friendly, vertically organized single-page portfolio website with a dark theme. The page should be simple to maintain by editing structured data files instead of changing layout code.

## Goals
- Present profile and project portfolio clearly on one page.
- Optimize readability and usability on mobile devices first.
- Keep profile configuration simple using one data file (`YAML`, `JSON`, or `Markdown`).
- Configure project list using one `JSONL` file with score-based ranking.

## Target Users
- Recruiters and hiring managers
- Potential collaborators
- Clients evaluating previous work

## Information Architecture
The page contains two vertically stacked sections in this order:
1. Profile
2. Portfolio

## Functional Requirements

### 1) Profile Section
The Profile section must display:
- Photo
- Name
- Email
- Current position
- Headlines
- CV download links (multiple links displayed horizontally with `|` separator)
- Social media links (multiple links displayed horizontally with `|` separator)

#### Profile behavior
- Email must be clickable via `mailto:`.
- CV and social links open in a new tab.
- Link groups should wrap gracefully on small screens.
- Photo should include alt text for accessibility.
- If photo is missing or invalid, display a fallback placeholder/avatar block.

### 2) Portfolio Section
Each portfolio item must display:
- Project title
- Project summary
- GitHub repository link

#### Portfolio behavior
- Projects are rendered in a vertical list.
- Every project item is separated by a horizontal line.
- Data source is one `JSONL` file.
- Sort order is based on `score` in descending order.
- Higher `score` means higher placement (closer to top).
- If scores are equal, preserve file order.

## Configuration Requirements

### Profile Data
Profile configuration must be easy to edit using one of:
- `YAML` (preferred)
- `JSON`
- `Markdown` (structured frontmatter-like fields)

Example (`YAML`):
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

### Portfolio Data
Portfolio must be configured from one `.jsonl` file.

Each JSONL row must contain:
- `score` (integer)
- `title`
- `summary`
- `repo_url`

Example (`JSONL`):
```jsonl
{"score": 95, "title": "Project Alpha", "summary": "A web platform for ...", "repo_url": "https://github.com/username/project-alpha"}
{"score": 88, "title": "Project Beta", "summary": "Automation tool for ...", "repo_url": "https://github.com/username/project-beta"}
{"score": 88, "title": "Project Gamma", "summary": "Analytics dashboard ...", "repo_url": "https://github.com/username/project-gamma"}
```

Validation rules:
- `score` must be an integer.
- Required fields must exist (`score`, `title`, `summary`, `repo_url`).
- Invalid rows should be skipped with non-blocking warning logs.

## UX/UI Requirements

### Layout
- Single-column, vertical content flow.
- Mobile-first design.
- Centered content container with readable max width on larger screens.

### Theme
- Use dark mode by default.
- Suggested palette:
  - Background: `#0b0f14`
  - Surface/card: `#121821`
  - Primary text: `#e6edf3`
  - Secondary text: `#9aa4b2`
  - Accent links: `#58a6ff`

### Typography and spacing
- Use a readable sans-serif stack.
- Ensure comfortable spacing between sections and list items.
- Keep separators visible but subtle.

### Photo styling
- Show profile photo at the top area of the Profile section.
- Mobile: photo above profile text.
- Tablet/Desktop: photo can be placed beside profile details.
- Recommended photo size:
  - Mobile: `88px` to `112px`
  - Desktop: `112px` to `144px`
- Add subtle border or shadow for contrast on dark background.

## Responsive Requirements
- Support mobile widths from `320px` and above.
- Maintain readable layout on tablet and desktop.
- Horizontal link groups (CV/social) must wrap without overlap.
- Ensure links are touch-friendly.

## Accessibility Requirements
- Sufficient color contrast for text and links on dark background.
- Semantic heading structure.
- Keyboard-navigable links and controls.
- Meaningful link labels.
- Photo must have informative `alt` text.

## Technical Requirements
- Static site compatible with GitHub Pages hosting.
- No backend required.
- Lightweight front-end with minimal dependencies.
- Fast loading and simple deployment via git push.

## Out of Scope (v1)
- Multi-page navigation
- Search and filtering of projects
- CMS/admin panel
- Analytics dashboards
- Internationalization

## Acceptance Criteria
- Profile section renders: photo, name, email, current position, headlines, CV links, and social links.
- CV links are displayed horizontally with `|` separators.
- Social links are displayed horizontally with `|` separators.
- Portfolio list is loaded from one `JSONL` file.
- Portfolio items are sorted by `score` descending.
- Each portfolio item shows title, summary, and repository link.
- Portfolio entries appear vertically, separated by horizontal lines.
- Dark theme is used by default.
- Layout is mobile-friendly and responsive.
- Site is ready to host on GitHub Pages.
