# Hilo Bookshop
### hilobookshop.com

An independent bookshop in Buenos Aires organised around threads of connected thinking.

---

## Setup

### 1. Configure Airtable credentials

Open `js/airtable.js` and replace the two placeholder values:

```js
const AIRTABLE_TOKEN   = 'YOUR_AIRTABLE_TOKEN';   // patXXXXXXXXXXXXXX
const AIRTABLE_BASE_ID = 'YOUR_BASE_ID';           // appXXXXXXXXXXXXXX
```

**Never commit real credentials to a public repository.**

For production, use Netlify environment variables instead and update `airtable.js` to read from them via a serverless function (see below).

### 2. Airtable base structure

Create a base called **Hilo** with four tables:

**Books**
| Field | Type |
|---|---|
| Title | Single line text (primary) |
| Author | Single line text |
| Publisher | Single line text |
| Year | Number |
| ISBN | Single line text |
| Blurb | Long text |
| Cover URL | URL |
| Price | Currency |
| In Stock | Checkbox |
| Featured | Checkbox |
| Category | Single select: Political Economy / Urbanism / Architecture / Current Affairs / German |
| Thread | Link to Threads table |

**Events**
| Field | Type |
|---|---|
| Title | Single line text (primary) |
| Date | Date |
| Time | Single line text |
| Venue | Single line text |
| Description | Long text |
| Ticket URL | URL |
| Capacity | Number |
| Language | Single select: English / Spanish / Bilingual |
| Free | Checkbox |
| Active | Checkbox |

**Objects**
| Field | Type |
|---|---|
| Name | Single line text (primary) |
| Maker | Single line text |
| Origin | Single line text |
| Description | Long text |
| Price | Currency |
| Photo URL | URL |
| Available | Checkbox |
| Featured | Checkbox |

**Threads**
| Field | Type |
|---|---|
| Title | Single line text (primary) |
| Slug | Single line text (URL-safe, e.g. radical-cities) |
| Number | Number |
| Intro | Long text |
| Books | Link to Books table |
| Published | Checkbox |

### 3. Deploy to Netlify

1. Push this repository to GitHub
2. Connect the repo to Netlify
3. Netlify auto-deploys on every push to `main`
4. Add your custom domain in Netlify → Domain management

---

## File structure

```
hilo-bookshop/
├── index.html          Homepage
├── about.html          About & contact
├── catalogue.html      Book catalogue with filters
├── threads.html        Thread index
├── thread.html         Single thread (URL param: ?slug=)
├── events.html         Events listing
├── objects.html        Objects gallery
├── css/
│   └── style.css       Shared design system
├── js/
│   └── airtable.js     Airtable API wrapper
├── assets/             Images, fonts
├── netlify.toml        Netlify configuration
└── README.md
```

---

## Content management

All content is managed through Airtable:

- **Add a book** → New row in Books table, check Featured to show on homepage
- **Add an event** → New row in Events table, check Active to show on site
- **Add an object** → New row in Objects table, check Featured for homepage
- **Publish a thread** → New row in Threads table, check Published

---

## Customisation checklist

- [ ] Replace `YOUR_AIRTABLE_TOKEN` and `YOUR_BASE_ID` in `js/airtable.js`
- [ ] Update the hero text in `index.html`
- [ ] Replace placeholder bio text in `about.html`
- [ ] Add a portrait photo to `assets/` and reference in `about.html`
- [ ] Replace the Substack URL in newsletter forms
- [ ] Replace the Tally form embed in `about.html`
- [ ] Add real hero photograph for the homepage
- [ ] Update email addresses in `about.html`
- [ ] Update Instagram handle throughout
- [ ] Add `assets/favicon.ico`

---

## Stack

- **Frontend**: Vanilla HTML/CSS/JS — no build step, no framework
- **CMS**: Airtable (free tier)
- **Hosting**: Netlify (free tier)
- **Events/ticketing**: Luma (external, linked)
- **Newsletter**: Substack (embedded form)
- **Contact forms**: Tally (embedded)
- **Domain**: hilobookshop.com via Cloudflare

---

*Buenos Aires, 2026*
