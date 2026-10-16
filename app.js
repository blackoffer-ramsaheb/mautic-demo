/* ===================================================
   app.js — Mautic Demo Interactive Logic & Data Engine
   Enterprise-grade interactive features, real-time sync,
   SVG charts, bulk actions, and visual automations.
   =================================================== */

// ──────────────────────────────────────────────────
// 1. DATA MODELS & SEED DATA
// ──────────────────────────────────────────────────
const LEAD_COLORS = ['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

const SEED_LEADS = [
  { id: 'lead_1',  firstName: 'Alice',  lastName: 'Martin',    email: 'alice@example.com',    company: 'Acme Corp',      interest: 'email-marketing', date: '2026-07-01', status: 'subscribed' },
  { id: 'lead_2',  firstName: 'Bob',    lastName: 'Chen',      email: 'bob@techco.io',        company: 'TechCo Global',  interest: 'automation',       date: '2026-07-02', status: 'subscribed' },
  { id: 'lead_3',  firstName: 'Carla',  lastName: 'Ramos',     email: 'carla@startup.co',     company: 'Startup Co',     interest: 'lead-gen',         date: '2026-07-03', status: 'subscribed' },
  { id: 'lead_4',  firstName: 'David',  lastName: 'Kim',       email: 'david@corp.net',       company: 'Corp Systems',   interest: 'analytics',        date: '2026-07-04', status: 'unsubscribed' },
  { id: 'lead_5',  firstName: 'Elena',  lastName: 'Gomez',     email: 'elena@agency.com',     company: 'Apex Media',     interest: 'email-marketing',  date: '2026-07-05', status: 'subscribed' },
  { id: 'lead_6',  firstName: 'Faisal', lastName: 'Al-Ali',    email: 'faisal@enterprise.sa', company: 'Enterprise SA',  interest: 'automation',       date: '2026-07-06', status: 'subscribed' },
  { id: 'lead_7',  firstName: 'Grace',  lastName: 'Lee',       email: 'grace@media.co',       company: 'Omni Digital',   interest: 'lead-gen',         date: '2026-07-07', status: 'subscribed' },
  { id: 'lead_8',  firstName: 'Henry',  lastName: 'Brown',     email: 'henry@brown.dev',      company: 'Brown Cloud',    interest: 'analytics',        date: '2026-07-08', status: 'subscribed' },
  { id: 'lead_9',  firstName: 'Maya',   lastName: 'Patel',     email: 'maya@growthhub.in',    company: 'GrowthHub',      interest: 'automation',       date: '2026-07-09', status: 'subscribed' },
  { id: 'lead_10', firstName: 'Liam',   lastName: "O'Connor",  email: 'liam@fintech.ie',      company: 'Fintech Europe', interest: 'lead-gen',         date: '2026-07-10', status: 'subscribed' },
];

const SEED_CAMPAIGNS = [
  { id: 'c1', name: 'Welcome Series',     subject: '👋 Welcome aboard to Mautic!',       segment: 'All Subscribers', date: '2026-06-28', status: 'active',  sent: 5210, opens: 48, clicks: 22, body: 'Welcome to our developer and marketing community! In this 5-part series, we cover open-source automation, lead scoring, and CRM integration.' },
  { id: 'c2', name: 'Product Launch Q3',  subject: '🚀 Announcing the Q3 Release',        segment: 'Lead Generation', date: '2026-07-02', status: 'active',  sent: 3840, opens: 41, clicks: 19, body: 'We are thrilled to announce our Q3 feature release including lightning-fast segmentation, automated webhooks, and visual workflow builders.' },
  { id: 'c3', name: 'Re-engagement Drip', subject: "💬 Where did you go? Here's 20% off", segment: 'Email Marketing', date: '2026-07-05', status: 'paused',  sent: 2100, opens: 29, clicks: 11, body: 'We noticed you have not visited lately! Here is an exclusive 20% savings credit on our enterprise automation advisory services.' },
  { id: 'c4', name: 'Newsletter — July',  subject: '📰 July Marketing Digest & Playbook', segment: 'All Subscribers', date: '2026-07-15', status: 'draft',   sent: 0,    opens: 0,  clicks: 0,  body: 'Your monthly playbook for open-source growth: high-converting email copy, email deliverability guidelines, and zero-cost hosting tips.' },
];

const INTEREST_LABELS = {
  'email-marketing': 'Email Marketing',
  'lead-gen':        'Lead Generation',
  'automation':      'Automation',
  'analytics':       'Analytics',
  'general':         'General',
};

// HTML escape utility
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Storage getters & setters
function getLeads() {
  try {
    const stored = localStorage.getItem('mautic_leads');
    const leads = stored ? JSON.parse(stored) : [...SEED_LEADS];
    let modified = false;
    leads.forEach((l, idx) => {
      if (!l.id) {
        l.id = 'lead_' + (Date.now() + idx);
        modified = true;
      }
    });
    if (modified) saveLeads(leads);
    return leads;
  } catch {
    return [...SEED_LEADS];
  }
}

function saveLeads(leads) {
  localStorage.setItem('mautic_leads', JSON.stringify(leads));
}

function getCampaigns() {
  try {
    const stored = localStorage.getItem('mautic_campaigns');
    const campaigns = stored ? JSON.parse(stored) : [...SEED_CAMPAIGNS];
    let modified = false;
    campaigns.forEach((c, idx) => {
      if (!c.id) {
        c.id = 'camp_' + (Date.now() + idx);
        modified = true;
      }
    });
    if (modified) saveCampaigns(campaigns);
    return campaigns;
  } catch {
    return [...SEED_CAMPAIGNS];
  }
}

function saveCampaigns(campaigns) {
  localStorage.setItem('mautic_campaigns', JSON.stringify(campaigns));
}

// ──────────────────────────────────────────────────
// 2. THEME ENGINE (DARK / LIGHT MODE)
// ──────────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('mautic_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcons(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('mautic_theme', next);
  updateThemeIcons(next);
  showToast(`Switched to ${next} theme!`, 'info');
}

function updateThemeIcons(theme) {
  const icon = theme === 'dark' ? '🌙' : '☀️';
  const btn1 = document.getElementById('themeToggleBtn');
  const btn2 = document.getElementById('dashThemeToggleBtn');
  if (btn1) btn1.textContent = icon;
  if (btn2) btn2.textContent = icon;
}

// ──────────────────────────────────────────────────
// 3. TOAST NOTIFICATIONS
// ──────────────────────────────────────────────────
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || '📢'}</span> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }, 3500);
}

// ──────────────────────────────────────────────────
// 4. CONFETTI CELEBRATION ENGINE
// ──────────────────────────────────────────────────
function runConfettiAnimation() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width = window.innerWidth;
  const height = canvas.height = window.innerHeight;

  const pieces = [];
  const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

  for (let i = 0; i < 70; i++) {
    pieces.push({
      x: width * 0.5 + (Math.random() - 0.5) * 200,
      y: height * 0.35,
      w: Math.random() * 8 + 4,
      h: Math.random() * 10 + 6,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -12 - 4,
      rot: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1
    });
  }

  let animationFrame;
  function update() {
    ctx.clearRect(0, 0, width, height);
    let alive = false;

    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rot += p.vrot;
      p.opacity -= 0.012;

      if (p.opacity > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    });

    if (alive) {
      animationFrame = requestAnimationFrame(update);
    } else {
      ctx.clearRect(0, 0, width, height);
      cancelAnimationFrame(animationFrame);
    }
  }

  update();
}

// ──────────────────────────────────────────────────
// 5. LANDING PAGE LOGIC
// ──────────────────────────────────────────────────
const DEMO_PREFILLS = [
  { first: 'Sophia', last: 'Vance', email: 'sophia.vance@innovatetech.io', comp: 'Innovate Tech', interest: 'automation' },
  { first: 'Marcus', last: 'Sterling', email: 'marcus@nexuscrm.com', comp: 'Nexus CRM Global', interest: 'email-marketing' },
  { first: 'Amara', last: 'Okafor', email: 'amara@cloudscalesolutions.org', comp: 'CloudScale', interest: 'lead-gen' },
  { first: 'Julian', last: 'Mercer', email: 'julian@hyperfunnel.co', comp: 'HyperFunnel Labs', interest: 'analytics' },
];
let prefillIndex = 0;

function prefillDemoLead() {
  const p = DEMO_PREFILLS[prefillIndex % DEMO_PREFILLS.length];
  prefillIndex++;

  const fn = document.getElementById('firstName');
  const ln = document.getElementById('lastName');
  const em = document.getElementById('email');
  const co = document.getElementById('company');
  const int = document.getElementById('interest');

  if (fn) fn.value = p.first;
  if (ln) ln.value = p.last;
  if (em) em.value = p.email;
  if (co) co.value = p.comp;
  if (int) int.value = p.interest;

  clearLeadFormErrors();
  updateSegmentPreviewTip();
  showToast(`Pre-filled sample contact: ${p.first} ${p.last}`, 'info');
}

function updateSegmentPreviewTip() {
  const int = document.getElementById('interest');
  const tip = document.getElementById('segmentPreviewTip');
  if (!int || !tip) return;

  const tips = {
    'email-marketing': '💡 Automated Journey: Enrolls in 5-day Email Deliverability & Copywriting masterclass.',
    'lead-gen':        '💡 Automated Journey: Enrolls in High-Converting Funnel & Inbound Lead Capture series.',
    'automation':      '💡 Automated Journey: Enrolls in Multi-Branch Drip Sequence & Webhook Playbook.',
    'analytics':       '💡 Automated Journey: Enrolls in Campaign ROI & Funnel Attribution Heatmap tracking.'
  };

  tip.textContent = tips[int.value] || '💡 Automated Journey: Enrolls in standard Welcome Drip Sequence.';
}

function initSocialProofTicker() {
  const tickerText = document.getElementById('heroTickerText');
  if (!tickerText) return;

  const leads = getLeads();
  let tickerIdx = 0;

  setInterval(() => {
    if (leads.length === 0) return;
    const lead = leads[tickerIdx % leads.length];
    tickerIdx++;

    tickerText.style.opacity = '0';
    setTimeout(() => {
      const segName = INTEREST_LABELS[lead.interest] || 'Marketing';
      tickerText.innerHTML = `<strong>${escapeHtml(lead.firstName)} ${escapeHtml(lead.lastName)}</strong> from ${escapeHtml(lead.company || 'Enterprise')} joined ${escapeHtml(segName)} · Just now`;
      tickerText.style.opacity = '1';
    }, 300);
  }, 5000);
}

function updateRoiCalc() {
  const slider = document.getElementById('roiSlider');
  const countDisplay = document.getElementById('roiContactCountDisplay');
  const mailchimpPrice = document.getElementById('roiMailchimpPrice');
  const hubspotPrice = document.getElementById('roiHubspotPrice');
  const savingsBanner = document.getElementById('roiSavingsBanner');

  if (!slider) return;
  const count = parseInt(slider.value, 10);
  if (countDisplay) countDisplay.textContent = count.toLocaleString() + ' Contacts';

  // Mailchimp approx pricing tier
  const mcMonthly = Math.round(35 + (count / 1000) * 10.5);
  // HubSpot approx pricing tier
  const hsMonthly = Math.round(50 + (count / 1000) * 45);
  // Mautic self-hosted is just VPS hosting
  const mauticMonthly = 15;

  const annualSavings = (hsMonthly - mauticMonthly) * 12;

  if (mailchimpPrice) mailchimpPrice.innerHTML = `$${mcMonthly.toLocaleString()} <small>/mo</small>`;
  if (hubspotPrice) hubspotPrice.innerHTML = `$${hsMonthly.toLocaleString()} <small>/mo</small>`;
  if (savingsBanner) {
    savingsBanner.textContent = `💰 Estimated Annual Savings with Mautic: $${annualSavings.toLocaleString()} / year!`;
  }
}

function toggleFaq(el) {
  const parent = el.closest('.faq-item');
  if (parent) {
    parent.classList.toggle('open');
  }
}

function resetDemoForm() {
  const form = document.getElementById('leadForm');
  const successState = document.getElementById('formSuccess');
  if (form) {
    form.reset();
    form.classList.remove('hidden');
    clearLeadFormErrors();
  }
  if (successState) {
    successState.classList.add('hidden');
  }
}

function clearLeadFormErrors() {
  ['firstNameError', 'lastNameError', 'emailError', 'consentError'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  ['firstName', 'lastName', 'email'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('error');
  });
}

function initLandingPage() {
  initSocialProofTicker();
  updateRoiCalc();

  const heroStatLeads = document.getElementById('heroStatsLeads');
  if (heroStatLeads) {
    const totalCount = 3240 + getLeads().length;
    heroStatLeads.textContent = totalCount.toLocaleString() + '+';
  }

  const leadForm = document.getElementById('leadForm');
  if (!leadForm) return;

  leadForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateLeadForm()) return;

    const btn = document.getElementById('submitBtn');
    const originalText = btn.querySelector('.btn-text').textContent;
    btn.querySelector('.btn-text').textContent = 'Submitting…';
    btn.querySelector('.btn-spinner').classList.remove('hidden');
    btn.disabled = true;

    const firstName = document.getElementById('firstName').value.trim();
    const lastName  = document.getElementById('lastName').value.trim();
    const email     = document.getElementById('email').value.trim();
    const company   = document.getElementById('company').value.trim() || '—';
    const interest  = document.getElementById('interest').value || 'email-marketing';
    const dateStr   = new Date().toISOString().slice(0, 10);

    setTimeout(() => {
      // 1. Save lead into localStorage with unique ID
      const leads = getLeads();
      const newLead = {
        id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        firstName,
        lastName,
        email,
        company,
        interest,
        date: dateStr,
        status: 'subscribed'
      };
      leads.unshift(newLead);
      saveLeads(leads);

      // 2. Populate Lead Summary Box
      const summaryBox = document.getElementById('leadSummaryBox');
      if (summaryBox) {
        summaryBox.innerHTML = `
          <div class="lead-summary-row">
            <span class="lead-summary-label">Contact Name:</span>
            <span class="lead-summary-val">${escapeHtml(firstName)} ${escapeHtml(lastName)}</span>
          </div>
          <div class="lead-summary-row">
            <span class="lead-summary-label">Work Email:</span>
            <span class="lead-summary-val">${escapeHtml(email)}</span>
          </div>
          <div class="lead-summary-row">
            <span class="lead-summary-label">Company:</span>
            <span class="lead-summary-val">${escapeHtml(company)}</span>
          </div>
          <div class="lead-summary-row">
            <span class="lead-summary-label">Target Segment:</span>
            <span class="lead-summary-val">${escapeHtml(INTEREST_LABELS[interest] || interest)}</span>
          </div>
          <div class="lead-summary-row">
            <span class="lead-summary-label">Workflow Action:</span>
            <span class="lead-summary-val" style="color:var(--success)">⚡ Enrolled in 'Welcome Series' Drip</span>
          </div>
        `;
      }

      // 3. Update hero stats counter
      if (heroStatLeads) {
        heroStatLeads.textContent = (3240 + leads.length).toLocaleString() + '+';
      }

      // 4. Reveal success view & run celebration confetti!
      leadForm.classList.add('hidden');
      document.getElementById('formSuccess').classList.remove('hidden');
      runConfettiAnimation();

      // Reset button state
      btn.querySelector('.btn-text').textContent = originalText;
      btn.querySelector('.btn-spinner').classList.add('hidden');
      btn.disabled = false;

      showToast(`Contact ${firstName} ${lastName} captured & enrolled in Welcome Drip!`);
    }, 500);
  });

  function validateLeadForm() {
    let valid = true;
    const firstName = document.getElementById('firstName');
    const lastName  = document.getElementById('lastName');
    const email     = document.getElementById('email');
    const consent   = document.getElementById('consent');

    clearLeadFormErrors();

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
      showError('emailError', 'Please enter a valid business email address.');
      email.classList.add('error');
      valid = false;
    }
    if (!consent.checked) {
      showError('consentError', 'GDPR consent is required to receive emails.');
      valid = false;
    }

    return valid;
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }
}

// ──────────────────────────────────────────────────
// 6. CHART DATA & MULTI-VIEW ENGINE (BAR & TREND LINE)
// ──────────────────────────────────────────────────
const MASTER_CHART_DATA = [
  { label: 'Jun 28', opens: 50, clicks: 20 },
  { label: 'Jun 29', opens: 58, clicks: 24 },
  { label: 'Jun 30', opens: 62, clicks: 28 },
  { label: 'Jul 1',  opens: 55, clicks: 22 },
  { label: 'Jul 2',  opens: 70, clicks: 35 },
  { label: 'Jul 3',  opens: 80, clicks: 40 },
  { label: 'Jul 4',  opens: 45, clicks: 18 },
  { label: 'Jul 5',  opens: 90, clicks: 52 },
  { label: 'Jul 6',  opens: 75, clicks: 38 },
  { label: 'Jul 7',  opens: 85, clicks: 45 },
  { label: 'Jul 8',  opens: 60, clicks: 30 },
  { label: 'Jul 9',  opens: 72, clicks: 34 },
  { label: 'Jul 10', opens: 88, clicks: 46 },
  { label: 'Jul 11', opens: 94, clicks: 50 },
];

let currentChartType = 'bar';
let currentChartDays = 9;

function switchChartType(type) {
  currentChartType = type;
  const barBtn = document.getElementById('chartTypeBar');
  const lineBtn = document.getElementById('chartTypeLine');
  const barEl = document.getElementById('engagementChart');
  const lineCont = document.getElementById('engagementLineContainer');

  if (barBtn) barBtn.classList.toggle('active', type === 'bar');
  if (lineBtn) lineBtn.classList.toggle('active', type === 'line');

  if (type === 'bar') {
    if (barEl) barEl.classList.remove('hidden');
    if (lineCont) lineCont.classList.add('hidden');
  } else {
    if (barEl) barEl.classList.add('hidden');
    if (lineCont) lineCont.classList.remove('hidden');
  }

  renderEngagementCharts();
}

function changeChartDateRange(days) {
  currentChartDays = parseInt(days, 10) || 9;
  renderEngagementCharts();
  showToast(`Updated analytics view for last ${currentChartDays} days.`, 'info');
}

function renderEngagementCharts() {
  const data = MASTER_CHART_DATA.slice(-currentChartDays);
  renderBarChart(data);
  renderLineChart(data);
}

function renderBarChart(data) {
  const chart = document.getElementById('engagementChart');
  if (!chart) return;

  const max = Math.max(...data.flatMap(d => [d.opens, d.clicks]), 100);

  chart.innerHTML = data.map(d => `
    <div class="bar-group">
      <div class="bar-pair">
        <div class="chart-hover-tooltip">
          <strong>${escapeHtml(d.label)}</strong><br/>
          Opens: ${d.opens}%<br/>
          Clicks: ${d.clicks}%
        </div>
        <div class="bar" style="height:${(d.opens / max) * 140}px;background:#7c3aed" title="Opens: ${d.opens}%"></div>
        <div class="bar" style="height:${(d.clicks / max) * 140}px;background:#10b981" title="Clicks: ${d.clicks}%"></div>
      </div>
      <div class="bar-label">${escapeHtml(d.label)}</div>
    </div>
  `).join('');
}

function renderLineChart(data) {
  const svg = document.getElementById('engagementLineSvg');
  if (!svg) return;

  const width = 600;
  const height = 140;
  const paddingX = 40;
  const paddingY = 20;

  const max = Math.max(...data.flatMap(d => [d.opens, d.clicks]), 100);
  const stepX = (width - paddingX * 2) / (data.length - 1);

  const opensPoints = data.map((d, i) => ({
    x: paddingX + i * stepX,
    y: height - paddingY - (d.opens / max) * (height - paddingY * 2),
    val: d.opens,
    label: d.label
  }));

  const clicksPoints = data.map((d, i) => ({
    x: paddingX + i * stepX,
    y: height - paddingY - (d.clicks / max) * (height - paddingY * 2),
    val: d.clicks,
    label: d.label
  }));

  function makeSmoothPath(pts) {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }

  const opensPathStr = makeSmoothPath(opensPoints);
  const clicksPathStr = makeSmoothPath(clicksPoints);
  const areaPathStr = opensPathStr + ` L ${opensPoints[opensPoints.length - 1].x} ${height - paddingY} L ${opensPoints[0].x} ${height - paddingY} Z`;

  let inner = `
    <defs>
      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#7c3aed" stop-opacity="0.0"/>
      </linearGradient>
    </defs>
    <path d="${areaPathStr}" fill="url(#areaGrad)" />
    <path d="${opensPathStr}" class="line-chart-path" stroke="#7c3aed" />
    <path d="${clicksPathStr}" class="line-chart-path" stroke="#10b981" />
  `;

  // Draw Dots and Labels
  opensPoints.forEach(p => {
    inner += `<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#7c3aed" class="line-chart-dot"><title>${p.label} - Opens: ${p.val}%</title></circle>`;
  });
  clicksPoints.forEach(p => {
    inner += `<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#10b981" class="line-chart-dot"><title>${p.label} - Clicks: ${p.val}%</title></circle>`;
  });

  // X labels
  opensPoints.forEach((p, idx) => {
    if (data.length <= 10 || idx % 2 === 0) {
      inner += `<text x="${p.x}" y="${height}" text-anchor="middle" font-size="10" fill="var(--text-muted)">${p.label}</text>`;
    }
  });

  svg.innerHTML = inner;
}

const DONUT_DATA = [
  { label: 'Mobile',  pct: 48, color: '#7c3aed' },
  { label: 'Desktop', pct: 38, color: '#0ea5e9' },
  { label: 'Tablet',  pct: 14, color: '#10b981' },
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
        <span>${escapeHtml(d.label)}</span>
      </div>
      <span class="donut-pct">${d.pct}%</span>
    </div>
  `).join('');
}

// ──────────────────────────────────────────────────
// 7. REAL-TIME ACTIVITY STREAM
// ──────────────────────────────────────────────────
function renderActivityStream() {
  const list = document.getElementById('activityStreamList');
  if (!list) return;

  const leads = getLeads().slice(0, 4);
  const campaigns = getCampaigns().slice(0, 2);

  const activities = [];

  if (leads[0]) {
    activities.push({
      icon: '✨',
      text: `<strong>${escapeHtml(leads[0].firstName)} ${escapeHtml(leads[0].lastName)}</strong> joined the <strong>${escapeHtml(INTEREST_LABELS[leads[0].interest] || 'Marketing')}</strong> segment via Landing Page.`,
      time: '2m ago'
    });
  }

  if (campaigns[0] && campaigns[0].sent > 0) {
    activities.push({
      icon: '📨',
      text: `Campaign <strong>${escapeHtml(campaigns[0].name)}</strong> achieved <strong>${campaigns[0].opens}%</strong> open rate across ${campaigns[0].sent.toLocaleString()} recipients.`,
      time: '14m ago'
    });
  }

  if (leads[1]) {
    activities.push({
      icon: '🎯',
      text: `<strong>${escapeHtml(leads[1].firstName)} ${escapeHtml(leads[1].lastName)}</strong> triggered workflow condition: 'Opened Welcome Email'.`,
      time: '28m ago'
    });
  }

  activities.push({
    icon: '📊',
    text: `Weekly marketing cohort report generated and synced with internal data store.`,
    time: '45m ago'
  });

  list.innerHTML = activities.map(a => `
    <li class="activity-item">
      <span class="activity-icon">${a.icon}</span>
      <span class="activity-text">${a.text}</span>
      <span class="activity-time">${a.time}</span>
    </li>
  `).join('');
}

// ──────────────────────────────────────────────────
// 8. DASHBOARD CONTROLLER & VIEWS
// ──────────────────────────────────────────────────
function initDashboard() {
  updateDynamicKPIs();
  animateKPIs();
  renderEngagementCharts();
  renderDonut();
  renderDashboardActiveCampaigns();
  renderRecentLeads();
  renderActivityStream();
  renderCampaigns();
  renderLeadsTable();
  renderSegments();
  setDefaultCampaignDate();
}

function updateDynamicKPIs() {
  const leads = getLeads();
  const campaigns = getCampaigns();

  const totalLeads = 3240 + leads.length;
  let totalSent = 0;
  let totalOpens = 0;
  let totalClicks = 0;
  let sentCampaignsCount = 0;

  campaigns.forEach(c => {
    if (c.sent > 0) {
      totalSent += c.sent;
      totalOpens += c.opens;
      totalClicks += c.clicks;
      sentCampaignsCount++;
    }
  });

  const avgOpens = sentCampaignsCount > 0 ? Math.round(totalOpens / sentCampaignsCount) : 42;
  const avgClicks = sentCampaignsCount > 0 ? Math.round(totalClicks / sentCampaignsCount) : 18;

  const kpiTotalLeads  = document.getElementById('kpiTotalLeads');
  const kpiEmailsSent  = document.getElementById('kpiEmailsSent');
  const kpiOpenRate    = document.getElementById('kpiOpenRate');
  const kpiClickRate   = document.getElementById('kpiClickRate');

  if (kpiTotalLeads)  kpiTotalLeads.dataset.target = totalLeads;
  if (kpiEmailsSent)  kpiEmailsSent.dataset.target = totalSent > 0 ? totalSent : 18540;
  if (kpiOpenRate)    kpiOpenRate.dataset.target = avgOpens;
  if (kpiClickRate)   kpiClickRate.dataset.target = avgClicks;
}

function animateKPIs() {
  document.querySelectorAll('.kpi-value[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    if (el._timer) clearInterval(el._timer);

    const currentText = el.textContent.replace(/[^\d]/g, '');
    let current = currentText ? parseInt(currentText, 10) : 0;

    if (current === target) {
      el.textContent = target.toLocaleString() + suffix;
      return;
    }

    const duration = 500;
    const steps = duration / 16;
    const increment = (target - current) / steps;

    el._timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= target) || (increment < 0 && current <= target) || isNaN(current)) {
        current = target;
        clearInterval(el._timer);
        el._timer = null;
      }
      el.textContent = Math.round(current).toLocaleString() + suffix;
    }, 16);
  });
}

// ──────────────────────────────────────────────────
// 9. CAMPAIGNS SECTION (WITH STATUS TABS & PREVIEW)
// ──────────────────────────────────────────────────
let currentCampaignFilter = 'all';

function filterCampaignsByStatus(status, btnEl) {
  currentCampaignFilter = status;
  document.querySelectorAll('.form-tab-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderCampaigns();
}

function renderCampaigns() {
  const grid = document.getElementById('campaignsGrid');
  if (!grid) return;

  const allCampaigns = getCampaigns();
  const campaigns = allCampaigns.filter(c => currentCampaignFilter === 'all' || c.status === currentCampaignFilter);

  if (campaigns.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem 1.5rem;background:var(--surface);border:1px dashed var(--border);border-radius:var(--radius);color:var(--text-muted)">
        <p style="font-size:1.1rem;font-weight:700;color:var(--text);margin-bottom:0.4rem">No Campaigns Match '${currentCampaignFilter}'</p>
        <p style="font-size:0.875rem;margin-bottom:1.25rem">Create or update campaigns to see them listed here.</p>
        <button class="btn btn-primary btn-sm" onclick="openCampaignModal()">+ New Campaign</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = campaigns.map(c => `
    <div class="campaign-card">
      <div class="cc-header">
        <div class="cc-name">${escapeHtml(c.name)}</div>
        <span class="badge-status ${c.status}">${c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span>
      </div>
      <div class="cc-subject">${escapeHtml(c.subject)}</div>
      <div class="cc-meta">
        <span>📅 ${c.date}</span>
        <span>🏷️ ${escapeHtml(c.segment)}</span>
      </div>
      <div class="cc-stats">
        <div class="cc-stat"><div class="cc-stat-val">${c.sent ? c.sent.toLocaleString() : '0'}</div><div class="cc-stat-lbl">Sent</div></div>
        <div class="cc-stat"><div class="cc-stat-val">${c.opens ? c.opens + '%' : '0%'}</div><div class="cc-stat-lbl">Opens</div></div>
        <div class="cc-stat"><div class="cc-stat-val">${c.clicks ? c.clicks + '%' : '0%'}</div><div class="cc-stat-lbl">Clicks</div></div>
      </div>
      <div class="cc-actions">
        <button class="cc-action-btn" onclick="openEmailPreview('${c.id}')" title="Preview rendered email">
          👁️ Preview
        </button>
        <button class="cc-action-btn" onclick="toggleCampaignStatus('${c.id}')">
          ${c.status === 'active' ? '⏸️ Pause' : '▶️ Activate'}
        </button>
        <button class="cc-action-btn" onclick="simulateSendCampaign('${c.id}')" title="Send a simulated batch of emails">
          🚀 Send
        </button>
        <button class="cc-action-btn danger" onclick="deleteCampaign('${c.id}')" title="Delete campaign">
          🗑️
        </button>
      </div>
    </div>
  `).join('');
}

function renderDashboardActiveCampaigns() {
  const tbody = document.getElementById('dashboardActiveCampaignsBody');
  if (!tbody) return;

  const campaigns = getCampaigns();

  if (campaigns.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:1.75rem;color:var(--text-muted)">
          No campaigns found. Click "+ New Campaign" to create one.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = campaigns.map(c => `
    <tr>
      <td><strong>${escapeHtml(c.name)}</strong></td>
      <td><span class="badge-status ${c.status}">${c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span></td>
      <td>${c.sent > 0 ? c.sent.toLocaleString() : '—'}</td>
      <td>${c.opens > 0 ? c.opens + '%' : '—'}</td>
      <td>${c.clicks > 0 ? c.clicks + '%' : '—'}</td>
      <td style="text-align:right">
        <button class="table-action-btn" onclick="openEmailPreview('${c.id}')" title="Preview email">👁️</button>
        <button class="table-action-btn" onclick="toggleCampaignStatus('${c.id}')" title="${c.status === 'active' ? 'Pause' : 'Activate'}">
          ${c.status === 'active' ? '⏸️' : '▶️'}
        </button>
        <button class="table-action-btn danger" onclick="deleteCampaign('${c.id}')" title="Delete campaign">
          🗑️
        </button>
      </td>
    </tr>
  `).join('');
}

function renderRecentLeads() {
  const list = document.getElementById('recentLeadsList');
  if (!list) return;

  const leads = getLeads().slice(0, 6);

  if (leads.length === 0) {
    list.innerHTML = `
      <li style="text-align:center;padding:2rem 1rem;color:var(--text-muted);font-size:0.875rem">
        No leads recorded yet. Added contacts will appear here.
      </li>
    `;
    return;
  }

  list.innerHTML = leads.map((lead, i) => {
    const initials = ((lead.firstName?.[0] || 'L') + (lead.lastName?.[0] || 'D')).toUpperCase();
    const color    = LEAD_COLORS[i % LEAD_COLORS.length];
    const timeAgo  = relativeDate(lead.date);
    return `
      <li class="lead-item" onclick="openLeadDrawer('${lead.id}')" style="cursor:pointer">
        <div class="lead-avatar" style="background:${color}">${initials}</div>
        <div class="lead-info">
          <div class="lead-name">${escapeHtml(lead.firstName)} ${escapeHtml(lead.lastName)}</div>
          <div class="lead-email">${escapeHtml(lead.email)}</div>
        </div>
        <div style="display:flex;align-items:center;gap:0.6rem">
          <span class="lead-time">${timeAgo}</span>
          <button class="table-action-btn danger" onclick="event.stopPropagation(); deleteLead('${lead.id}')" title="Delete contact" style="padding:0.25rem 0.45rem">
            🗑️
          </button>
        </div>
      </li>
    `;
  }).join('');
}

function toggleCampaignStatus(id) {
  const campaigns = getCampaigns();
  const c = campaigns.find(item => item.id === id || item.name === id);
  if (!c) return;

  c.status = c.status === 'active' ? 'paused' : 'active';
  saveCampaigns(campaigns);
  renderCampaigns();
  renderDashboardActiveCampaigns();
  showToast(`Campaign '${c.name}' is now ${c.status}.`, 'info');
}

function simulateSendCampaign(id) {
  const campaigns = getCampaigns();
  const c = campaigns.find(item => item.id === id || item.name === id);
  if (!c) return;

  const batchSize = Math.floor(Math.random() * 300) + 150;
  c.sent = (c.sent || 0) + batchSize;
  c.opens = c.opens ? Math.min(85, c.opens + Math.floor(Math.random() * 3)) : 40;
  c.clicks = c.clicks ? Math.min(45, c.clicks + Math.floor(Math.random() * 2)) : 18;
  c.status = 'active';

  saveCampaigns(campaigns);
  renderCampaigns();
  renderDashboardActiveCampaigns();
  renderActivityStream();
  updateDynamicKPIs();
  animateKPIs();
  showToast(`Simulated dispatch of ${batchSize} emails for '${c.name}'!`);
}

function deleteCampaign(id) {
  const campaigns = getCampaigns();
  const c = campaigns.find(item => item.id === id || item.name === id);
  const name = c ? c.name : 'campaign';

  if (!confirm(`Are you sure you want to delete campaign "${name}"?`)) return;

  const updated = campaigns.filter(item => item.id !== id && item.name !== id);
  saveCampaigns(updated);
  renderCampaigns();
  renderDashboardActiveCampaigns();
  updateDynamicKPIs();
  animateKPIs();
  showToast(`Campaign deleted.`, 'info');
}

// Email Preview Modal
let previewActiveCampaignId = null;

function openEmailPreview(id) {
  const campaigns = getCampaigns();
  const c = campaigns.find(item => item.id === id);
  if (!c) return;

  previewActiveCampaignId = c.id;
  const modal = document.getElementById('emailPreviewModal');
  const title = document.getElementById('previewModalTitle');
  const content = document.getElementById('emailPreviewContent');

  if (title) title.textContent = `Preview: ${c.name}`;
  if (content) {
    content.innerHTML = `
      <div style="border-bottom:1px solid var(--border);padding-bottom:0.75rem;margin-bottom:0.85rem">
        <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem">
          <span style="color:var(--text-muted)">From:</span>
          <strong>Growth Marketing Team &lt;updates@mauticdemo.com&gt;</strong>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem">
          <span style="color:var(--text-muted)">To Segment:</span>
          <span class="badge" style="font-size:0.75rem">${escapeHtml(c.segment)}</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:var(--text-muted)">Subject:</span>
          <strong>${escapeHtml(c.subject)}</strong>
        </div>
      </div>
      <div style="background:var(--surface);padding:1.5rem;border-radius:var(--radius-sm);border:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem">
          <div class="logo-icon" style="width:28px;height:28px;font-size:0.8rem">✉</div>
          <strong>Mautic Newsletter</strong>
        </div>
        <p style="margin-bottom:1rem;color:var(--text)">Hi {{contact.firstname|default('there')}},</p>
        <p style="margin-bottom:1.25rem;line-height:1.5;color:var(--text)">${escapeHtml(c.body || 'Thank you for connecting with us! Here is our latest marketing update.')}</p>
        <div style="text-align:center;margin:1.5rem 0">
          <a href="#" onclick="return false;" class="btn btn-primary" style="padding:0.6rem 1.5rem">Explore Interactive Playbook →</a>
        </div>
        <div style="border-top:1px solid var(--border);padding-top:0.75rem;margin-top:1.25rem;font-size:0.75rem;color:var(--text-muted);text-align:center">
          You are receiving this because you subscribed via our Lead Capture Landing Page.<br/>
          <a href="#" onclick="return false;" style="text-decoration:underline;color:var(--primary-light)">Manage Preferences</a> · <a href="#" onclick="return false;" style="text-decoration:underline;color:var(--danger)">Unsubscribe</a>
        </div>
      </div>
    `;
  }

  if (modal) modal.classList.remove('hidden');
}

function closeEmailPreviewModal() {
  const modal = document.getElementById('emailPreviewModal');
  if (modal) modal.classList.add('hidden');
  previewActiveCampaignId = null;
}

function simulateSendFromPreview() {
  if (previewActiveCampaignId) {
    simulateSendCampaign(previewActiveCampaignId);
    closeEmailPreviewModal();
  }
}

// ──────────────────────────────────────────────────
// 10. LEADS SECTION: SORTING, BULK ACTIONS & DRAWER
// ──────────────────────────────────────────────────
let currentLeadSearch = '';
let currentLeadSegment = 'all';
let currentLeadStatus = 'all';
let leadSortCol = 'date';
let leadSortDir = 'desc';
let selectedLeadIds = new Set();

function sortLeadsTable(colKey) {
  if (leadSortCol === colKey) {
    leadSortDir = leadSortDir === 'asc' ? 'desc' : 'asc';
  } else {
    leadSortCol = colKey;
    leadSortDir = 'asc';
  }

  // Update sort indicators
  ['name', 'email', 'company', 'interest', 'date', 'status'].forEach(k => {
    const el = document.getElementById(`sort-${k}`);
    if (el) {
      if (k === leadSortCol) {
        el.textContent = leadSortDir === 'asc' ? '↑' : '↓';
      } else {
        el.textContent = '↕';
      }
    }
  });

  applyLeadFilters();
}

function renderLeadsTable() {
  applyLeadFilters();
}

function applyLeadFilters() {
  const searchInput  = document.getElementById('leadSearch');
  const segmentInput = document.getElementById('leadSegmentFilter');
  const statusInput  = document.getElementById('leadStatusFilter');

  currentLeadSearch  = searchInput ? searchInput.value.toLowerCase().trim() : '';
  currentLeadSegment = segmentInput ? segmentInput.value : 'all';
  currentLeadStatus  = statusInput ? statusInput.value : 'all';

  const allLeads = getLeads();

  let filtered = allLeads.filter(lead => {
    const matchesSearch = !currentLeadSearch ||
      `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.company}`.toLowerCase().includes(currentLeadSearch);

    const matchesSegment = currentLeadSegment === 'all' || lead.interest === currentLeadSegment;
    const matchesStatus  = currentLeadStatus === 'all' || lead.status === currentLeadStatus;

    return matchesSearch && matchesSegment && matchesStatus;
  });

  // Sort
  filtered.sort((a, b) => {
    let valA = '';
    let valB = '';

    if (leadSortCol === 'name') {
      valA = `${a.firstName} ${a.lastName}`.toLowerCase();
      valB = `${b.firstName} ${b.lastName}`.toLowerCase();
    } else if (leadSortCol === 'email') {
      valA = (a.email || '').toLowerCase();
      valB = (b.email || '').toLowerCase();
    } else if (leadSortCol === 'company') {
      valA = (a.company || '').toLowerCase();
      valB = (b.company || '').toLowerCase();
    } else if (leadSortCol === 'interest') {
      valA = (a.interest || '').toLowerCase();
      valB = (b.interest || '').toLowerCase();
    } else if (leadSortCol === 'date') {
      valA = a.date || '';
      valB = b.date || '';
    } else if (leadSortCol === 'status') {
      valA = a.status || '';
      valB = b.status || '';
    }

    if (valA < valB) return leadSortDir === 'asc' ? -1 : 1;
    if (valA > valB) return leadSortDir === 'asc' ? 1 : -1;
    return 0;
  });

  populateLeadsTable(filtered, allLeads.length);
  updateBulkActionsBar();
}

function populateLeadsTable(leads, totalCount) {
  const tbody = document.getElementById('leadsTableBody');
  const countSummary = document.getElementById('leadsCountSummary');
  if (countSummary) {
    countSummary.textContent = `Showing ${leads.length} of ${totalCount} recorded contacts`;
  }

  if (!tbody) return;

  if (leads.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;padding:2.5rem;color:var(--text-muted)">
          No contacts match your filter criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = leads.map((lead, i) => {
    const initials = ((lead.firstName?.[0] || 'L') + (lead.lastName?.[0] || 'D')).toUpperCase();
    const color    = LEAD_COLORS[i % LEAD_COLORS.length];
    const segmentLabel = INTEREST_LABELS[lead.interest] || lead.interest || '—';
    const isChecked = selectedLeadIds.has(lead.id);

    return `
      <tr>
        <td style="text-align:center">
          <input type="checkbox" class="lead-select-chk" ${isChecked ? 'checked' : ''} onchange="toggleSelectLead('${lead.id}', this.checked)" />
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:0.6rem;cursor:pointer" onclick="openLeadDrawer('${lead.id}')">
            <div class="lead-avatar" style="background:${color};width:28px;height:28px;font-size:0.65rem">${initials}</div>
            <strong style="color:var(--text);text-decoration:none">${escapeHtml(lead.firstName)} ${escapeHtml(lead.lastName)}</strong>
          </div>
        </td>
        <td><a href="mailto:${escapeHtml(lead.email)}" style="color:var(--text);text-decoration:underline">${escapeHtml(lead.email)}</a></td>
        <td>${escapeHtml(lead.company || '—')}</td>
        <td><span class="badge" style="font-size:0.75rem;padding:0.2rem 0.55rem">${escapeHtml(segmentLabel)}</span></td>
        <td>${lead.date}</td>
        <td>
          <span class="badge-status ${lead.status === 'subscribed' ? 'active' : 'paused'}" 
                style="cursor:pointer" 
                onclick="toggleLeadStatus('${lead.id}')" 
                title="Click to toggle status">
            ${lead.status}
          </span>
        </td>
        <td style="text-align:right">
          <button class="table-action-btn" onclick="openLeadDrawer('${lead.id}')" title="View Intelligence Profile">👤</button>
          <button class="table-action-btn danger" onclick="deleteLead('${lead.id}')" title="Delete contact">
            🗑️
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Bulk Selection
function toggleSelectLead(id, isChecked) {
  if (isChecked) {
    selectedLeadIds.add(id);
  } else {
    selectedLeadIds.delete(id);
  }
  updateBulkActionsBar();
}

function toggleSelectAllLeads(isChecked) {
  const allLeads = getLeads();
  if (isChecked) {
    allLeads.forEach(l => selectedLeadIds.add(l.id));
  } else {
    selectedLeadIds.clear();
  }
  renderLeadsTable();
  updateBulkActionsBar();
}

function deselectAllLeads() {
  selectedLeadIds.clear();
  const master = document.getElementById('selectAllCheckbox');
  if (master) master.checked = false;
  renderLeadsTable();
  updateBulkActionsBar();
}

function updateBulkActionsBar() {
  const bar = document.getElementById('bulkActionsBar');
  const countEl = document.getElementById('bulkSelectedCount');
  const master = document.getElementById('selectAllCheckbox');

  if (!bar) return;

  const count = selectedLeadIds.size;
  if (count > 0) {
    bar.classList.remove('hidden');
    if (countEl) countEl.textContent = count;
  } else {
    bar.classList.add('hidden');
    if (master) master.checked = false;
  }
}

function bulkSetStatus(newStatus) {
  if (selectedLeadIds.size === 0) return;
  const leads = getLeads();
  let updatedCount = 0;

  leads.forEach(l => {
    if (selectedLeadIds.has(l.id)) {
      l.status = newStatus;
      updatedCount++;
    }
  });

  saveLeads(leads);
  applyLeadFilters();
  renderSegments();
  deselectAllLeads();
  showToast(`Updated ${updatedCount} contacts to '${newStatus}'.`, 'info');
}

function bulkExportCSV() {
  const leads = getLeads().filter(l => selectedLeadIds.has(l.id));
  if (leads.length === 0) return;

  downloadCsvForLeads(leads, `mautic-selected-${leads.length}-contacts.csv`);
  showToast(`Exported ${leads.length} selected contacts to CSV!`);
}

function bulkDeleteLeads() {
  if (selectedLeadIds.size === 0) return;
  if (!confirm(`Are you sure you want to delete ${selectedLeadIds.size} selected contacts?`)) return;

  let leads = getLeads();
  const initial = leads.length;
  leads = leads.filter(l => !selectedLeadIds.has(l.id));
  const removed = initial - leads.length;

  saveLeads(leads);
  deselectAllLeads();
  applyLeadFilters();
  renderRecentLeads();
  renderSegments();
  updateDynamicKPIs();
  animateKPIs();
  showToast(`Removed ${removed} contacts.`);
}

function toggleLeadStatus(id) {
  const leads = getLeads();
  const target = leads.find(l => l.id === id || l.email === id);
  if (!target) return;

  target.status = target.status === 'subscribed' ? 'unsubscribed' : 'subscribed';
  saveLeads(leads);
  applyLeadFilters();
  renderSegments();
  showToast(`Updated status for ${target.firstName} to ${target.status}.`, 'info');
}

function deleteLead(id) {
  const leads = getLeads();
  const target = leads.find(l => l.id === id || l.email === id);
  const name = target ? `${target.firstName} ${target.lastName}` : 'contact';

  if (!confirm(`Delete contact ${name}?`)) return;

  const updated = leads.filter(l => l.id !== id && l.email !== id);
  saveLeads(updated);
  selectedLeadIds.delete(id);
  applyLeadFilters();
  renderRecentLeads();
  renderSegments();
  updateDynamicKPIs();
  animateKPIs();
  showToast(`Contact removed.`, 'info');
}

function resetDefaultLeads() {
  if (!confirm('Reset contacts to default sample data? Any added contacts will be cleared.')) return;
  selectedLeadIds.clear();
  saveLeads([...SEED_LEADS]);
  applyLeadFilters();
  renderRecentLeads();
  renderSegments();
  updateDynamicKPIs();
  animateKPIs();
  showToast('Reset contacts to sample seed data.');
}

// Contact Intelligence Slide-Over Drawer
function openLeadDrawer(id) {
  const leads = getLeads();
  const lead = leads.find(l => l.id === id);
  if (!lead) return;

  const drawer = document.getElementById('leadDetailDrawer');
  const body = document.getElementById('leadDrawerBody');
  if (!drawer || !body) return;

  const initials = ((lead.firstName?.[0] || 'L') + (lead.lastName?.[0] || 'D')).toUpperCase();
  const segmentTitle = INTEREST_LABELS[lead.interest] || lead.interest;
  const leadScore = lead.status === 'subscribed' ? 88 : 42;

  body.innerHTML = `
    <div class="contact-hero-card">
      <div class="contact-hero-avatar">${initials}</div>
      <div>
        <div class="contact-hero-name">${escapeHtml(lead.firstName)} ${escapeHtml(lead.lastName)}</div>
        <div class="contact-hero-email">${escapeHtml(lead.email)}</div>
        <div class="lead-score-pill">🎯 Intent Score: ${leadScore}/100</div>
      </div>
    </div>

    <div>
      <h4 style="font-size:0.85rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.75rem;letter-spacing:0.04em">Profile Attributes</h4>
      <div class="lead-summary-box" style="margin:0">
        <div class="lead-summary-row">
          <span class="lead-summary-label">Company:</span>
          <span class="lead-summary-val">${escapeHtml(lead.company || 'Not Specified')}</span>
        </div>
        <div class="lead-summary-row">
          <span class="lead-summary-label">Segment:</span>
          <span class="lead-summary-val"><span class="badge" style="font-size:0.75rem">${escapeHtml(segmentTitle)}</span></span>
        </div>
        <div class="lead-summary-row">
          <span class="lead-summary-label">Registration Date:</span>
          <span class="lead-summary-val">${lead.date}</span>
        </div>
        <div class="lead-summary-row">
          <span class="lead-summary-label">Subscription Status:</span>
          <span class="badge-status ${lead.status === 'subscribed' ? 'active' : 'paused'}">${lead.status}</span>
        </div>
      </div>
    </div>

    <div>
      <h4 style="font-size:0.85rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.75rem;letter-spacing:0.04em">Customer Journey Timeline</h4>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-dot" style="border-color:var(--success)"></div>
          <div class="timeline-content">
            <div class="timeline-title">Form Submission Verified</div>
            <div class="timeline-time">${lead.date} · Landing Page Signup Form</div>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot" style="border-color:var(--accent)"></div>
          <div class="timeline-content">
            <div class="timeline-title">Assigned to Segment: ${escapeHtml(segmentTitle)}</div>
            <div class="timeline-time">Auto-tagged based on user selected interest</div>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot" style="border-color:var(--primary)"></div>
          <div class="timeline-content">
            <div class="timeline-title">Enrolled in 'Welcome Drip Series'</div>
            <div class="timeline-time">Email 1: Welcome Playbook sent successfully</div>
          </div>
        </div>
        ${lead.status === 'subscribed' ? `
          <div class="timeline-item">
            <div class="timeline-dot" style="border-color:var(--warning)"></div>
            <div class="timeline-content">
              <div class="timeline-title">Email Interaction Recorded</div>
              <div class="timeline-time">Opened 'Welcome Series' &amp; clicked documentation link</div>
            </div>
          </div>
        ` : ''}
      </div>
    </div>

    <div style="display:flex;gap:0.75rem;margin-top:auto">
      <button class="btn btn-outline btn-full" onclick="toggleLeadStatus('${lead.id}'); openLeadDrawer('${lead.id}')">
        ${lead.status === 'subscribed' ? '🚫 Unsubscribe' : '✉️ Resubscribe'}
      </button>
      <button class="btn btn-primary btn-full" onclick="showToast('Enrolled ${escapeHtml(lead.firstName)} into targeted nurture drip!')">
        ⚡ Trigger Workflow
      </button>
    </div>
  `;

  drawer.classList.remove('hidden');
}

function closeLeadDrawer() {
  const drawer = document.getElementById('leadDetailDrawer');
  if (drawer) drawer.classList.add('hidden');
}

function handleDrawerOverlayClick(e) {
  if (e.target && e.target.id === 'leadDetailDrawer') {
    closeLeadDrawer();
  }
}

// ──────────────────────────────────────────────────
// 11. AUTOMATIONS RUNNER SIMULATOR
// ──────────────────────────────────────────────────
function simulateWorkflowRun(cardId, stepIds) {
  const card = document.getElementById(cardId);
  if (!card) return;

  stepIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active-sim');
  });

  card.classList.add('highlighted');
  let currentStep = 0;

  function runNext() {
    if (currentStep < stepIds.length) {
      const el = document.getElementById(stepIds[currentStep]);
      if (el) el.classList.add('active-sim');
      currentStep++;
      setTimeout(runNext, 450);
    } else {
      setTimeout(() => {
        stepIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.classList.remove('active-sim');
        });
        card.classList.remove('highlighted');
        runConfettiAnimation();
        showToast('Workflow execution simulated successfully! All condition steps passed.');
      }, 700);
    }
  }

  runNext();
}

// ──────────────────────────────────────────────────
// 12. CSV EXPORT UTILITY
// ──────────────────────────────────────────────────
function exportLeadsCSV() {
  const leads = getLeads();
  if (leads.length === 0) {
    showToast('No leads available to export.', 'warning');
    return;
  }
  downloadCsvForLeads(leads, `mautic-leads-${new Date().toISOString().slice(0, 10)}.csv`);
  showToast(`Exported all ${leads.length} contacts to CSV!`);
}

function downloadCsvForLeads(leads, filename) {
  const headers = ['First Name', 'Last Name', 'Email', 'Company', 'Segment', 'Date Added', 'Status'];
  const rows = leads.map(l => [
    `"${(l.firstName || '').replace(/"/g, '""')}"`,
    `"${(l.lastName || '').replace(/"/g, '""')}"`,
    `"${(l.email || '').replace(/"/g, '""')}"`,
    `"${(l.company || '').replace(/"/g, '""')}"`,
    `"${(INTEREST_LABELS[l.interest] || l.interest || '').replace(/"/g, '""')}"`,
    `"${l.date || ''}"`,
    `"${l.status || ''}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ──────────────────────────────────────────────────
// 13. SEGMENTS SECTION
// ──────────────────────────────────────────────────
function renderSegments() {
  const container = document.getElementById('segmentsGrid');
  if (!container) return;

  const leads = getLeads();
  const total = leads.length || 1;

  const counts = {
    'email-marketing': { count: 0, color: '#7c3aed', icon: '✉️', desc: 'Leads interested in email marketing best practices, deliverability, and copywriting.' },
    'lead-gen':        { count: 0, color: '#0ea5e9', icon: '🎯', desc: 'Prospects focused on inbound funnels, landing page conversion, and audience capture.' },
    'automation':      { count: 0, color: '#10b981', icon: '🔄', desc: 'Users building multi-branch automated workflows and drip nurturing sequences.' },
    'analytics':       { count: 0, color: '#f59e0b', icon: '📊', desc: 'Marketers tracking campaign ROI, open/click heatmaps, and funnel analytics.' },
  };

  leads.forEach(l => {
    const key = l.interest || 'email-marketing';
    if (counts[key]) {
      counts[key].count++;
    } else {
      counts['email-marketing'].count++;
    }
  });

  container.innerHTML = Object.entries(counts).map(([key, data]) => {
    const title = INTEREST_LABELS[key] || key;
    const baseOffset = key === 'lead-gen' ? 1120 : (key === 'email-marketing' ? 840 : (key === 'automation' ? 690 : 590));
    const displayCount = baseOffset + data.count;
    const pct = Math.round((data.count / total) * 100);

    return `
      <div class="segment-card">
        <div class="segment-header" style="--seg-color:${data.color}">
          <span class="segment-icon">${data.icon}</span>
          <strong>${escapeHtml(title)}</strong>
        </div>
        <p>${escapeHtml(data.desc)}</p>
        <div class="segment-bar-wrap">
          <div class="segment-bar-fill" style="width:${Math.max(15, pct)}%;background:${data.color}"></div>
        </div>
        <div class="segment-footer">
          <div class="segment-count"><strong>${displayCount.toLocaleString()}</strong> contacts</div>
          <span>${pct}% of recent leads</span>
        </div>
      </div>
    `;
  }).join('');
}

// ──────────────────────────────────────────────────
// 14. FORMS SECTION & EMBED GENERATOR
// ──────────────────────────────────────────────────
function updateDynamicEmbed() {
  const hostInput = document.getElementById('embedHostUrl');
  const idInput   = document.getElementById('embedFormId');
  const codeBox   = document.getElementById('dynamicEmbedCodeDisplay');

  if (!codeBox) return;
  const host = hostInput ? (hostInput.value.trim().replace(/\/$/, '') || 'https://marketing.example.com') : 'https://marketing.example.com';
  const id   = idInput ? (idInput.value.trim() || '1') : '1';

  const snippet = `<script type="text/javascript" src="${host}/form/generate.js?id=${id}"></script>`;
  codeBox.textContent = snippet;
}

function copyDynamicEmbed() {
  const codeBox = document.getElementById('dynamicEmbedCodeDisplay');
  if (!codeBox) return;
  navigator.clipboard.writeText(codeBox.textContent)
    .then(() => showToast('Embed snippet copied to clipboard!'))
    .catch(() => showToast('Failed to copy', 'error'));
}

function copySnippetText(snippet) {
  navigator.clipboard.writeText(snippet)
    .then(() => showToast('Embed code copied!'))
    .catch(() => showToast('Failed to copy', 'error'));
}

// ──────────────────────────────────────────────────
// 15. MODALS MANAGEMENT
// ──────────────────────────────────────────────────
function openCampaignModal() {
  const modal = document.getElementById('campaignModal');
  if (modal) modal.classList.remove('hidden');
  setDefaultCampaignDate();
  const firstInput = document.getElementById('campaignName');
  if (firstInput) setTimeout(() => firstInput.focus(), 50);
}

function closeCampaignModal() {
  const modal = document.getElementById('campaignModal');
  if (modal) modal.classList.add('hidden');
  const form = document.getElementById('campaignForm');
  if (form) form.reset();
  setDefaultCampaignDate();
}

function saveCampaign(e) {
  e.preventDefault();
  const nameInput    = document.getElementById('campaignName');
  const subjectInput = document.getElementById('campaignSubject');
  const segmentInput = document.getElementById('campaignSegment');
  const dateInput    = document.getElementById('campaignDate');
  const bodyInput    = document.getElementById('campaignBody');

  if (!nameInput || !subjectInput) return;

  const campaigns = getCampaigns();
  const newCampaign = {
    id: 'camp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: nameInput.value.trim(),
    subject: subjectInput.value.trim(),
    segment: segmentInput.options[segmentInput.selectedIndex].text,
    date: dateInput.value || new Date().toISOString().slice(0, 10),
    status: 'draft',
    sent: 0,
    opens: 0,
    clicks: 0,
    body: bodyInput ? bodyInput.value.trim() : ''
  };

  campaigns.unshift(newCampaign);
  saveCampaigns(campaigns);
  closeCampaignModal();
  renderCampaigns();
  renderDashboardActiveCampaigns();
  updateDynamicKPIs();
  animateKPIs();
  showToast(`Campaign '${newCampaign.name}' created as Draft!`);
}

function setDefaultCampaignDate() {
  const dateInput = document.getElementById('campaignDate');
  if (dateInput) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }
}

function openLeadModal() {
  const modal = document.getElementById('leadModal');
  if (modal) modal.classList.remove('hidden');
  const firstInput = document.getElementById('manualFirstName');
  if (firstInput) setTimeout(() => firstInput.focus(), 50);
}

function closeLeadModal() {
  const modal = document.getElementById('leadModal');
  if (modal) modal.classList.add('hidden');
  const form = document.getElementById('addLeadForm');
  if (form) form.reset();
}

function saveManualLead(e) {
  e.preventDefault();
  const firstName = document.getElementById('manualFirstName').value.trim();
  const lastName  = document.getElementById('manualLastName').value.trim();
  const email     = document.getElementById('manualEmail').value.trim();
  const company   = document.getElementById('manualCompany').value.trim() || '—';
  const interest  = document.getElementById('manualInterest').value || 'email-marketing';
  const status    = document.getElementById('manualStatus').value || 'subscribed';

  if (!firstName || !lastName || !email) {
    showToast('Please fill in First Name, Last Name, and Email.', 'warning');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address.', 'warning');
    return;
  }

  const leads = getLeads();
  const newLead = {
    id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    firstName,
    lastName,
    email,
    company,
    interest,
    date: new Date().toISOString().slice(0, 10),
    status
  };
  leads.unshift(newLead);
  saveLeads(leads);
  closeLeadModal();

  // Reset search filter so newly added lead is immediately visible
  const searchInput = document.getElementById('leadSearch');
  if (searchInput) searchInput.value = '';
  currentLeadSearch = '';

  const segmentInput = document.getElementById('leadSegmentFilter');
  if (segmentInput && segmentInput.value !== 'all' && segmentInput.value !== interest) {
    segmentInput.value = 'all';
    currentLeadSegment = 'all';
  }

  const statusInput = document.getElementById('leadStatusFilter');
  if (statusInput && statusInput.value !== 'all' && statusInput.value !== status) {
    statusInput.value = 'all';
    currentLeadStatus = 'all';
  }

  applyLeadFilters();
  renderRecentLeads();
  renderActivityStream();
  renderSegments();
  updateDynamicKPIs();
  animateKPIs();
  showToast(`Added contact ${firstName} ${lastName}!`);
}

// ──────────────────────────────────────────────────
// 16. SECTION NAVIGATION & SIDEBAR
// ──────────────────────────────────────────────────
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const section = document.getElementById(`section-${name}`);
  if (section) section.classList.add('active');

  const navItem = document.getElementById(`nav-${name}`);
  if (navItem) navItem.classList.add('active');

  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) {
    pageTitle.textContent = name.charAt(0).toUpperCase() + name.slice(1);
  }

  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

function relativeDate(dateStr) {
  if (!dateStr) return 'Just now';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (isNaN(diff) || diff < 0 || diff === 0) return 'Today';
  if (diff === 1) return '1d ago';
  return `${diff}d ago`;
}

// Global Modal Backdrop & Keyboard Event Listeners
document.addEventListener('click', e => {
  const campaignModal = document.getElementById('campaignModal');
  const leadModal     = document.getElementById('leadModal');
  const previewModal  = document.getElementById('emailPreviewModal');

  if (campaignModal && e.target === campaignModal) closeCampaignModal();
  if (leadModal && e.target === leadModal) closeLeadModal();
  if (previewModal && e.target === previewModal) closeEmailPreviewModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeCampaignModal();
    closeLeadModal();
    closeLeadDrawer();
    closeEmailPreviewModal();
  }
});

// ──────────────────────────────────────────────────
// 17. CROSS-TAB LIVE SYNCHRONIZATION
// ──────────────────────────────────────────────────
window.addEventListener('storage', e => {
  if (e.key === 'mautic_leads' || e.key === 'mautic_campaigns') {
    if (document.body.classList.contains('dashboard-page')) {
      updateDynamicKPIs();
      animateKPIs();
      renderDashboardActiveCampaigns();
      renderRecentLeads();
      renderActivityStream();
      renderCampaigns();
      applyLeadFilters();
      renderSegments();
    }
    const heroStatLeads = document.getElementById('heroStatsLeads');
    if (heroStatLeads) {
      heroStatLeads.textContent = (3240 + getLeads().length).toLocaleString() + '+';
    }
  }
});

// ──────────────────────────────────────────────────
// 18. INITIALIZATION ON DOM READY
// ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  if (document.body.classList.contains('landing-page')) {
    initLandingPage();
  }
  if (document.body.classList.contains('dashboard-page')) {
    initDashboard();
  }
});

if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initTheme();
  if (document.body.classList.contains('landing-page')) {
    initLandingPage();
  }
  if (document.body.classList.contains('dashboard-page')) {
    initDashboard();
  }
}
