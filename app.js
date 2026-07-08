/* ===================================================
   app.js — Mautic Demo Interactive Logic
=================================================== */

// ──────────────────────────────────────────────────
// SHARED DATA
// ──────────────────────────────────────────────────
const LEAD_COLORS = ['#7c3aed','#0ea5e9','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4'];

const SEED_LEADS = [
  { firstName:'Alice',  lastName:'Martin',   email:'alice@example.com',   company:'Acme Corp',     interest:'email-marketing', date:'2026-07-01', status:'subscribed' },
  { firstName:'Bob',    lastName:'Chen',     email:'bob@techco.io',       company:'TechCo',        interest:'automation',      date:'2026-07-02', status:'subscribed' },
  { firstName:'Carla',  lastName:'Ramos',   email:'carla@startup.co',    company:'Startup Co',    interest:'lead-gen',        date:'2026-07-03', status:'subscribed' },
  { firstName:'David',  lastName:'Kim',     email:'david@corp.net',      company:'Corp Inc',      interest:'analytics',       date:'2026-07-04', status:'unsubscribed' },
  { firstName:'Elena',  lastName:'Gomez',   email:'elena@agency.com',    company:'Agency XYZ',    interest:'email-marketing', date:'2026-07-05', status:'subscribed' },
  { firstName:'Faisal', lastName:'Al-Ali',  email:'faisal@enterprise.sa',company:'Enterprise SA', interest:'automation',      date:'2026-07-06', status:'subscribed' },
  { firstName:'Grace',  lastName:'Lee',     email:'grace@media.co',      company:'Media Co',      interest:'lead-gen',        date:'2026-07-07', status:'subscribed' },
  { firstName:'Henry',  lastName:'Brown',   email:'henry@brown.dev',     company:'Brown Dev',     interest:'analytics',       date:'2026-07-08', status:'subscribed' },
];

// Load leads from localStorage or use seed data
function getLeads() {
  try {
    const stored = localStorage.getItem('mautic_leads');
    return stored ? JSON.parse(stored) : [...SEED_LEADS];
  } catch { return [...SEED_LEADS]; }
}

function saveLeads(leads) {
  localStorage.setItem('mautic_leads', JSON.stringify(leads));
}

// ──────────────────────────────────────────────────
// LANDING PAGE — LEAD CAPTURE FORM
// ──────────────────────────────────────────────────
const form = document.getElementById('leadForm');
if (form) {

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    // Show loading
    const btn = document.getElementById('submitBtn');
    btn.querySelector('.btn-text').textContent = 'Submitting…';
    btn.querySelector('.btn-spinner').classList.remove('hidden');
    btn.disabled = true;

    setTimeout(() => {
      // Save lead
      const leads = getLeads();
      leads.unshift({
        firstName: document.getElementById('firstName').value.trim(),
        lastName:  document.getElementById('lastName').value.trim(),
        email:     document.getElementById('email').value.trim(),
        company:   document.getElementById('company').value.trim() || '—',
        interest:  document.getElementById('interest').value || 'general',
        date:      new Date().toISOString().slice(0, 10),
        status:    'subscribed',
      });
      saveLeads(leads);

      // Show success
      form.classList.add('hidden');
      document.getElementById('formSuccess').classList.remove('hidden');
    }, 1200);
  });

  function validateForm() {
    let valid = true;

    const firstName = document.getElementById('firstName');
    const lastName  = document.getElementById('lastName');
    const email     = document.getElementById('email');
    const consent   = document.getElementById('consent');

    clearErrors();

    if (!firstName.value.trim()) {
      showError('firstNameError', 'First name is required.');
      firstName.classList.add('error');
      valid = false;
    }
    if (!lastName.value.trim()) {
      showError('lastNameError', 'Last name is required.');
      lastName.classList.add('error');
      valid = false;
    }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showError('emailError', 'Please enter a valid email address.');
      email.classList.add('error');
      valid = false;
    }
    if (!consent.checked) {
      showError('consentError', 'You must agree to receive emails.');
      valid = false;
    }

    return valid;
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  function clearErrors() {
    ['firstNameError','lastNameError','emailError','consentError'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
    ['firstName','lastName','email'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('error');
    });
  }
}

// ──────────────────────────────────────────────────
// DASHBOARD
// ──────────────────────────────────────────────────
if (document.body.classList.contains('dashboard-page')) {
  initDashboard();
}

function initDashboard() {
  animateKPIs();
  renderBarChart();
  renderDonut();
  renderRecentLeads();
  renderCampaigns();
  renderLeadsTable();
  setDefaultCampaignDate();
}

// ── KPI COUNTER ANIMATION ──
function animateKPIs() {
  document.querySelectorAll('.kpi-value[data-target]').forEach(el => {
    const target  = parseInt(el.dataset.target);
    const suffix  = el.dataset.suffix || '';
    const duration = 1200;
    const step    = target / (duration / 16);
    let current   = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current).toLocaleString() + suffix;
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}

// ── BAR CHART ──
const CHART_DATA = [
  { label:'Jun 30', opens: 62, clicks: 28 },
  { label:'Jul 1',  opens: 55, clicks: 22 },
  { label:'Jul 2',  opens: 70, clicks: 35 },
  { label:'Jul 3',  opens: 80, clicks: 40 },
  { label:'Jul 4',  opens: 45, clicks: 18 },
  { label:'Jul 5',  opens: 90, clicks: 52 },
  { label:'Jul 6',  opens: 75, clicks: 38 },
  { label:'Jul 7',  opens: 85, clicks: 45 },
  { label:'Jul 8',  opens: 60, clicks: 30 },
];

function renderBarChart() {
  const chart = document.getElementById('engagementChart');
  if (!chart) return;

  const max = Math.max(...CHART_DATA.flatMap(d => [d.opens, d.clicks]));

  chart.innerHTML = CHART_DATA.map(d => `
    <div class="bar-group">
      <div class="bar-pair">
        <div class="bar" style="height:${(d.opens/max)*140}px;background:#7c3aed" title="Opens: ${d.opens}%"></div>
        <div class="bar" style="height:${(d.clicks/max)*140}px;background:#10b981" title="Clicks: ${d.clicks}%"></div>
      </div>
      <div class="bar-label">${d.label}</div>
    </div>
  `).join('');
}

// ── DONUT CHART ──
const DONUT_DATA = [
  { label:'Mobile',  pct: 48, color:'#7c3aed' },
  { label:'Desktop', pct: 38, color:'#0ea5e9' },
  { label:'Tablet',  pct: 14, color:'#10b981' },
];

function renderDonut() {
  const svg    = document.getElementById('donutSvg');
  const legend = document.getElementById('donutLegend');
  if (!svg || !legend) return;

  const cx = 60, cy = 60, r = 45, stroke = 18;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  let paths = '';
  DONUT_DATA.forEach(d => {
    const dash = (d.pct / 100) * circumference;
    paths += `<circle
      cx="${cx}" cy="${cy}" r="${r}"
      fill="none"
      stroke="${d.color}"
      stroke-width="${stroke}"
      stroke-dasharray="${dash} ${circumference - dash}"
      stroke-dashoffset="${-offset}"
      transform="rotate(-90 ${cx} ${cy})"
    />`;
    offset += dash;
  });

  svg.innerHTML = paths;

  legend.innerHTML = DONUT_DATA.map(d => `
    <div class="donut-item">
      <div class="donut-item-left">
        <div class="donut-dot" style="background:${d.color}"></div>
        <span>${d.label}</span>
      </div>
      <span class="donut-pct">${d.pct}%</span>
    </div>
  `).join('');
}

// ── RECENT LEADS ──
function renderRecentLeads() {
  const list = document.getElementById('recentLeadsList');
  if (!list) return;

  const leads = getLeads().slice(0, 6);
  list.innerHTML = leads.map((lead, i) => {
    const initials = (lead.firstName[0] + lead.lastName[0]).toUpperCase();
    const color    = LEAD_COLORS[i % LEAD_COLORS.length];
    const timeAgo  = relativeDate(lead.date);
    return `
      <li class="lead-item">
        <div class="lead-avatar" style="background:${color}">${initials}</div>
        <div class="lead-info">
          <div class="lead-name">${lead.firstName} ${lead.lastName}</div>
          <div class="lead-email">${lead.email}</div>
        </div>
        <span class="lead-time">${timeAgo}</span>
      </li>
    `;
  }).join('');
}

// ── CAMPAIGNS ──
const SEED_CAMPAIGNS = [
  { name:'Welcome Series',     subject:'👋 Welcome aboard!',          segment:'All Subscribers', date:'2026-06-28', status:'active',  sent:5210, opens:48, clicks:22 },
  { name:'Product Launch Q3',  subject:'🚀 Big news: Q3 launch',       segment:'Lead Generation', date:'2026-07-02', status:'active',  sent:3840, opens:41, clicks:19 },
  { name:'Re-engagement Drip', subject:'💬 We miss you…',             segment:'Email Marketing', date:'2026-07-05', status:'paused',  sent:2100, opens:29, clicks:11 },
  { name:'Newsletter — July',  subject:'📰 July marketing digest',     segment:'All Subscribers', date:'2026-07-15', status:'draft',   sent:0,    opens:0,  clicks:0  },
];

function getCampaigns() {
  try {
    const stored = localStorage.getItem('mautic_campaigns');
    return stored ? JSON.parse(stored) : [...SEED_CAMPAIGNS];
  } catch { return [...SEED_CAMPAIGNS]; }
}
function saveCampaigns(c) { localStorage.setItem('mautic_campaigns', JSON.stringify(c)); }

function renderCampaigns() {
  const grid = document.getElementById('campaignsGrid');
  if (!grid) return;

  const campaigns = getCampaigns();
  grid.innerHTML = campaigns.map(c => `
    <div class="campaign-card">
      <div class="cc-header">
        <div class="cc-name">${c.name}</div>
        <span class="badge-status ${c.status}">${c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span>
      </div>
      <div class="cc-subject">${c.subject}</div>
      <div class="cc-meta">
        <span>📅 ${c.date}</span>
        <span>🏷️ ${c.segment}</span>
      </div>
      <div class="cc-stats">
        <div class="cc-stat"><div class="cc-stat-val">${c.sent ? c.sent.toLocaleString() : '—'}</div><div class="cc-stat-lbl">Sent</div></div>
        <div class="cc-stat"><div class="cc-stat-val">${c.opens ? c.opens+'%' : '—'}</div><div class="cc-stat-lbl">Opens</div></div>
        <div class="cc-stat"><div class="cc-stat-val">${c.clicks ? c.clicks+'%' : '—'}</div><div class="cc-stat-lbl">Clicks</div></div>
      </div>
    </div>
  `).join('');
}

// ── LEADS TABLE ──
let allLeads = [];
function renderLeadsTable() {
  allLeads = getLeads();
  populateLeadsTable(allLeads);
}

function populateLeadsTable(leads) {
  const tbody = document.getElementById('leadsTableBody');
  if (!tbody) return;

  const interestLabels = {
    'email-marketing': 'Email Marketing',
    'lead-gen':        'Lead Generation',
    'automation':      'Automation',
    'analytics':       'Analytics',
    'general':         'General',
    '':                '—',
  };

  tbody.innerHTML = leads.map((lead, i) => {
    const initials = (lead.firstName[0] + lead.lastName[0]).toUpperCase();
    const color    = LEAD_COLORS[i % LEAD_COLORS.length];
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:0.6rem">
            <div class="lead-avatar" style="background:${color};width:28px;height:28px;font-size:0.65rem">${initials}</div>
            <strong>${lead.firstName} ${lead.lastName}</strong>
          </div>
        </td>
        <td>${lead.email}</td>
        <td>${lead.company || '—'}</td>
        <td>${interestLabels[lead.interest] || lead.interest || '—'}</td>
        <td>${lead.date}</td>
        <td><span class="badge-status ${lead.status === 'subscribed' ? 'active' : 'paused'}">${lead.status}</span></td>
      </tr>
    `;
  }).join('');
}

function filterLeads(query) {
  const q = query.toLowerCase();
  const filtered = allLeads.filter(l =>
    `${l.firstName} ${l.lastName} ${l.email} ${l.company}`.toLowerCase().includes(q)
  );
  populateLeadsTable(filtered);
}

// ── SECTION NAVIGATION ──
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const section = document.getElementById(`section-${name}`);
  if (section) section.classList.add('active');

  const navItem = document.getElementById(`nav-${name}`);
  if (navItem) navItem.classList.add('active');

  document.getElementById('pageTitle').textContent =
    name.charAt(0).toUpperCase() + name.slice(1);

  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

// ── SIDEBAR TOGGLE ──
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ── CAMPAIGN MODAL ──
function openCampaignModal() {
  document.getElementById('campaignModal').classList.remove('hidden');
}
function closeCampaignModal() {
  document.getElementById('campaignModal').classList.add('hidden');
  document.getElementById('campaignForm').reset();
}

function saveCampaign(e) {
  e.preventDefault();
  const campaigns = getCampaigns();
  campaigns.unshift({
    name:    document.getElementById('campaignName').value.trim(),
    subject: document.getElementById('campaignSubject').value.trim(),
    segment: document.getElementById('campaignSegment').options[document.getElementById('campaignSegment').selectedIndex].text,
    date:    document.getElementById('campaignDate').value,
    status:  'draft',
    sent:    0, opens: 0, clicks: 0,
  });
  saveCampaigns(campaigns);
  closeCampaignModal();
  renderCampaigns();
}

function setDefaultCampaignDate() {
  const dateInput = document.getElementById('campaignDate');
  if (dateInput) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }
}

// ── FORM EMBED COPY ──
function copyEmbed() {
  navigator.clipboard.writeText('<script src="https://your-mautic.com/form/1/generate.js"><\/script>')
    .then(() => alert('Embed code copied!'));
}
function copyEmbed2() {
  navigator.clipboard.writeText('<script src="https://your-mautic.com/form/2/generate.js"><\/script>')
    .then(() => alert('Embed code copied!'));
}

// ── HELPERS ──
function relativeDate(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return '1d ago';
  return `${diff}d ago`;
}

// Close modal on backdrop click
document.addEventListener('click', e => {
  const modal = document.getElementById('campaignModal');
  if (modal && e.target === modal) closeCampaignModal();
});
