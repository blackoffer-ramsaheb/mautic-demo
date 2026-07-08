# Mautic Demo Project

A simple **email campaign + lead-capture form** demo built with:
- **Mautic v5** (via Docker) for the real marketing automation backend
- **HTML / CSS / JS** demo UI for the landing page and campaign dashboard mockup

---

## Project Structure

```
mautic-demo/
├── docker-compose.yml   # Mautic + MariaDB services
├── index.html           # Lead-capture landing page
├── dashboard.html       # Campaign dashboard UI
├── style.css            # Dark-mode design system
├── app.js               # Form logic, charts, localStorage
└── README.md
```

---

## Quick Start

### 1. Run the Demo UI (no Docker needed)
Just open `index.html` in your browser. Everything works via localStorage.

### 2. Run Real Mautic (Docker)

**Prerequisites:** Docker Desktop installed and running.

```powershell
# From the mautic-demo folder:
docker compose up -d
```

- Mautic UI → http://localhost:8080
- First run takes ~2 minutes for MariaDB to initialize.
- Complete the Mautic installer in the browser.

**Stop:**
```powershell
docker compose down
```

**Stop + delete all data:**
```powershell
docker compose down -v
```

---

## Demo UI Features

### Landing Page (`index.html`)
| Feature | Detail |
|---|---|
| Lead capture form | Validates name, email, consent |
| Interest selection | Segments leads by topic |
| Success state | Animated confirmation on submit |
| Responsive | Works on mobile, tablet, desktop |

### Dashboard (`dashboard.html`)
| Feature | Detail |
|---|---|
| KPI cards | Animated counters — Leads, Emails Sent, Open Rate, Click Rate |
| Bar chart | 9-day engagement chart (opens vs clicks) |
| Donut chart | Device breakdown (Mobile / Desktop / Tablet) |
| Campaigns table | Active, paused, draft campaigns |
| Recent leads | Live from localStorage |
| Leads section | Full table + search filter |
| Forms section | Embed code preview + copy |
| Segments section | 4 audience segments |
| New Campaign modal | Create campaigns, saved to localStorage |

---

## Connecting the UI to Real Mautic

Once Mautic is running at `http://localhost:8080`:

1. Go to **Components → Forms → New Form**
2. Add fields: First Name, Last Name, Email, Interest
3. Click **Generate HTML** — copy the embed `<script>` tag
4. Replace the demo form in `index.html` with the Mautic embed code

---

## Environment Variables (docker-compose.yml)

| Variable | Value |
|---|---|
| `MAUTIC_DB_HOST` | `db` |
| `MAUTIC_DB_USER` | `mautic` |
| `MAUTIC_DB_PASSWORD` | `mautic` |
| `MAUTIC_DB_NAME` | `mautic` |

> ⚠️ Change passwords before any production use.
