# CLAUDE.md - Agent Operational Guidelines & Command Registry

## Project Overview
Darb Al Maha (درب المها) Cleaning Services Website - Static Bilingual (Arabic/English) High-Performance Web Application.

## Command Guidelines
Use full path to Node.js on Windows PowerShell environment: `& "C:\Program Files\nodejs\node.exe"`

- **Validation Check**: `& "C:\Program Files\nodejs\node.exe" validate-all.js`
- **Page Generation**: `& "C:\Program Files\nodejs\node.exe" generate-services-and-blog.js`
- **Sitemap Generation**: `& "C:\Program Files\nodejs\node.exe" generate-sitemap.js`
- **Link Fixer / Sanitizer**: `& "C:\Program Files\nodejs\node.exe" fix-all-links.js`

## Engineering Standards & Mandatory Rules
1. **Validation Requirement**: Always execute `validate-all.js` before confirming task completion (exit code must be 0).
2. **No Emojis**: Do not reintroduce unicode emojis in content pages or templates.
3. **No Numerical Pricing**: Keep pricing descriptions non-numerical / quote-based as per strategy.
4. **Phone Direct Links**: Primary call buttons must dial `tel:77170300`.
5. **AI Hub Protection**: Never modify or delete `<project_root>/AI/` files arbitrarily, and ensure `AI/` remains in `.gitignore`.
