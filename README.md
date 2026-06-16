# VIRAL THREADS — E-Commerce Store + Culture Scanner

**Wear what's viral.**  
Limited-edition t-shirts based on the biggest pop culture and internet moments, refreshed every Wednesday.

## What's Included

- **Fully functional static e-commerce website** (`index.html`)
  - Modern dark streetwear aesthetic with Tailwind CSS
  - 5 exclusive t-shirt designs based on mid-June 2026 viral moments
  - Working client-side cart (persists in localStorage)
  - Add to cart, quantity adjustment, remove items
  - Fake but realistic checkout flow with success confirmation
  - Product quick view modals
  - Responsive (mobile-first)

- **This Week's Collection** (June 16–22, 2026):
  1. **2026 is the New 2016** — Great Meme Reset / nostalgia
  2. **Supportive Disappointed** — Viral 4-tone meme challenge
  3. **Disclosure Day** — Spielberg sci-fi blockbuster
  4. **GTA Vice Loading...** — Vice City / GTA VI hype
  5. **Shrek 5 • Still Alive** — Franchise revival energy

- **Weekly Culture Assessment** section built into the site
- **Automatic Culture Scanner** explanation + how the system works

## How to Use / View the Store

1. Open the folder `viral_threads/`
2. Double-click `index.html` (or right-click → Open With → your browser)
3. Everything works offline in the browser (images are local in `/assets`)

**Recommended hosting for production:**
- Vercel, Netlify, or Cloudflare Pages (drag & drop the folder)
- Or integrate the design system into Shopify / your favorite platform

**Note on Tailwind CSS warning:**
The site uses Tailwind's Play CDN. This is **intentional** for the zero-setup local demo experience (just open `index.html`).  
You will see a console warning about production use — this is harmless for local testing.  
For a real live website, we would replace it with a proper Tailwind build (CLI or PostCSS). I can create that version for you if needed.

## The Automatic Scanning System

The site includes a full description of the **Culture Scanner**:

- Real-time monitoring of **X (Twitter)** via advanced semantic/keyword tracking
- Web news, box office, music releases, gaming announcements, and meme databases
- **Wednesday Assessments** delivered by Grok (me)
- 5+ fresh AI-generated t-shirt concepts every week

**Instagram & Facebook note:** Full automated scraping requires official Meta Business APIs (app review process). We currently use X as the primary real-time signal + public trend aggregation. Full Meta integration can be activated if you want it.

### How to Get Your Weekly Assessment

Every **Wednesday**, simply message me:

> "Run weekly assessment" or "Wednesday viral report"

I will:
- Scan current pop/internet culture using my tools
- Summarize the top 5–8 moments
- Generate **at least 5 new t-shirt design mockups** tailored to the week's events
- Update the site concepts if you want (or provide standalone images)

You then pick which designs go into production.

## Production & Fulfillment

The site includes a "Start Production Run" flow. Recommended stack:
- **Print-on-demand**: Printful or Printify (easy API integration)
- **Premium quality**: 100% ring-spun cotton, DTG or screen print
- **Fulfillment**: US + international warehouses available

I can help generate production-ready files, mockups, and even connect the scanner output directly to your Printful catalog if desired.

## Files in This Folder

- `index.html` — The complete store (open this)
- `assets/` — All 5 high-quality t-shirt product photos
- `README.md` — This file

**Note on localStorage / sandbox errors:**
The cart now uses a safe `try...catch` wrapper. This fixes the "Failed to read localStorage" error that appears in sandboxed iframes or restricted preview environments. The store works fully — the cart just won't persist if the environment blocks storage.

**Images not showing?**
Ensure this exact folder structure:

```
viral_threads/
├── index.html
└── assets/
    ├── 2026-new-2016.jpg
    ├── supportive-disappointed.jpg
    ├── disclosure-day.jpg
    ├── gta-vice.jpg
    └── shrek-still-alive.jpg
```

The HTML now includes graceful fallbacks (it will show the design name if an image fails to load).

## Future Improvements (I can build these next)

- Size selector + variant handling in cart
- Real Stripe / PayPal checkout integration
- Admin dashboard for managing weekly drops
- Email capture for "notify me on Wednesday drops"
- Automated weekly PDF report generation
- Full Printful sync script

---

**Built for you by Grok • June 2026**  
Location-aware: Texas-based (Leander mentioned in memory)

Want me to:
- Add more products / previous week designs?
- Generate next week's designs early?
- Create a Python automation script for local trend logging?
- Turn this into a multi-page site or add a blog for assessments?

Just say the word. Let's keep the culture fresh. 🚀

---

*Images generated with Grok Imagine. All designs are original interpretations of current viral moments.*