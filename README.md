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
- `404.html` - the "page not found" page GitHub Pages serves automatically
- `robots.txt`, `sitemap.xml` - search engine files (they contain the live URL, see below)
- `Images/` - your images (e.g. `real-madrid.webp`)

## Common edits
- **Add a gallery video:** in `config.js`, add `{url:"https://www.tiktok.com/@m1l.aep/video/123...", thumb:"Images/name.jpg"}` to `projects`. Take a portrait screenshot of the video (3:4 or 9:16), save it in `Images/`, and point `thumb` at it. Without `thumb` the card shows a gradient placeholder.
- **Gallery scrolling:** drag it with the mouse, use the ‹ › buttons, swipe on mobile, or focus it and use the arrow keys.
- **Favorite team slides:** put an image in `Images/`, then set `image:"Images/file.jpg"` in the `team` list.
- **Links / email:** `resources`, `socials`, `email` in `config.js`. Every item in `resources` appears in the icon row and in **Show details**; add `dock:false` to an item to keep it in the details list (and the contact card) but out of the icon row.
- **Dark mode:** the moon/sun button in the header. It follows your system theme until you pick one, and the choice is remembered in the browser. Theme colors are at the top of `style.css` (`pitch` = light, `night` = dark).
- **Colors / pitch background:** `style.css` starts with the Real Madrid palette. Light mode = white kit + navy crest, dark mode = 23/24 third kit (black shirt, gold crest, steel-blue stripes). The original green values are kept as comments under each line, so rolling back is a copy/paste. The background is a CSS-drawn pitch (SVG in the `.bg` block of every page); the old circles version is kept as a comment above those rules.
- **Stats:** `stats` in `config.js` — four hand-entered numbers, no API needed (see below).
- **Legal pages:** edit the text in `privacy.html` and `terms.html`. Keep the “Last updated” date current, and replace the contact email if it ever changes.

## Statistics

The Statistics column shows four numbers, typed by hand in `config.js`:

```js
stats:{
 updated:"Nov 2026",                       // label under the tiles; "" hides it
 profile:"https://tiktok.com/@m1l.aep",    // "View profile" link; "" hides the link
 items:[
  {icon:"followers",label:"Followers",value:334800},
  {icon:"following",label:"Following",value:377},
  {icon:"likes",label:"Likes",value:21500000},
  {icon:"videos",label:"Videos",value:957}
 ]
},
```

- `value` is the raw number: the page abbreviates it (`334.8K`, `21.5M`), shows the exact number on hover, and counts up from zero when the section is first seen.
- `value:null` shows `—` instead of a number.
- `icon` can be `followers`, `following`, `likes`, `videos`, or `views`. Add or remove tiles freely; they lay out two per row.
- Update the numbers whenever you like, and refresh `updated`. Nothing else to maintain.
- The count-up respects `prefers-reduced-motion` and never leaves a wrong number if animation frames are throttled.

No TikTok API is involved, so there are no tokens, no server, and no scheduled job. If you ever want the numbers filled automatically, `scripts/tiktok.mjs` is kept as an optional starting point: it can read the official Display API, but that needs an approved TikTok developer app and a server-side place to store the token.

## Deploy to GitHub Pages

The site is plain static files with relative paths, so it works from a repo root or a subfolder.

1. Create a **public** repo on GitHub (Pages on a private repo needs a paid plan). The site is already set up for `github.com/milaep/milstudio`.
2. Push this folder to it (`main` branch, files at the repo root, not inside a subfolder).
3. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`, then **Save**.
4. Wait for the first build, then open `https://milaep.github.io/milstudio/`.

`.nojekyll` is already included so GitHub serves the files as-is instead of running Jekyll.

Repo naming:
- `<user>.github.io` → site served at `https://<user>.github.io/`
- any other name → site served at `https://<user>.github.io/<repo>/`

### If the URL ever changes

`https://milaep.github.io/milstudio/` is written into four places. If you rename the repo, move to a custom domain, or switch accounts, update all of them:

| File | What to change |
| --- | --- |
| `index.html` | `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`, and the `url`/`image` in the JSON-LD block |
| `robots.txt` | the `Sitemap:` line |
| `sitemap.xml` | every `<loc>` |
| `404.html` | the `<base href="/milstudio/">` tag |

A wrong canonical tells Google the real page is somewhere else, so it is worth doing in the same commit as the rename.

After the first deploy:
- Check that the link preview works when you paste the URL into Discord or WhatsApp (that is what `og:image` is for).
- Re-check the contact form and gallery on the live site.
- `404.html` is served for unknown URLs, but only once Pages is live — it will not appear on a local server.

Custom domain later: **Settings → Pages → Custom domain**, add the domain, then create the DNS records GitHub shows (`A`/`AAAA` for an apex domain, `CNAME` for `www`). Enable **Enforce HTTPS** once the certificate is issued, then update the four places in the table above.
