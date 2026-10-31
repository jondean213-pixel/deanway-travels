# DeanWay Travels Website — fresh build (2026-10-07)

Replaces the abandoned Replit site. Static HTML/CSS/JS — **zero dependencies, zero hosting cost, zero AI-meter.**

## What's here

- `index.html` — the whole site (hero, trust bar, services, Sail with Jon spotlight, how-it-works, lead form, contact)
- `styles.css` — navy & gold branding, mobile-first
- `site.js` — lead-form wiring

## Before it goes live (Jon's checklist)

1. **Command Center wiring** — open `site.js`, paste your Google Apps Script web app URL into `COMMAND_CENTER_URL`. Until then the form politely points visitors at your phone number instead of losing the lead.
2. **Group cruise rates** — the Sail with Jon section quotes NO prices yet (correct — rates come from the 9 AM Cruise Brothers call). Update it once you have the gross rates.
3. **Review the copy** — everything uses verified claims only (Cruise Brothers 1972, family-owned, ~1M travelers, TLN affiliate). No "no fees" / "same price" language.

## Deploy (free) — Netlify (recommended)

1. Jon creates a free account at netlify.com (2 minutes, email signup).
2. Netlify dashboard → **Add new site → Deploy manually** → drag the `website/` folder onto the page. You get `https://<name>.netlify.app` free.
3. Site settings → **Domain management → Add custom domain** → `deanwaytravel.com` (and `www.deanwaytravel.com`). Netlify shows the DNS target and issues the SSL cert automatically.

## Point deanwaytravel.com at it (Namecheap DNS)

In Namecheap → Domain List → Manage → Advanced DNS, add the records Netlify shows you (typically):
- `CNAME` — Host `@`, Value `<name>.netlify.app`
- `CNAME` — Host `www`, Value `<name>.netlify.app`

DNS can take a few minutes to a few hours to propagate.

## Alternative — Cloudflare Pages

Push `website/` to a GitHub repo, connect it in Cloudflare Pages (no build settings — static). Add `deanwaytravel.com` under Custom domains. Same result, slightly more setup.
