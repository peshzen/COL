# Chaverim of Linden Website

Production-ready static website for Chaverim of Linden.

## Stack
- HTML5
- CSS3
- Vanilla JavaScript
- Third-party embeds (Zeffy, Google Forms, Google Maps)

## Project Structure
- `index.html` – Main document and content.
- `assets/css/styles.css` – All styles extracted from the HTML.
- `assets/js/main.js` – Navigation/page state logic.

## Local Development
Because this site uses iframes and external embeds, run it from a local web server rather than opening the file directly.

### Option 1: Python
```bash
python -m http.server 8080
```
Then open `http://localhost:8080`.

### Option 2: Node (if available)
```bash
npx serve .
```

## Deployment
This is a static site and can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- Any static file host/CDN

## Notes
- Frontend appearance/content intentionally preserved.
- JS includes hash-based page state support (`#home`, `#donate`, etc.) for direct linking without visual changes.
