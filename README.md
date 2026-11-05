# Mil Studio

Personal website for Milaep (football editor & creator).

## Files
- `index.html` - page structure and SEO/share tags
- `privacy.html`, `terms.html` - legal pages linked from the footer
- `style.css` - colors (top of file), layout, animations
- `config.js` - **everything you will edit**: name, bio, links, gallery videos, Favorite team slides, stats
- `icons.js` - brand icons
- `script.js` - page logic (rarely needs editing)
- `scripts/tiktok.mjs` - helper for the future live stats (`node scripts/tiktok.mjs auth`, then `sync`)
- `Images/` - your images (e.g. `real-madrid.jpg`)

## Common edits
- **Add a gallery video:** in `config.js`, add `{url:"https://www.tiktok.com/@m1l.aep/video/123...", thumb:"Images/name.jpg"}` to `projects`. Take a portrait screenshot of the video (3:4 or 9:16), save it in `Images/`, and point `thumb` at it. Without `thumb` the card shows a gradient placeholder.
- **Gallery scrolling:** drag it with the mouse, use the ‹ › buttons, swipe on mobile, or focus it and use the arrow keys.
- **Favorite team slides:** put an image in `Images/`, then set `image:"Images/file.jpg"` in the `team` list.
- **Links / email:** `resources`, `socials`, `email` in `config.js`.
- **Dark mode:** the moon/sun button in the header. It follows your system theme until you pick one, and the choice is remembered in the browser. Theme colors are at the top of `style.css` (`pitch` = light, `night` = dark).
- **Stats:** `stats` in `config.js` (will be automated later with the TikTok API).
- **Legal pages:** edit the text in `privacy.html` and `terms.html`. Keep the “Last updated” date current, and replace the contact email if it ever changes.

## Stats data (`data/stats.json`)
One row per day with running totals:
```json
{"updated":"2026-11-05","history":[{"date":"2026-11-04","followers":1000,"views":500000},{"date":"2026-11-05","followers":1020,"views":520000}]}
```
- Views chart = views gained per day (per week in the Year view). Followers chart = running total.
- Day = last 7 days, Month = last 30 days, Year = last 12 months.
- While `history` is empty, the page automatically loads `data/stats.demo.json` and shows a **Preview data** badge so the layout still looks complete. Add at least two real rows to `data/stats.json` and the real numbers replace it automatically.
- `data/stats.demo.json` is FAKE data for previewing the look. You can point the fallback elsewhere with `demoUrl` in `config.js`, or remove `demoUrl` to show a plain placeholder instead.
- Preview with a local server (e.g. `python -m http.server`) rather than opening `index.html` directly, otherwise the browser blocks the stats `fetch()`.

## Deploy to GitHub Pages

The site is plain static files with relative paths, so it works from a repo root or a subfolder.

1. Create a **public** repo on GitHub (Pages on a private repo needs a paid plan).
2. Push this folder to it (`main` branch, files at the repo root, not inside a subfolder).
3. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`, then **Save**.
4. Wait for the first build, then open `https://<user>.github.io/<repo>/`.

`.nojekyll` is already included so GitHub serves the files as-is instead of running Jekyll.

Repo naming:
- `<user>.github.io` → site served at `https://<user>.github.io/`
- any other name → site served at `https://<user>.github.io/<repo>/`

After the site is live:
- Replace `og:image` and `twitter:image` in `index.html` with absolute URLs (`https://<user>.github.io/<repo>/Images/avatar.jpeg`), otherwise link previews break on some platforms.
- Re-check the contact form and gallery after the first deploy.

Custom domain later: **Settings → Pages → Custom domain**, add the domain, then create the DNS records GitHub shows (`A`/`AAAA` for an apex domain, `CNAME` for `www`). Enable **Enforce HTTPS** once the certificate is issued, and update the two absolute image URLs above.
