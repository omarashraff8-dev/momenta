# Momenta — Event Atelier

A one-page website for **Momenta**, a Cairo-based engagement, katb ketab and wedding design studio. Built as a graduation project with **HTML, CSS and JavaScript only** — no frameworks, no build step, no external CDN. The whole site works offline.

**Live on the internet:** <https://omarashraff8-dev.github.io/momenta/>

---

## 1. How to open it

**Option A — double click**
Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari). Everything (photos, fonts, styles, scripts) is stored locally, so it works without an internet connection.

**Option B — local server** (recommended if you want to preview exactly like hosting)
From the `Momenta` folder:

```bash
npx serve .
# or
python -m http.server 5500
```

Then open <http://localhost:5500>.

---

## 2. What is inside

| Section | Description |
| --- | --- |
| **Hero** | Full-screen opening with arched mirror photograph, rotating wax seal, floating detail shot and scroll cue. |
| **Marquee** | Endless strip of services (engagements, katb ketab, weddings, proposals…). |
| **Story** | Studio story, three promises, animated counters (9 years / 520+ celebrations / 40+ venues / 98% referrals). |
| **Services** | Six services with staggered arched cards: engagement parties, katb ketab, weddings, proposals, outdoor, styling & details. |
| **Portfolio** | 42 real photographs in a masonry grid, five category filters, and a full-screen lightbox with captions, counter, keyboard arrows and Esc. |
| **Process** | Four-step timeline on a dark "ink" band with a consultation call to action. |
| **Packages** | Three pricing tiers (Intimate EGP 12,000 / Signature EGP 25,000 / Grand EGP 50,000) with the signature tier highlighted. |
| **Testimonials** | Auto-playing quote slider with dots, arrows, swipe support and pause on hover. |
| **CTA band** | Full-width rose-wall photograph with "Your date is waiting." |
| **Contact** | Studio details, WhatsApp / email / call links, and a validated enquiry form that delivers each enquiry to **omarashraff8@gmail.com**. |
| **Footer** | Sitemap, services, newsletter (delivered to the same inbox), oversized wordmark. |

### Interactions
- Preloader with brand mark
- Custom gold cursor (desktop only)
- Scroll progress bar
- Sticky header that shrinks on scroll
- Mobile menu with animated burger and focus management
- Reveal-on-scroll animations with staggering
- Active navigation link tracking
- Back-to-top button
- Reduced-motion support (`prefers-reduced-motion`)

### Technology
- **HTML5** — semantic landmarks, accessible ARIA on the menu, lightbox and filters
- **CSS3** — custom properties, CSS Grid, multi-column masonry, clamp() fluid type, arch shapes
- **Vanilla JavaScript (ES6)** — IntersectionObserver, requestAnimationFrame, no dependencies
- **Fonts** — Cormorant Garamond, Jost and Pinyon Script, self-hosted as 11 `.woff2` files
- **Photography** — 44 real event photographs supplied by the studio (42 in the portfolio)

### Responsive
Designed for 1440 px desktops and tested down to 390 px phones. Breakpoints at 1180 / 1024 / 820 / 640 / 480 px.

### Accessibility
Skip link, visible focus styles, aria-labels on icon buttons, `aria-pressed` on filters, `aria-modal` lightbox with focus trap and focus restore, form errors announced with `aria-live`, and a full reduced-motion fallback.

---

## 3. File structure

```
Momenta/
├── index.html              all markup
├── css/
│   ├── fonts.css           @font-face declarations
│   └── style.css           design system + layout + responsive rules
├── js/
│   └── main.js             all interactions
├── assets/
│   ├── images/             44 event photographs (jpg) — 42 shown in the gallery
│   └── fonts/              11 woff2 font files
└── README.md
```

---

## 4. Editing the content

| What | Where |
| --- | --- |
| Phone / WhatsApp, email, address, hours | `index.html` → contact section and mobile menu footer |
| Packages and prices | `index.html` → `#packages` section |
| Portfolio captions and categories | `index.html` → each `.g-item` (`data-category`, `data-title`, `.g-name`) |
| Photos | replace files in `assets/images/` keeping the same names |
| Colours and type scale | `css/style.css` → `:root` variables |
| Enquiry form delivery | `js/main.js` → contact form section (endpoint + fallback) |
| Newsletter | `js/main.js` → newsletter section (same FormSubmit inbox) |

### How the enquiry form works

The site is static, so enquiries are delivered by **FormSubmit**, a free relay that forwards form submissions to an inbox — no backend or API key needed.

1. The form posts to `https://formsubmit.co/ajax/omarashraff8@gmail.com` (see `js/main.js`) — **only when the page is opened through a web server** (`http://` / `https://`).
2. **One-time step:** the very first submission triggers an activation email from FormSubmit to `omarashraff8@gmail.com`. Open it and click *Activate* — after that, every enquiry lands in that inbox automatically.
3. **When the page is opened by double-clicking `index.html`** (`file://`), FormSubmit refuses the request by design (browsers send no origin). In that case the form skips the request and shows a *One last step* panel with the whole enquiry pre-filled in two buttons:
   - **Send on WhatsApp** → opens `wa.me/201026232426` with the message ready to send.
   - **Send by email** → opens the visitor's mail app with the message addressed to `omarashraff8@gmail.com`.
4. The same panel appears if the network drops or the service rejects the request, so an enquiry is never lost.
5. The footer **newsletter** uses the same FormSubmit inbox: it sends the address with the subject *"Momenta — newsletter signup"*. If the request fails (or the page is opened from `file://`), a toast asks the visitor to email `omarashraff8@gmail.com` instead.
6. To use a different inbox, change the address in **both** `index.html` (the form's `action` attribute and the `mailto:` links) and `js/main.js` (the `fetch` URLs and the mailto builder).

---

## 5. ملخص بالعربية

موقع **Momenta** هو موقع تعريفي من صفحة واحدة لاستوديو تنظيم حفلات الخطوبة وكتب الكتاب والأفراح، معمول بـ **HTML وCSS وJavaScript** فقط بدون أي مكتبات خارجية، ويعمل بدون إنترنت.

**اللينك الحقيقي على الإنترنت:** <https://omarashraff8-dev.github.io/momenta/>

- **الصور:** ٤٢ صورة حقيقية من أعمال الاستوديو، مقسّمة على الأقسام ومعرض أعمال بـ ٤٢ صورة وخمس فلاتر وLightbox.
- **الأسعار:** الباكدج بتبدأ من ١٢٬٠٠٠ و٢٥٬٠٠٠ و٥٠٬٠٠٠ جنيه.
- **التواصل:** الرقم 01026232426 — وأي رسالة من الفورم بتروح على omarashraff8@gmail.com عن طريق FormSubmit.
- **الخطوط:** Cormorant Garamond وJost وPinyon Script — محمّلة محليًا (11 ملف woff2).
- **التصميم:** كريمي وذهبي وحبر، خطوط سيريف، شكل الأرش الموجود في الصور، وأنيميشن هادئ عند التمرير.
- **التفاعل:** قائمة موبايل، سلايدر آراء، عدّادات أرقام، Lightbox بلوحة المفاتيح، تحقق من الفورم مع رسالة نجاح، وشريط تقدّم للتمرير.
- **الفتح:** دبل كليك على `index.html` أو تشغيل سيرفر محلي كما في الأعلى.

لتغيير رقم التليفون أو الإيميل أو العنوان: افتح `index.html` وابحث عن قسم `contact`.

**مهم:** أول مرة حد يبعت من الفورم، FormSubmit بيبعت إيميل تفعيل على `omarashraff8@gmail.com` — لازم تفتحه وتضغط *Activate* مرة واحدة بس، وبعدها كل الرسائل بتوصلك أوتوماتيك.

**ملاحظة:** الفورم بيبعت إيميل أوتوماتيك بس لما الموقع يكون مفتوح من سيرفر (`http://` أو `https://`). لو بتفتح `index.html` بالدبل كليك، الفورم بيظهر زرارين: **Send on WhatsApp** و**Send by email** — والاتنين فيهم كل بيانات العميل جاهزة، فمفيش رسالة بتضيع.
