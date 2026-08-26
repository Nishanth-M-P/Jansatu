/**
 * JanSetu AI - Core Application Controller
 */

// Global State
const AppState = {
  currentLang: 'en',
  currentView: 'home', // 'home' | 'dashboard' | 'report' | 'authority'
  issues: [],
  selectedIssueId: 'JS-2026-00421',
  mapInstance: null,
  mapMarkers: [],
  mapFilter: 'all',
  currentReportStep: 1,
  recordingVoice: false,
  voiceInterval: null,
  activeConstituency: null,
  currentDraftAnalysis: { ...PRESET_ANALYSES.garbage }
};

// Initialize State from LocalStorage or Data
function initIssuesData() {
  const saved = localStorage.getItem('jansetu_issues');
  if (saved) {
    try {
      AppState.issues = JSON.parse(saved);
    } catch (e) {
      AppState.issues = [...INITIAL_ISSUES];
    }
  } else {
    AppState.issues = [...INITIAL_ISSUES];
    saveIssuesToStorage();
  }
}

function saveIssuesToStorage() {
  localStorage.setItem('jansetu_issues', JSON.stringify(AppState.issues));
}

function saveIssuesData() {
  saveIssuesToStorage();
}

// Toast Notifications
function showToast(title, message = '', type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-[#006c49] text-white' : 
                  type === 'error' ? 'bg-[#ba1a1a] text-white' : 
                  type === 'warning' ? 'bg-[#ef9900] text-white' : 
                  'bg-[#00236f] text-white';

  toast.className = `toast flex items-start gap-3 p-4 rounded-xl shadow-xl max-w-sm ${bgClass} text-sm z-50`;
  
  const icon = type === 'success' ? 'check_circle' : 
               type === 'error' ? 'error' : 
               type === 'warning' ? 'warning' : 'info';

  toast.innerHTML = `
    <span class="material-symbols-outlined text-[20px] shrink-0">${icon}</span>
    <div class="flex-1">
      <div class="font-bold">${title}</div>
      ${message ? `<div class="opacity-90 text-xs mt-0.5 leading-relaxed">${message}</div>` : ''}
    </div>
    <button class="opacity-70 hover:opacity-100 text-white ml-2" onclick="this.parentElement.remove()">
      <span class="material-symbols-outlined text-[16px]">close</span>
    </button>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 20);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

// Navigation & View Routing
function switchView(viewName) {
  if (viewName === 'authority' && !AppState.isAuthorityAuthenticated) {
    openAuthorityAuthModal();
    return;
  }

  AppState.currentView = viewName;
  window.location.hash = viewName;

  document.querySelectorAll('[data-view]').forEach(el => {
    if (el.getAttribute('data-view') === viewName) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  // Update nav link active states
  document.querySelectorAll('.nav-link').forEach(link => {
    const target = link.getAttribute('data-nav-target');
    if (target === viewName) {
      link.classList.add('nav-link-active');
      link.classList.remove('text-on-surface-variant');
    } else {
      link.classList.remove('nav-link-active');
      link.classList.add('text-on-surface-variant');
    }
  });

  // View specific setups
  if (viewName === 'home') {
    renderHumanRightsMarquee();
  } else if (viewName === 'dashboard') {
    setTimeout(() => initDashboardView(), 100);
  } else if (viewName === 'authority') {
    renderAuthorityPortal();
  } else if (viewName === 'report') {
    setReportStep(1);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// Language Switcher & Global Translation Engine
function initLanguage() {
  const savedLang = localStorage.getItem('jansetu_lang') || 'en';
  AppState.currentLang = savedLang;
  applyLanguageUI();
}

function toggleLanguage() {
  AppState.currentLang = AppState.currentLang === 'en' ? 'kn' : 'en';
  localStorage.setItem('jansetu_lang', AppState.currentLang);
  applyLanguageUI();
  showToast(AppState.currentLang === 'en' ? 'Language switched to English' : 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ', '', 'info');
}

function applyLanguageUI() {
  const langKey = AppState.currentLang || 'en';
  const t = I18N[langKey] || I18N.en;
  document.documentElement.lang = langKey;

  // Translate all text elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.innerText = t[key];
    }
  });

  // Translate placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key]) {
      el.placeholder = t[key];
    }
  });

  // Update navbar language button
  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.innerHTML = `
      <span class="material-symbols-outlined text-[16px] text-primary">translate</span>
      <span class="whitespace-nowrap font-bold">${langKey === 'en' ? 'English / ಕನ್ನಡ' : 'ಕನ್ನಡ / English'}</span>
    `;
  }

  // Re-render language-sensitive components
  renderHumanRightsMarquee();
  updateAuthUI();
  if (document.getElementById('public-issues-grid')) {
    renderPublicIssuesList();
  }
}


// ==========================================
// REPORT A PROBLEM (AI WORKFLOW) ENGINE
// ==========================================

function setReportStep(step) {
  AppState.currentReportStep = step;
  
  // Update Stepper UI
  const progressEl = document.getElementById('stepper-progress-bar');
  if (progressEl) {
    progressEl.style.width = `${((step - 1) / 3) * 100}%`;
  }

  for (let i = 1; i <= 4; i++) {
    const circle = document.getElementById(`step-circle-${i}`);
    const label = document.getElementById(`step-label-${i}`);
    if (circle && label) {
      if (i < step) {
        circle.className = 'w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-label-sm text-label-sm font-bold border-2 border-surface shadow-sm';
        circle.innerHTML = '<span class="material-symbols-outlined text-[16px]">check</span>';
        label.className = 'font-label-sm text-label-sm text-secondary font-bold';
      } else if (i === step) {
        circle.className = 'w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold border-2 border-surface ring-4 ring-primary/20 shadow-sm';
        circle.innerHTML = `${i}`;
        label.className = 'font-label-sm text-label-sm text-primary font-bold';
      } else {
        circle.className = 'w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-label-sm text-label-sm border-2 border-surface';
        circle.innerHTML = `${i}`;
        label.className = 'font-label-sm text-label-sm text-on-surface-variant';
      }
    }
  }

  // Toggle step panels
  for (let i = 1; i <= 4; i++) {
    const panel = document.getElementById(`report-step-${i}-panel`);
    if (panel) {
      if (i === step) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    }
  }

  // Populate review step if step 3
  if (step === 3) {
    populateReportReview();
  }
}

function runAIVisionScan(presetKey = 'garbage', customImageUrl = null) {
  const analysis = PRESET_ANALYSES[presetKey] || PRESET_ANALYSES.garbage;
  AppState.currentDraftAnalysis = { ...analysis };

  if (customImageUrl) {
    AppState.currentDraftAnalysis.image = customImageUrl;
  }

  const imgPreview = document.getElementById('ai-preview-img');
  const scanLaser = document.getElementById('ai-scan-laser');
  const statusPill = document.getElementById('ai-status-pill');
  const catEl = document.getElementById('ai-cat-val');
  const sevEl = document.getElementById('ai-sev-val');
  const authEl = document.getElementById('ai-auth-val');
  const actionEl = document.getElementById('ai-action-val');
  const objEl = document.getElementById('ai-obj-val');
  const draftBox = document.getElementById('ai-draft-box');
  const descText = document.getElementById('issue-description');
  const locInput = document.getElementById('report-loc-input');

  if (imgPreview) {
    imgPreview.src = AppState.currentDraftAnalysis.image;
  }

  // Trigger Scanning State
  if (scanLaser) scanLaser.classList.remove('hidden');
  if (statusPill) {
    statusPill.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-primary animate-ping"></span>
      <span class="font-label-sm text-label-sm text-primary font-bold">Analyzing...</span>
    `;
    statusPill.className = 'px-3 py-1 bg-primary/10 rounded-full flex items-center gap-xs border border-primary/20 animate-pulse';
  }

  // Animate AI results arrival
  setTimeout(() => {
    if (scanLaser) scanLaser.classList.add('hidden');
    if (statusPill) {
      statusPill.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-secondary"></span>
        <span class="font-label-sm text-label-sm text-secondary font-bold">✓ Analysis Complete</span>
      `;
      statusPill.className = 'px-3 py-1 bg-secondary/10 rounded-full flex items-center gap-xs border border-secondary/20';
    }

    if (catEl) catEl.innerText = AppState.currentDraftAnalysis.category;
    if (sevEl) {
      sevEl.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full ${analysis.severity === 'High' ? 'bg-error' : 'bg-amber-500'}"></span>
        <span class="font-label-md text-label-md font-bold ${analysis.severity === 'High' ? 'text-error' : 'text-amber-600'}">${analysis.severity} Priority</span>
      `;
    }

    const whyPrioEl = document.getElementById('ai-why-prio');
    if (whyPrioEl) {
      const whyMap = {
        garbage: 'Health hazard + school vicinity + waste accumulation',
        pothole: 'High traffic zone + skidding hazard + two-wheeler safety',
        water: 'Potable water loss + sidewalk flooding + residential zone',
        streetlight: 'Multiple unlit fixtures + night safety + commercial corridor'
      };
      const explanation = whyMap[presetKey] || 'Calculated based on hazard severity and public impact';
      whyPrioEl.setAttribute('title', explanation);
      whyPrioEl.innerText = analysis.severity === 'High' ? 'Why High?' : 'Why Medium?';
    }

    if (authEl) authEl.innerText = AppState.currentDraftAnalysis.recommendedAuthority || 'MCC Field Operations';
    if (actionEl) actionEl.innerText = AppState.currentDraftAnalysis.suggestedAction || 'Inspection and triage dispatch';
    if (objEl) objEl.innerText = AppState.currentDraftAnalysis.objects;
    if (draftBox) draftBox.innerText = `"${AppState.currentDraftAnalysis.draft}"`;
    if (descText) descText.value = AppState.currentDraftAnalysis.draft;
    if (locInput && AppState.currentDraftAnalysis.location) locInput.value = AppState.currentDraftAnalysis.location;

    showToast('AI Vision Analysis Complete', `Detected ${AppState.currentDraftAnalysis.category} • Severity: ${AppState.currentDraftAnalysis.severity}`, 'success');
  }, 900);
}

function triggerVoiceRecording() {
  const btn = document.getElementById('voice-record-btn');
  const visualizer = document.getElementById('voice-visualizer');
  const transcriptNote = document.getElementById('voice-transcription-note');
  const descText = document.getElementById('issue-description');

  if (!AppState.recordingVoice) {
    // Start Recording
    AppState.recordingVoice = true;
    if (btn) {
      btn.classList.add('border-error', 'bg-error/5', 'text-error');
      btn.querySelector('span.material-symbols-outlined').innerText = 'stop_circle';
      btn.querySelector('span.material-symbols-outlined').classList.add('animate-pulse');
      btn.querySelector('.voice-btn-text').innerText = 'Listening... Click to Stop';
    }
    if (visualizer) visualizer.classList.remove('hidden');
    if (transcriptNote) transcriptNote.classList.remove('hidden');

    // Auto-complete transcription after 3.5 seconds
    AppState.voiceInterval = setTimeout(() => {
      stopVoiceRecording(true);
    }, 3500);
  } else {
    stopVoiceRecording(false);
  }
}

function stopVoiceRecording(auto = false) {
  clearTimeout(AppState.voiceInterval);
  AppState.recordingVoice = false;
  const btn = document.getElementById('voice-record-btn');
  const visualizer = document.getElementById('voice-visualizer');
  const descText = document.getElementById('issue-description');

  if (btn) {
    btn.classList.remove('border-error', 'bg-error/5', 'text-error');
    btn.querySelector('span.material-symbols-outlined').innerText = 'mic';
    btn.querySelector('span.material-symbols-outlined').classList.remove('animate-pulse');
    btn.querySelector('.voice-btn-text').innerText = 'Record Voice Note';
  }
  if (visualizer) visualizer.classList.add('hidden');

  const simulatedTranscripts = [
    "ಶಾಲೆಯ ಗೇಟ್ ಎದುರು ಕಸ ತುಂಬಿ ತುಳುಕುತ್ತಿದೆ, ದಯವಿಟ್ಟು ಸ್ವಚ್ಛಗೊಳಿಸಿ. (Garbage is overflowing in front of the school gate, please clean it up.)",
    "Main road pothole near Kuvempunagar signal is very deep and dangerous for bikes.",
    "Pipeline leak near 4th cross road, clean drinking water is being wasted since morning."
  ];
  const chosenTranscript = simulatedTranscripts[Math.floor(Math.random() * simulatedTranscripts.length)];

  if (descText) {
    descText.value = chosenTranscript;
  }
  showToast('Voice Transcribed with AI', 'Speech converted to text & analyzed in real time.', 'success');
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      runAIVisionScan('garbage', e.target.result);
    };
    reader.readAsDataURL(file);
  }
}

function populateReportReview() {
  const desc = document.getElementById('issue-description')?.value || AppState.currentDraftAnalysis.draft;
  const loc = document.getElementById('report-loc-input')?.value || 'Near Govt Primary School, Mysuru';
  const ward = document.getElementById('report-ward-select')?.value || 'Ward 42, Vani Vilas Mohalla';
  const isProtected = document.getElementById('report-privacy-toggle')?.checked ?? true;

  const revDesc = document.getElementById('rev-desc');
  const revLoc = document.getElementById('rev-loc');
  const revCat = document.getElementById('rev-cat');
  const revSev = document.getElementById('rev-sev');
  const revImg = document.getElementById('rev-img');
  const revPrivacy = document.getElementById('rev-privacy-badge');

  if (revDesc) revDesc.innerText = desc;
  if (revLoc) revLoc.innerText = `${loc} (${ward})`;
  if (revCat) revCat.innerText = AppState.currentDraftAnalysis.category;
  if (revSev) {
    revSev.innerText = AppState.currentDraftAnalysis.severity;
    revSev.className = `font-bold px-2 py-0.5 rounded text-xs ${AppState.currentDraftAnalysis.severity === 'High' ? 'bg-error/10 text-error' : 'bg-[#d97706]/10 text-[#d97706]'}`;
  }
  if (revImg) revImg.src = AppState.currentDraftAnalysis.image;
  if (revPrivacy) {
    revPrivacy.innerHTML = isProtected ? 
      `<span class="material-symbols-outlined text-[16px] text-secondary">lock</span> Identity Shield Active (Name & Phone Hidden)` :
      `<span class="material-symbols-outlined text-[16px] text-on-surface-variant">lock_open</span> Public Reporter Profile`;
  }
}

function submitNewReport() {
  const desc = document.getElementById('issue-description')?.value || AppState.currentDraftAnalysis.draft;
  const loc = document.getElementById('report-loc-input')?.value || 'Near Govt Primary School, Mysuru';
  const ward = document.getElementById('report-ward-select')?.value || 'Ward 42, Vani Vilas Mohalla';
  const isProtected = document.getElementById('report-privacy-toggle')?.checked ?? true;

  const newId = `JS-2026-${Math.floor(10000 + Math.random() * 90000).toString().substring(0, 5)}`;

  const user = AppState.currentUser;
  const reporterName = user ? user.name : (isProtected ? "Protected Citizen" : "JanSetu Citizen");
  const userDistrict = user ? user.district : "Mysuru";
  const userConstituency = user ? user.constituency : "Chamaraja";

  const newIssue = {
    id: newId,
    title: desc.length > 50 ? desc.substring(0, 48) + '...' : desc,
    category: AppState.currentDraftAnalysis.category,
    priority: AppState.currentDraftAnalysis.severity.toUpperCase(),
    status: "New",
    location: loc,
    ward: ward,
    district: userDistrict,
    assembly: userConstituency,
    coordinates: [12.3051 + (Math.random() - 0.5) * 0.02, 76.6432 + (Math.random() - 0.5) * 0.02],
    reportedAt: "Just now",
    date: new Date().toISOString().split('T')[0],
    reporter: {
      name: isProtected ? "Protected Citizen" : reporterName,
      phone: isProtected ? "+91 ***** *****" : (user ? user.email : "+91 98450 12345"),
      isProtected: isProtected,
      verified: true
    },
    images: [AppState.currentDraftAnalysis.image],
    description: desc,
    aiSummary: AppState.currentDraftAnalysis.draft,
    aiConfidence: AppState.currentDraftAnalysis.confidence,
    detectedObjects: AppState.currentDraftAnalysis.objects.split(', '),
    assignedTo: null,
    resolutionProof: null,
    upvotes: 1
  };

  AppState.issues.unshift(newIssue);
  saveIssuesToStorage();

  // Increment user stats if logged in
  if (user) {
    user.reportsCount = (user.reportsCount || 0) + 1;
    localStorage.setItem('jansetu_user', JSON.stringify(user));
  }

  // Populate Step 4
  const finalIdEl = document.getElementById('final-tracking-id');
  if (finalIdEl) finalIdEl.innerText = newId;


  setReportStep(4);
  showToast('Issue Registered Successfully!', `Tracking ID: ${newId}. Authorities notified.`, 'success');
}

// ==========================================
// PUBLIC DASHBOARD & LIVE MAP ENGINE
// ==========================================

function initDashboardView() {
  populateConstituencyDatalist();
  renderDashboardStats();
  renderConstituencyExplorer();
  initLiveMap();
}

function renderDashboardStats() {
  const total = AppState.issues.length + 12476; // base stats offset
  const resolved = AppState.issues.filter(i => i.status === 'Resolved').length + 7818;
  const underReview = AppState.issues.filter(i => i.status === 'Under Review' || i.status === 'Assigned').length + 3099;
  const pending = AppState.issues.filter(i => i.status === 'New').length + 1558;

  const totalEl = document.getElementById('stat-total-reports');
  const resEl = document.getElementById('stat-resolved-reports');
  const revEl = document.getElementById('stat-review-reports');
  const penEl = document.getElementById('stat-pending-reports');

  if (totalEl) totalEl.innerText = total.toLocaleString();
  if (resEl) resEl.innerText = resolved.toLocaleString();
  if (revEl) revEl.innerText = underReview.toLocaleString();
  if (penEl) penEl.innerText = pending.toLocaleString();
}

function initLiveMap() {
  const mapContainer = document.getElementById('live-leaflet-map');
  if (!mapContainer) return;

  if (AppState.mapInstance) {
    AppState.mapInstance.invalidateSize();
    return;
  }

  // Load Leaflet Map centered on Mysuru/Karnataka
  try {
    AppState.mapInstance = L.map('live-leaflet-map', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([12.3051, 76.6432], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>, OpenStreetMap',
      maxZoom: 19
    }).addTo(AppState.mapInstance);

    renderMapMarkers();
  } catch (e) {
    console.warn("Leaflet map initialization skipped or fallback used.", e);
  }
}

function renderMapMarkers() {
  if (!AppState.mapInstance) return;

  // Clear existing
  AppState.mapMarkers.forEach(m => m.remove());
  AppState.mapMarkers = [];

  const filter = AppState.mapFilter;

  AppState.issues.forEach(issue => {
    if (filter === 'high' && issue.priority !== 'HIGH') return;
    if (filter === 'med' && issue.priority !== 'MED') return;
    if (filter === 'resolved' && issue.status !== 'Resolved') return;

    const isHigh = issue.priority === 'HIGH' && issue.status !== 'Resolved';
    const isResolved = issue.status === 'Resolved';
    const color = isResolved ? '#006c49' : (isHigh ? '#ba1a1a' : '#ef9900');

    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div class="relative flex items-center justify-center">
          ${isHigh ? '<div class="absolute w-8 h-8 rounded-full bg-red-500 opacity-40 animate-ping"></div>' : ''}
          <div class="w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white" style="background-color: ${color}">
            <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker(issue.coordinates, { icon: customIcon }).addTo(AppState.mapInstance);

    const popupContent = `
      <div class="w-64 p-3 bg-white rounded-xl shadow-lg font-sans">
        <div class="flex justify-between items-center mb-1.5">
          <span class="text-xs px-2 py-0.5 rounded font-bold ${issue.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}">${issue.status}</span>
          <span class="text-xs text-gray-500">${issue.reportedAt}</span>
        </div>
        <h4 class="font-bold text-gray-900 text-sm leading-snug line-clamp-2">${issue.title}</h4>
        <p class="text-xs text-gray-600 mt-1 flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">location_on</span> ${issue.location}
        </p>
        <div class="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span class="font-semibold text-primary">#${issue.id}</span>
          <span class="font-medium">${issue.category}</span>
        </div>
        <button onclick="openAuthorityDetail('${issue.id}')" class="mt-2 w-full py-1.5 bg-[#00236f] text-white text-xs font-semibold rounded hover:bg-opacity-90 transition-colors">
          View in Authority Portal
        </button>
      </div>
    `;

    marker.bindPopup(popupContent);
    AppState.mapMarkers.push(marker);
  });
}

function filterMap(type) {
  AppState.mapFilter = type;
  document.querySelectorAll('.map-filter-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === type) {
      btn.classList.add('ring-2', 'ring-primary', 'font-bold');
    } else {
      btn.classList.remove('ring-2', 'ring-primary', 'font-bold');
    }
  });
  renderMapMarkers();
}

// ==========================================
// CONSTITUENCY EXPLORER & REPRESENTATIVE ENGINE
// ==========================================

function findDistrictForConstituency(constName) {
  if (typeof KARNATAKA_DISTRICTS_MAP === 'undefined') return 'Karnataka';
  const lower = constName.toLowerCase();
  for (const [district, list] of Object.entries(KARNATAKA_DISTRICTS_MAP)) {
    if (list.some(c => c.toLowerCase() === lower || c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase()))) {
      return district;
    }
  }
  return 'Karnataka';
}

function generateConstituencyProfile(name, district = null) {
  const dist = district || findDistrictForConstituency(name);
  // Deterministic pseudo-random numbers from name hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const totalIssues = 450 + (absHash % 1400);
  const highPriority = 28 + (absHash % 75);
  const resolvedPct = 62 + (absHash % 24);

  return {
    name: `${name} (${dist})`,
    district: dist,
    mlaName: `MLA Legislative Office - ${name}`,
    designation: "Member of Legislative Assembly (MLA)",
    party: "Karnataka Legislative Assembly",
    photo: "assets/karnataka_govt_logo.svg",
    email: `mla.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@karnataka.gov.in`,
    officeLocation: `Taluk & Assembly Constituency Office, Mini Vidhana Soudha, ${dist}`,
    totalIssues: totalIssues,
    highPriority: highPriority,
    resolvedRate: `${resolvedPct}%`,
    wards: [
      { name: `${name} Urban / Ward 01`, active: 6 + (absHash % 12), resolved: 28 + (absHash % 30) },
      { name: `${name} Central Ward 02`, active: 4 + ((absHash >> 2) % 10), resolved: 35 + (absHash % 25) },
      { name: `${name} Rural Hobli Division`, active: 8 + ((absHash >> 4) % 14), resolved: 40 + (absHash % 35) }
    ]
  };
}

function getConstituencyData(name) {
  if (!name || !name.trim()) return null;
  const query = name.trim();
  const lowerQuery = query.toLowerCase();

  // 1. Direct or exact match in CONSTITUENCIES_DATA
  if (typeof CONSTITUENCIES_DATA !== 'undefined') {
    if (CONSTITUENCIES_DATA[query]) return CONSTITUENCIES_DATA[query];
    const matchKey = Object.keys(CONSTITUENCIES_DATA).find(k => 
      k.toLowerCase() === lowerQuery ||
      (CONSTITUENCIES_DATA[k].name && CONSTITUENCIES_DATA[k].name.toLowerCase() === lowerQuery)
    );
    if (matchKey) return CONSTITUENCIES_DATA[matchKey];
  }

  // 2. Exact match in all 224 constituencies in KARNATAKA_DISTRICTS_MAP
  if (typeof KARNATAKA_DISTRICTS_MAP !== 'undefined') {
    for (const [dist, list] of Object.entries(KARNATAKA_DISTRICTS_MAP)) {
      const match = list.find(c => c.toLowerCase() === lowerQuery);
      if (match) {
        return generateConstituencyProfile(match, dist);
      }
    }
    // Partial search in 224 constituencies
    for (const [dist, list] of Object.entries(KARNATAKA_DISTRICTS_MAP)) {
      const match = list.find(c => c.toLowerCase().includes(lowerQuery) || lowerQuery.includes(c.toLowerCase()));
      if (match) {
        return generateConstituencyProfile(match, dist);
      }
    }
    // District name match (e.g. if user searches "Bagalkote" or "Tumakuru")
    const distKey = Object.keys(KARNATAKA_DISTRICTS_MAP).find(d => d.toLowerCase() === lowerQuery || d.toLowerCase().includes(lowerQuery));
    if (distKey && KARNATAKA_DISTRICTS_MAP[distKey].length > 0) {
      const firstConst = KARNATAKA_DISTRICTS_MAP[distKey][0];
      return generateConstituencyProfile(firstConst, distKey);
    }
  }

  // Partial match in CONSTITUENCIES_DATA
  if (typeof CONSTITUENCIES_DATA !== 'undefined') {
    const matchKey = Object.keys(CONSTITUENCIES_DATA).find(k => 
      k.toLowerCase().includes(lowerQuery) ||
      (CONSTITUENCIES_DATA[k].name && CONSTITUENCIES_DATA[k].name.toLowerCase().includes(lowerQuery)) ||
      (CONSTITUENCIES_DATA[k].district && CONSTITUENCIES_DATA[k].district.toLowerCase().includes(lowerQuery))
    );
    if (matchKey) return CONSTITUENCIES_DATA[matchKey];
  }

  return null;
}

function populateConstituencyDatalist() {
  if (typeof KARNATAKA_DISTRICTS_MAP === 'undefined') return;
  const datalists = document.querySelectorAll('#karnataka-constituency-list');
  if (!datalists.length) return;

  let optionsHtml = '';
  Object.entries(KARNATAKA_DISTRICTS_MAP).forEach(([district, list]) => {
    list.forEach(c => {
      optionsHtml += `<option value="${c}">${c} (${district})</option>`;
    });
  });

  datalists.forEach(dl => {
    dl.innerHTML = optionsHtml;
  });
}

function renderConstituencyExplorer(name = null) {
  // Normalize input: empty string or whitespace becomes null
  const queryName = (typeof name === 'string' && name.trim()) ? name.trim() : null;

  let matchedData = null;
  let isStateFallback = false;

  if (queryName) {
    matchedData = getConstituencyData(queryName);
    if (matchedData) {
      AppState.activeConstituency = matchedData.name.split(' (')[0] || queryName;
    }
  }

  // If no constituency selected OR selected constituency has no representative data:
  // Priority fallback: Designated KARNATAKA_STATE_LEADER
  if (!matchedData) {
    if (typeof KARNATAKA_STATE_LEADER !== 'undefined') {
      matchedData = KARNATAKA_STATE_LEADER;
    }
    isStateFallback = true;
    AppState.activeConstituency = null;
  }

  // Ensure Details container is visible and Not Found message is hidden
  const notFoundEl = document.getElementById('constituency-not-found');
  const detailsEl = document.getElementById('constituency-details-container');
  if (notFoundEl) notFoundEl.classList.add('hidden');
  if (detailsEl) detailsEl.classList.remove('hidden');

  // Sync all search inputs across views to reflect active selection
  const searchInputs = document.querySelectorAll('input[oninput*="handleConstituencySearch"]');
  searchInputs.forEach(input => {
    if (AppState.activeConstituency) {
      if (input.value !== AppState.activeConstituency) {
        input.value = AppState.activeConstituency;
      }
    } else if (!queryName) {
      input.value = '';
    }
  });

  // Highlight corresponding chip
  document.querySelectorAll('#constituency-chips .const-chip, #constituency-section button[onclick*="renderConstituencyExplorer"]').forEach(btn => {
    const btnOnClick = btn.getAttribute('onclick') || '';
    if (!AppState.activeConstituency) {
      // Highlight "Karnataka (All)" chip
      if (btnOnClick.includes('null') || btn.textContent.includes('Karnataka')) {
        btn.className = 'const-chip px-2.5 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-xs transition-colors';
      } else {
        btn.className = 'const-chip px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container-high hover:bg-primary-fixed hover:text-primary transition-colors';
      }
    } else {
      if (btnOnClick.toLowerCase().includes(AppState.activeConstituency.toLowerCase())) {
        btn.className = 'const-chip px-2.5 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-xs transition-colors';
      } else {
        btn.className = 'const-chip px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container-high hover:bg-primary-fixed hover:text-primary transition-colors';
      }
    }
  });

  // Render Representative Card & Details
  const nameEl = document.getElementById('mla-name');
  const desigEl = document.getElementById('mla-desig');
  const partyEl = document.getElementById('mla-party');
  const photoEl = document.getElementById('mla-photo');
  const totEl = document.getElementById('const-total-issues');
  const highEl = document.getElementById('const-high-issues');
  const rateEl = document.getElementById('const-rate-issues');
  const titleEl = document.getElementById('const-stats-title');
  const contactLabelEl = document.getElementById('const-contact-label');

  if (matchedData) {
    const selectedBadgeEl = document.getElementById('const-selected-badge');
    if (selectedBadgeEl) {
      selectedBadgeEl.innerText = isStateFallback ? 'Selected: Karnataka (All State)' : `Selected Constituency: ${matchedData.name || AppState.activeConstituency}`;
    }

    if (nameEl) nameEl.innerText = matchedData.mlaName;
    if (desigEl) desigEl.innerText = matchedData.designation;
    if (partyEl) partyEl.innerText = matchedData.party;
    if (photoEl) {
      photoEl.src = matchedData.photo || 'assets/karnataka_govt_logo.svg';
      photoEl.alt = `${matchedData.mlaName} - ${matchedData.designation}`;
    }
    if (totEl) totEl.innerText = (matchedData.totalIssues || 0).toLocaleString();
    if (highEl) highEl.innerText = (matchedData.highPriority || 0).toLocaleString();
    if (rateEl) rateEl.innerText = matchedData.resolvedRate || '65%';
    
    if (titleEl) {
      if (isStateFallback) {
        titleEl.innerText = 'Karnataka Statewide Civic Stats';
      } else {
        titleEl.innerText = `${matchedData.name || AppState.activeConstituency} Civic Stats`;
      }
    }

    if (contactLabelEl) {
      contactLabelEl.innerText = isStateFallback ? 'Contact Karnataka State Grievance Cell' : `Contact ${matchedData.district || ''} Grievance Desk`;
    }

    const wardContainer = document.getElementById('const-ward-list');
    if (wardContainer && matchedData.wards) {
      wardContainer.innerHTML = matchedData.wards.map(w => `
        <div class="flex justify-between items-center p-2.5 bg-surface-container-low rounded-lg text-xs">
          <span class="font-medium text-on-surface truncate pr-2">${w.name}</span>
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-error font-semibold">${w.active} active</span>
            <span class="text-secondary font-semibold">${w.resolved} resolved</span>
          </div>
        </div>
      `).join('');
    }
  }

  // Sync Public Issues List & Map Focus with Selected Constituency
  renderPublicIssuesList();

  if (AppState.mapInstance) {
    if (AppState.activeConstituency) {
      const lower = AppState.activeConstituency.toLowerCase();
      if (lower.includes('bengaluru') || lower.includes('bangalore')) {
        AppState.mapInstance.flyTo([12.9165, 77.6101], 13);
      } else if (lower.includes('malleshwaram')) {
        AppState.mapInstance.flyTo([12.9982, 77.5714], 14);
      } else if (lower.includes('hubballi') || lower.includes('dharwad')) {
        AppState.mapInstance.flyTo([15.3647, 75.1240], 13);
      } else if (lower.includes('mangaluru') || lower.includes('mangalore')) {
        AppState.mapInstance.flyTo([12.8797, 74.8560], 13);
      } else if (lower.includes('belagavi') || lower.includes('belgaum')) {
        AppState.mapInstance.flyTo([15.8497, 74.5089], 13);
      } else {
        AppState.mapInstance.flyTo([12.3051, 76.6432], 13);
      }
    } else {
      AppState.mapInstance.flyTo([12.9716, 77.5946], 8);
    }
  }
}

function handleConstituencySearch(query) {
  const notFoundEl = document.getElementById('constituency-not-found');
  const detailsEl = document.getElementById('constituency-details-container');

  // Case: User cleared/emptied the search input -> Return to Karnataka-level leader
  if (!query || !query.trim()) {
    if (notFoundEl) notFoundEl.classList.add('hidden');
    if (detailsEl) detailsEl.classList.remove('hidden');
    renderConstituencyExplorer(null);
    return;
  }

  const matched = getConstituencyData(query);
  if (matched) {
    if (notFoundEl) notFoundEl.classList.add('hidden');
    if (detailsEl) detailsEl.classList.remove('hidden');
    renderConstituencyExplorer(matched.name.split(' (')[0] || query);
  } else {
    // Search term has no matching constituency in dataset
    if (notFoundEl) notFoundEl.classList.remove('hidden');
    if (detailsEl) detailsEl.classList.add('hidden');
  }
}

function clearConstituencySearch() {
  const searchInputs = document.querySelectorAll('input[oninput*="handleConstituencySearch"]');
  searchInputs.forEach(input => { input.value = ''; });
  renderConstituencyExplorer(null);
}

function contactRepresentativeOffice() {
  const active = AppState.activeConstituency ? getConstituencyData(AppState.activeConstituency) : null;
  if (active) {
    showToast('E-Office Connected', `Opening ${active.mlaName}'s constituent grievances desk (${active.officeLocation})...`, 'success');
  } else {
    showToast('State Grievance Portal', 'Connecting to Chief Minister & State Civic Administration Grievance Cell (Vidhana Soudha)...', 'success');
  }
}

// ==========================================
// PUBLIC ISSUES TRANSPARENCY FEED & AI MODAL
// ==========================================

function renderPublicIssuesList() {
  const container = document.getElementById('public-issues-grid');
  if (!container) return;

  const searchQuery = (AppState.publicIssuesSearchQuery || '').toLowerCase().trim();
  const catFilter = AppState.publicIssuesCategoryFilter || 'all';
  const statusFilter = AppState.publicIssuesStatusFilter || 'all';
  const activeConst = AppState.activeConstituency;

  const filtered = AppState.issues.filter(issue => {
    // Constituency filter if one is selected
    if (activeConst) {
      const matchConst = (issue.assembly && issue.assembly.toLowerCase().includes(activeConst.toLowerCase())) ||
                         (issue.district && issue.district.toLowerCase().includes(activeConst.toLowerCase())) ||
                         (issue.location && issue.location.toLowerCase().includes(activeConst.toLowerCase()));
      if (!matchConst) return false;
    }

    // Category filter
    if (catFilter !== 'all') {
      if (catFilter === 'Water' && !issue.category.toLowerCase().includes('water')) return false;
      else if (catFilter !== 'Water' && issue.category.toLowerCase() !== catFilter.toLowerCase()) return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'New' && issue.status !== 'New') return false;
      else if (statusFilter === 'Under Review' && issue.status !== 'Under Review') return false;
      else if (statusFilter === 'Assigned' && issue.status !== 'Assigned') return false;
      else if (statusFilter === 'Resolved' && issue.status !== 'Resolved') return false;
    }

    // Search query
    if (searchQuery) {
      const haystack = `${issue.title} ${issue.description} ${issue.location} ${issue.ward} ${issue.category} ${issue.district || ''} ${issue.assembly || ''} ${issue.id}`.toLowerCase();
      if (!haystack.includes(searchQuery)) return false;
    }

    return true;
  });

  const counterEl = document.getElementById('issues-result-counter');
  if (counterEl) {
    counterEl.innerText = `Showing ${filtered.length} of 1,204 public issues`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 px-4 text-center bg-surface-container-low rounded-2xl border border-outline-variant">
        <div class="w-14 h-14 rounded-2xl bg-surface-container-high text-on-surface-variant flex items-center justify-center mx-auto mb-3">
          <span class="material-symbols-outlined text-3xl">search_off</span>
        </div>
        <h3 class="font-bold text-base text-on-surface mb-1">No Matching Public Issues Found</h3>
        <p class="text-xs text-on-surface-variant max-w-md mx-auto mb-4">Try clearing filters or search terms to see all reported community incidents across Karnataka.</p>
        <button onclick="resetPublicIssuesFilters()" class="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-95 transition-all">
          Reset All Filters
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(issue => {
    const isResolved = issue.status === 'Resolved';
    const isHigh = issue.priority === 'HIGH';
    const isMed = issue.priority === 'MED';

    const prioBadgeClass = isHigh ? 'bg-error/10 text-error border-error/30' :
                           isMed ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' :
                           'bg-slate-500/10 text-slate-600 border-slate-500/30';

    const statusBadgeClass = isResolved ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' :
                             issue.status === 'Assigned' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30' :
                             issue.status === 'Under Review' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30' :
                             'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30';

    const catIcon = issue.category.toLowerCase().includes('sanit') ? 'delete' :
                    issue.category.toLowerCase().includes('road') ? 'traffic' :
                    issue.category.toLowerCase().includes('water') ? 'water_drop' :
                    issue.category.toLowerCase().includes('elect') ? 'bolt' : 'report';

    const imgUrl = (issue.images && issue.images[0]) ? issue.images[0] : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNsxQb-EkJxfp4baqg-0F2t43afuciRrn_-Zv9jW3BoFHmrLp_DBOeXqaJY-gjvUQbNL0Xuif86IVa4-c6037D1QTEV643Hodh7CkaQzFt8ZrmXA_DlNxbHHIyftxKD6xg-up44Lx9rC34u3n5qPWDvxJtC1ZttCYwSF0o-Eq__47iOkNxiPyO3dSADn6Vx0CJ4rIPHiKgKF0oH7MUhJMvxLJd4BdT89tGOgISWJblIgCF9Ah0Ddr9yA';

    const statusStep = issue.status === 'Resolved' ? 4 :
                       issue.status === 'In Progress' ? 3 :
                       issue.status === 'Assigned' ? 2 : 1;

    const step1Bg = statusStep >= 1 ? 'bg-primary' : 'bg-outline-variant/40';
    const step2Bg = statusStep >= 2 ? 'bg-primary' : 'bg-outline-variant/40';
    const step3Bg = statusStep >= 3 ? 'bg-primary' : 'bg-outline-variant/40';
    const step4Bg = statusStep >= 4 ? 'bg-secondary' : 'bg-outline-variant/40';

    const t = I18N[AppState.currentLang] || I18N.en;

    return `
      <article class="bg-surface rounded-2xl border border-outline-variant/70 level-1-shadow overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
        <!-- Card Image Header -->
        <div class="relative h-44 w-full bg-surface-container overflow-hidden">
          <img src="${imgUrl}" alt="${issue.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          <!-- Top Badges -->
          <div class="absolute top-3 left-3 right-3 flex justify-between items-center gap-2">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md bg-surface/90 text-on-surface border border-outline-variant/60 flex items-center gap-1 shadow-xs">
              <span class="material-symbols-outlined text-[14px] text-primary">${catIcon}</span>
              <span>${issue.category}</span>
            </span>

            <span class="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider backdrop-blur-md border ${prioBadgeClass} shadow-xs">
              ${issue.priority} Priority
            </span>
          </div>

          <!-- Bottom Image Overlay ID & Status -->
          <div class="absolute bottom-2.5 left-3 right-3 flex justify-between items-center text-white text-xs">
            <span class="font-mono font-bold bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">#${issue.id}</span>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-md border ${statusBadgeClass} bg-surface/90">
              ● ${issue.status}
            </span>
          </div>
        </div>

        <!-- Card Content Body -->
        <div class="p-4 sm:p-5 flex flex-col flex-grow justify-between gap-3">
          <div>
            <h3 class="font-headline-md text-base font-bold text-on-surface line-clamp-2 leading-snug mb-1.5 group-hover:text-primary transition-colors">
              ${issue.title}
            </h3>
            
            <p class="text-xs text-on-surface-variant flex items-center gap-1 mb-2.5">
              <span class="material-symbols-outlined text-[15px] text-secondary shrink-0">location_on</span>
              <span class="truncate font-medium">${issue.location} • ${issue.ward || ''}</span>
            </p>

            <!-- Mock AI Analysis Triage Box -->
            <div class="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/60 text-xs space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-bold text-primary flex items-center gap-1 text-[10px] uppercase tracking-wider">
                  <span class="material-symbols-outlined text-[14px]">auto_awesome</span> AI Vision Diagnosis
                </span>
                <span class="text-[10px] font-semibold text-on-surface-variant">${issue.reportedAt}</span>
              </div>
              <p class="text-[11px] text-on-surface leading-relaxed line-clamp-2 italic">
                "${issue.aiSummary || issue.description}"
              </p>
            </div>

            <!-- Visual Status Progress Bar: Reported → Assigned → In Progress → Resolved -->
            <div class="mt-3 pt-2 border-t border-outline-variant/60">
              <div class="flex items-center justify-between text-[10px] font-bold text-on-surface-variant mb-1">
                <span>Progress Tracker</span>
                <span class="text-primary font-semibold">${t['status' + (issue.status === 'New' ? 'Reported' : issue.status.replace(/\s+/g, ''))] || issue.status}</span>
              </div>
              <div class="grid grid-cols-4 gap-1">
                <div class="h-1.5 rounded-full ${step1Bg}"></div>
                <div class="h-1.5 rounded-full ${step2Bg}"></div>
                <div class="h-1.5 rounded-full ${step3Bg}"></div>
                <div class="h-1.5 rounded-full ${step4Bg}"></div>
              </div>
              <div class="flex justify-between text-[9px] font-medium text-on-surface-variant/70 mt-1">
                <span>${t.statusFlowReported || 'Reported'}</span>
                <span>${t.statusFlowAssigned || 'Assigned'}</span>
                <span>${t.statusFlowProgress || 'In Progress'}</span>
                <span>${t.statusFlowResolved || 'Resolved'}</span>
              </div>
            </div>
          </div>

          <!-- Card Actions Footer -->
          <div class="pt-2.5 border-t border-outline-variant/60 flex items-center justify-between gap-2">
            <!-- Upvote Button -->
            <button onclick="togglePublicIssueUpvote('${issue.id}', event)" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-secondary/10 hover:text-secondary text-on-surface text-xs font-bold transition-all" title="Support this civic report">
              <span class="material-symbols-outlined text-[16px] text-secondary">thumb_up</span>
              <span>${issue.upvotes || 0}</span>
            </button>

            <!-- View Details Button -->
            <button onclick="openPublicIssueDetailModal('${issue.id}')" class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-white hover:bg-primary-container font-bold text-xs shadow-xs transition-all">
              <span data-i18n="viewDetails">View Details</span>
              <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function filterPublicIssues(type, val) {
  if (type === 'cat') {
    AppState.publicIssuesCategoryFilter = val;
    document.querySelectorAll('#public-issue-cat-filters .issue-filter-btn').forEach(btn => {
      if (btn.getAttribute('data-filter-val') === val) {
        btn.className = 'issue-filter-btn px-3 py-1.5 rounded-full text-xs font-bold bg-primary text-white shadow-xs transition-colors';
      } else {
        btn.className = 'issue-filter-btn px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-container-high hover:bg-primary-fixed hover:text-primary transition-colors text-on-surface';
      }
    });
  } else if (type === 'status') {
    AppState.publicIssuesStatusFilter = val;
    document.querySelectorAll('#public-issue-status-filters .status-filter-btn').forEach(btn => {
      if (btn.getAttribute('data-filter-val') === val) {
        btn.className = 'status-filter-btn px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/30';
      } else {
        btn.className = 'status-filter-btn px-2.5 py-1 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container-high';
      }
    });
  }
  renderPublicIssuesList();
}

function handlePublicIssuesSearch(query) {
  AppState.publicIssuesSearchQuery = query;
  renderPublicIssuesList();
}

function resetPublicIssuesFilters() {
  AppState.publicIssuesSearchQuery = '';
  AppState.publicIssuesCategoryFilter = 'all';
  AppState.publicIssuesStatusFilter = 'all';
  AppState.activeConstituency = null;
  const searchInput = document.getElementById('public-issues-search');
  if (searchInput) searchInput.value = '';
  filterPublicIssues('cat', 'all');
  filterPublicIssues('status', 'all');
  renderConstituencyExplorer(null);
}

function togglePublicIssueUpvote(issueId, event) {
  if (event) event.stopPropagation();
  const issue = AppState.issues.find(i => i.id === issueId);
  if (!issue) return;

  issue.upvotes = (issue.upvotes || 0) + 1;
  saveIssuesData();
  renderPublicIssuesList();
  if (AppState.currentUser) {
    AppState.currentUser.upvotesCount = (AppState.currentUser.upvotesCount || 0) + 1;
    saveAuthUser();
  }
  showToast('Civic Support Registered', `You supported report #${issue.id}. Priorities escalated for high-support incidents.`, 'success');
}

function openPublicIssueDetailModal(issueId) {
  const issue = AppState.issues.find(i => i.id === issueId) || AppState.issues[0];
  if (!issue) return;

  let modal = document.getElementById('public-issue-detail-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'public-issue-detail-modal';
    modal.className = 'fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 hidden opacity-0 transition-opacity duration-300';
    document.body.appendChild(modal);
  }

  const isResolved = issue.status === 'Resolved';
  const isHigh = issue.priority === 'HIGH';
  const isMed = issue.priority === 'MED';

  const prioBadgeClass = isHigh ? 'bg-error/10 text-error border-error/30' :
                         isMed ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' :
                         'bg-slate-500/10 text-slate-600 border-slate-500/30';

  const statusBadgeClass = isResolved ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' :
                           issue.status === 'Assigned' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30' :
                           issue.status === 'Under Review' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30' :
                           'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30';

  const imgUrl = (issue.images && issue.images[0]) ? issue.images[0] : '';
  const objList = (issue.detectedObjects || []).join(', ') || 'Public infrastructure obstruction';

  modal.innerHTML = `
    <div id="public-issue-detail-card" class="bg-surface rounded-2xl border border-outline-variant level-3-shadow max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto transform scale-95 transition-transform duration-300">
      <!-- Close Button -->
      <button onclick="closePublicIssueDetailModal()" class="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container-high z-20">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>

      <!-- Modal Header -->
      <div class="flex items-center gap-2 mb-2">
        <span class="font-mono text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-md">#${issue.id}</span>
        <span class="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${prioBadgeClass}">${issue.priority} Priority</span>
        <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadgeClass}">● ${issue.status}</span>
      </div>

      <h2 class="text-xl md:text-2xl font-black text-on-surface leading-snug mb-2">${issue.title}</h2>
      
      <!-- Location & Reporter Protection -->
      <div class="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-on-surface-variant mb-4">
        <span class="flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px] text-secondary">location_on</span>
          <span>${issue.location} • ${issue.ward || ''} (${issue.district || 'Karnataka'})</span>
        </span>
        <span class="flex items-center gap-1 text-secondary font-semibold">
          <span class="material-symbols-outlined text-[16px]">verified_user</span>
          <span>Protected by JanSetu Shield</span>
        </span>
        <span class="text-on-surface-variant/70">${issue.reportedAt || 'Recent'}</span>
      </div>

      <!-- Photo Evidence with clean rounded frame -->
      ${imgUrl ? `
        <div class="w-full h-56 rounded-xl overflow-hidden border border-outline-variant mb-5 bg-black/5 relative group">
          <img src="${imgUrl}" alt="${issue.title}" class="w-full h-full object-cover" />
          <div class="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[11px] font-semibold flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">photo_camera</span> Verified Field Photograph
          </div>
        </div>
      ` : ''}

      <!-- Description -->
      <div class="mb-5">
        <h4 class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Citizen Incident Description</h4>
        <p class="text-sm text-on-surface bg-surface-container-low p-3.5 rounded-xl border border-outline-variant leading-relaxed">
          ${issue.description}
        </p>
      </div>

      <!-- AI ANALYSIS BENTO (Mock Realistic Fields) -->
      <div class="mb-5 p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border-2 border-primary/20 space-y-3">
        <div class="flex items-center justify-between border-b border-primary/20 pb-2">
          <div class="flex items-center gap-1.5 text-primary font-bold text-xs uppercase tracking-wider">
            <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span>AI Multimodal Analysis & Triage</span>
          </div>
          <span class="text-[11px] font-semibold text-secondary px-2 py-0.5 bg-secondary/10 rounded-full border border-secondary/20">Automated Triage Complete</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div class="bg-surface p-2.5 rounded-xl border border-outline-variant">
            <span class="text-on-surface-variant font-medium block text-[11px]">Issue Category</span>
            <span class="font-bold text-on-surface text-sm">${issue.category}</span>
          </div>
          <div class="bg-surface p-2.5 rounded-xl border border-outline-variant">
            <span class="text-on-surface-variant font-medium block text-[11px]">Assessed Priority</span>
            <span class="font-bold ${isHigh ? 'text-error' : 'text-amber-600'} text-sm">${issue.priority} Hazard</span>
          </div>
          <div class="col-span-full bg-surface p-2.5 rounded-xl border border-outline-variant">
            <span class="text-on-surface-variant font-medium block text-[11px]">Recommended Authority</span>
            <span class="font-bold text-primary text-xs">${issue.recommendedAuthority || 'Local Municipal Corporation (MCC / BBMP)'}</span>
          </div>
          <div class="col-span-full bg-surface p-2.5 rounded-xl border border-outline-variant">
            <span class="text-on-surface-variant font-medium block text-[11px]">Suggested Field Action</span>
            <span class="font-semibold text-on-surface text-xs">${issue.suggestedAction || 'Inspection and routine clearance'}</span>
          </div>
          <div class="col-span-full bg-surface p-2.5 rounded-xl border border-outline-variant">
            <span class="text-on-surface-variant font-medium block text-[11px]">Detected Objects / Visual Elements</span>
            <span class="text-on-surface-variant text-xs">${objList}</span>
          </div>
        </div>
      </div>

      <!-- Live Resolution Progress Pipeline -->
      <div class="mb-5">
        <h4 class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2.5">Resolution Progress Pipeline</h4>
        <div class="grid grid-cols-4 gap-2 text-center text-[11px]">
          <div class="p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold flex flex-col items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">check_circle</span>
            <span>1. Reported</span>
          </div>
          <div class="p-2 rounded-lg ${issue.status !== 'New' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold' : 'bg-surface-container-high text-on-surface-variant font-medium'} flex flex-col items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">${issue.status !== 'New' ? 'check_circle' : 'hourglass_empty'}</span>
            <span>2. Under Review</span>
          </div>
          <div class="p-2 rounded-lg ${issue.status === 'Assigned' || issue.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold' : 'bg-surface-container-high text-on-surface-variant font-medium'} flex flex-col items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">${issue.status === 'Assigned' || issue.status === 'Resolved' ? 'check_circle' : 'pending'}</span>
            <span>3. Assigned</span>
          </div>
          <div class="p-2 rounded-lg ${issue.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold' : 'bg-surface-container-high text-on-surface-variant font-medium'} flex flex-col items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">${issue.status === 'Resolved' ? 'verified' : 'flag'}</span>
            <span>4. Resolved</span>
          </div>
        </div>
        ${issue.resolutionProof ? `
          <div class="mt-2 p-2.5 bg-secondary/10 border border-secondary/20 rounded-xl text-xs text-secondary font-medium">
            <strong>Official Resolution Note:</strong> ${issue.resolutionProof}
          </div>
        ` : ''}
      </div>

      <!-- Action Footer -->
      <div class="pt-4 border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-3">
        <button onclick="togglePublicIssueUpvote('${issue.id}', event)" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-secondary/10 hover:text-secondary text-on-surface text-xs font-bold transition-all flex items-center justify-center gap-1.5">
          <span class="material-symbols-outlined text-[18px] text-secondary">thumb_up</span>
          <span>Support Report (${issue.upvotes || 0})</span>
        </button>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button onclick="closePublicIssueDetailModal(); switchView('report');" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface border border-outline-variant hover:bg-surface-container-high text-xs font-bold text-on-surface transition-all">
            Report Related Issue
          </button>
          <button onclick="closePublicIssueDetailModal()" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-container text-xs font-bold shadow-xs transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    const card = document.getElementById('public-issue-detail-card');
    if (card) {
      card.classList.remove('scale-95');
      card.classList.add('scale-100');
    }
  }, 10);
}

function closePublicIssueDetailModal() {
  const modal = document.getElementById('public-issue-detail-modal');
  const card = document.getElementById('public-issue-detail-card');
  if (modal && card) {
    modal.classList.add('opacity-0');
    card.classList.remove('scale-100');
    card.classList.add('scale-95');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  }
}

// ==========================================
// AUTHORITY PORTAL OPERATIONS ENGINE
// ==========================================

function renderAuthorityPortal() {
  renderAuthorityMetrics();
  renderAuthorityTable();
  renderAuthorityDetail();
}

function renderAuthorityMetrics() {
  const newCount = AppState.issues.filter(i => i.status === 'New').length;
  const highCount = AppState.issues.filter(i => i.priority === 'HIGH' && i.status !== 'Resolved').length;
  const reviewCount = AppState.issues.filter(i => i.status === 'Under Review' || i.status === 'Assigned').length;
  const resolvedCount = AppState.issues.filter(i => i.status === 'Resolved').length;

  const newEl = document.getElementById('auth-new-count');
  const highEl = document.getElementById('auth-high-count');
  const reviewEl = document.getElementById('auth-review-count');
  const resolvedEl = document.getElementById('auth-resolved-count');

  if (newEl) newEl.innerText = newCount;
  if (highEl) highEl.innerText = highCount;
  if (reviewEl) reviewEl.innerText = reviewCount;
  if (resolvedEl) resolvedEl.innerText = resolvedCount;
}

function renderAuthorityTable(filterText = '', filterStatus = 'all', filterPriority = 'all') {
  const tbody = document.getElementById('authority-table-body');
  if (!tbody) return;

  const filtered = AppState.issues.filter(i => {
    const matchesSearch = !filterText || 
      i.id.toLowerCase().includes(filterText.toLowerCase()) || 
      i.location.toLowerCase().includes(filterText.toLowerCase()) || 
      i.category.toLowerCase().includes(filterText.toLowerCase());

    const matchesStatus = filterStatus === 'all' || i.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesPriority = filterPriority === 'all' || i.priority.toLowerCase() === filterPriority.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="p-8 text-center text-on-surface-variant">
          <span class="material-symbols-outlined text-4xl mb-2 opacity-40">search_off</span>
          <p>No matching incident reports found in Mysuru Division.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(issue => {
    const isSelected = issue.id === AppState.selectedIssueId;
    const prioBadge = issue.priority === 'HIGH' ? 
      '<span class="inline-flex items-center gap-1 px-2 py-1 bg-error/10 text-error rounded font-label-sm text-label-sm font-bold"><span class="material-symbols-outlined text-[14px]">local_fire_department</span> HIGH</span>' :
      issue.priority === 'MED' ?
      '<span class="inline-flex items-center gap-1 px-2 py-1 bg-[#d97706]/10 text-[#d97706] rounded font-label-sm text-label-sm font-bold"><span class="material-symbols-outlined text-[14px]">warning</span> MED</span>' :
      '<span class="inline-flex items-center gap-1 px-2 py-1 bg-outline/10 text-outline rounded font-label-sm text-label-sm font-bold"><span class="material-symbols-outlined text-[14px]">info</span> LOW</span>';

    const statusBadge = issue.status === 'Resolved' ?
      '<span class="inline-flex items-center px-2 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full font-label-sm text-label-sm font-semibold">Resolved</span>' :
      issue.status === 'Under Review' ?
      '<span class="inline-flex items-center px-2 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded-full font-label-sm text-label-sm font-semibold">Under Review</span>' :
      issue.status === 'Assigned' ?
      '<span class="inline-flex items-center px-2 py-1 bg-primary-fixed text-on-primary-fixed rounded-full font-label-sm text-label-sm font-semibold">Assigned</span>' :
      '<span class="inline-flex items-center px-2 py-1 bg-surface-variant text-on-surface rounded-full font-label-sm text-label-sm font-semibold">New</span>';

    return `
      <tr onclick="selectAuthorityReport('${issue.id}')" class="${isSelected ? 'bg-primary-fixed/60 border-l-4 border-primary' : 'hover:bg-surface-container-low border-l-4 border-transparent'} transition-colors cursor-pointer">
        <td class="p-md font-label-md text-label-md font-bold text-primary">#${issue.id}</td>
        <td class="p-md">${prioBadge}</td>
        <td class="p-md font-medium">${issue.category}</td>
        <td class="p-md text-on-surface-variant text-sm truncate max-w-xs">${issue.location}</td>
        <td class="p-md">${statusBadge}</td>
      </tr>
    `;
  }).join('');
}

function selectAuthorityReport(id) {
  AppState.selectedIssueId = id;
  renderAuthorityTable();
  renderAuthorityDetail();
}

function openAuthorityDetail(id) {
  switchView('authority');
  selectAuthorityReport(id);
}

function renderAuthorityDetail() {
  const issue = AppState.issues.find(i => i.id === AppState.selectedIssueId) || AppState.issues[0];
  if (!issue) return;

  const idEl = document.getElementById('auth-detail-id');
  const prioEl = document.getElementById('auth-detail-prio');
  const catEl = document.getElementById('auth-detail-cat');
  const locEl = document.getElementById('auth-detail-loc');
  const wardEl = document.getElementById('auth-detail-ward');
  const imgGrid = document.getElementById('auth-detail-images');
  const reporterEl = document.getElementById('auth-detail-reporter');
  const summaryEl = document.getElementById('auth-detail-summary');
  const teamEl = document.getElementById('auth-detail-assigned');

  if (idEl) idEl.innerText = `#${issue.id}`;
  if (prioEl) {
    prioEl.innerHTML = `
      <span class="inline-flex items-center gap-1 px-2.5 py-1 ${issue.priority === 'HIGH' ? 'bg-error/10 text-error' : 'bg-[#d97706]/10 text-[#d97706]'} rounded-md font-label-md text-label-md font-bold">
        <span class="material-symbols-outlined text-[16px]">priority_high</span> AI Priority: ${issue.priority}
      </span>
    `;
  }
  if (catEl) catEl.innerHTML = `<span class="material-symbols-outlined text-[16px]">category</span> ${issue.category}`;
  if (locEl) locEl.innerText = issue.location;
  if (wardEl) wardEl.innerText = issue.ward;
  if (summaryEl) summaryEl.innerText = `"${issue.aiSummary}"`;
  if (teamEl) teamEl.innerText = issue.assignedTo ? `Assigned to: ${issue.assignedTo}` : 'Unassigned';

  if (imgGrid && issue.images) {
    imgGrid.innerHTML = issue.images.map(img => `
      <img class="w-full h-28 object-cover rounded-lg border border-outline-variant hover:scale-105 transition-transform cursor-pointer" src="${img}" alt="Civic Evidence" onclick="window.open('${img}', '_blank')" />
    `).join('');
  }

  if (reporterEl) {
    reporterEl.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-surface-variant rounded-full flex items-center justify-center text-on-surface-variant">
          <span class="material-symbols-outlined">person</span>
        </div>
        <div>
          <p class="font-label-md text-label-md font-semibold text-on-surface">${issue.reporter.name}</p>
          <p class="font-label-sm text-label-sm text-on-surface-variant">${issue.reporter.isProtected ? 'Protected Identity Shield' : 'Public Citizen Profile'}</p>
        </div>
      </div>
      <span class="material-symbols-outlined text-outline" title="${issue.reporter.isProtected ? 'Protected Identity' : 'Public'}">${issue.reporter.isProtected ? 'lock' : 'lock_open'}</span>
    `;
  }
}

function assignSelectedReportToTeam() {
  const issue = AppState.issues.find(i => i.id === AppState.selectedIssueId);
  if (!issue) return;

  const team = prompt('Assign to Municipal Response Unit:\n1. MCC Health & Sanitation Squad 3\n2. PWD Road Maintenance Crew 4\n3. CHESCOM Rapid Response Unit 2\n\nEnter Team Name:', 'MCC Health & Sanitation Squad 3');
  
  if (team) {
    issue.assignedTo = team;
    issue.status = 'Assigned';
    saveIssuesToStorage();
    renderAuthorityPortal();
    showToast('Dispatched to Field Crew', `Incident #${issue.id} assigned to ${team}`, 'success');
  }
}

function updateSelectedReportStatus() {
  const issue = AppState.issues.find(i => i.id === AppState.selectedIssueId);
  if (!issue) return;

  const nextStatus = issue.status === 'New' ? 'Under Review' : 
                     issue.status === 'Under Review' ? 'In Progress' : 'Resolved';
  
  issue.status = nextStatus;
  saveIssuesToStorage();
  renderAuthorityPortal();
  showToast('Status Updated', `Report #${issue.id} marked as ${nextStatus}`, 'info');
}

function markSelectedReportResolved() {
  const issue = AppState.issues.find(i => i.id === AppState.selectedIssueId);
  if (!issue) return;

  const proof = prompt('Enter Official Resolution Summary / Inspection Note:', 'Field team verified and resolved the issue on site. Waste cleared / repairs completed.');
  
  if (proof !== null) {
    issue.status = 'Resolved';
    issue.resolutionProof = proof;
    saveIssuesToStorage();
    renderAuthorityPortal();
    showToast('Incident Resolved!', `Report #${issue.id} marked resolved. Citizen SMS alert sent.`, 'success');
  }
}

// Theme Management (Dark Mode)
function initTheme() {
  const savedTheme = localStorage.getItem('jansetu_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }
  updateThemeUI();
}

function toggleDarkMode() {
  const isDark = document.documentElement.classList.contains('dark');
  if (isDark) {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    localStorage.setItem('jansetu_theme', 'light');
    showToast('Theme Updated', 'Switched to Light Mode', 'info');
  } else {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    localStorage.setItem('jansetu_theme', 'dark');
    showToast('Theme Updated', 'Switched to Dark Mode', 'info');
  }
  updateThemeUI();
}

function updateThemeUI() {
  const isDark = document.documentElement.classList.contains('dark');
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    const icon = btn.querySelector('.theme-toggle-icon');
    const text = btn.querySelector('.theme-toggle-text');
    if (icon) {
      icon.innerText = isDark ? 'light_mode' : 'dark_mode';
    }
    if (text) {
      text.innerText = isDark ? 'Light' : 'Dark';
    }
    btn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  });
}

// ==========================================
// CITIZEN AUTHENTICATION & USER PROFILE ENGINE
// ==========================================

function initAuth() {
  // Initialize users store
  const savedUsers = localStorage.getItem('jansetu_users');
  if (!savedUsers) {
    localStorage.setItem('jansetu_users', JSON.stringify(INITIAL_USERS));
  }

  // Load current user
  const savedUser = localStorage.getItem('jansetu_user');
  if (savedUser) {
    try {
      AppState.currentUser = JSON.parse(savedUser);
    } catch (e) {
      AppState.currentUser = null;
    }
  }

  renderAuthModalContainer();
  updateAuthUI();
}

function updateAuthUI() {
  const user = AppState.currentUser;
  const t = I18N[AppState.currentLang] || I18N.en;
  const loginLabel = t.btnCitizenLogin || 'Citizen Login';

  document.querySelectorAll('.auth-user-slot').forEach(container => {
    if (user) {
      const isGuest = user.isGuest;
      const initial = user.name ? user.name.charAt(0).toUpperCase() : 'G';
      container.innerHTML = `
        <div class="relative group">
          <button onclick="openProfileModal()" class="h-9 px-3.5 rounded-full border border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center gap-2 shadow-xs shrink-0 whitespace-nowrap" title="View Profile">
            <div class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
              ${initial}
            </div>
            <div class="text-left hidden xl:block">
              <div class="font-bold text-xs text-on-surface leading-tight truncate max-w-[90px] whitespace-nowrap">${user.name}</div>
              <div class="text-[10px] text-on-surface-variant leading-none whitespace-nowrap">${user.constituency || 'Karnataka'}</div>
            </div>
            <span class="material-symbols-outlined text-[16px] text-on-surface-variant">arrow_drop_down</span>
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <button onclick="openAuthModal('login')" class="h-9 px-4 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-all font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs bg-surface shrink-0 whitespace-nowrap">
          <span class="material-symbols-outlined text-[16px]">account_circle</span>
          <span data-i18n="btnCitizenLogin" class="whitespace-nowrap">${loginLabel}</span>
        </button>
      `;
    }
  });



  // Also update mobile drawer slot
  document.querySelectorAll('.auth-mobile-slot').forEach(container => {
    if (user) {
      container.innerHTML = `
        <div class="p-3 bg-surface-container-high rounded-xl flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
              ${user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="font-bold text-sm text-on-surface">${user.name}</div>
              <div class="text-xs text-on-surface-variant">${user.constituency}, ${user.district}</div>
            </div>
          </div>
          <button onclick="logoutUser()" class="text-xs text-error font-semibold hover:underline">Logout</button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <button onclick="openAuthModal('login'); document.getElementById('mobile-drawer')?.classList.add('hidden');" class="w-full text-left p-3 rounded-lg bg-surface border border-primary text-primary font-medium text-sm flex items-center gap-2">
          <span class="material-symbols-outlined">account_circle</span> Citizen Login / Register
        </button>
      `;
    }
  });
}

function renderAuthModalContainer() {
  if (document.getElementById('auth-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm hidden opacity-0 transition-opacity duration-300 p-4';
  
  modal.innerHTML = `
    <div id="auth-modal-card" class="bg-surface rounded-2xl border border-outline-variant level-3-shadow max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative transform scale-95 transition-transform duration-300">
      <button onclick="closeAuthModal()" class="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high">
        <span class="material-symbols-outlined">close</span>
      </button>

      <!-- Auth Header -->
      <div class="text-center mb-6">
        <div class="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl mx-auto mb-2 shadow-md">
          JS
        </div>
        <h2 id="auth-modal-title" class="text-2xl font-black text-on-surface">Citizen Portal Access</h2>
        <p class="text-xs text-on-surface-variant mt-1">Empowering citizen rights & municipal accountability across Karnataka</p>
      </div>

      <!-- Auth Tabs -->
      <div class="flex border-b border-outline-variant mb-6">
        <button id="tab-btn-login" onclick="setAuthTab('login')" class="flex-1 py-2.5 font-bold text-sm text-primary border-b-2 border-primary transition-all">
          Sign In
        </button>
        <button id="tab-btn-register" onclick="setAuthTab('register')" class="flex-1 py-2.5 font-semibold text-sm text-on-surface-variant hover:text-primary transition-all">
          Register New Citizen
        </button>
      </div>

      <!-- LOGIN FORM -->
      <form id="auth-login-form" onsubmit="handleLoginSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-on-surface-variant mb-1">Email Address</label>
          <input type="email" id="login-email" required placeholder="e.g. ramesh.kumar@gmail.com" class="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none" />
        </div>
        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="text-xs font-semibold text-on-surface-variant">Password</label>
            <a href="javascript:void(0)" onclick="showToast('Password Reset', 'Demo password reset link sent to email.', 'info')" class="text-xs text-primary hover:underline">Forgot password?</a>
          </div>
          <div class="relative">
            <input type="password" id="login-password" required placeholder="Enter password" class="w-full h-11 pl-3.5 pr-10 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none" />
            <button type="button" onclick="togglePasswordVisibility('login-password', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              <span class="material-symbols-outlined text-[18px]">visibility</span>
            </button>
          </div>
        </div>

        <button type="submit" class="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-95 shadow-md flex items-center justify-center gap-2 mt-2">
          <span class="material-symbols-outlined text-[18px]">login</span> Sign In to JanSetu
        </button>

        <!-- Quick Demo Login -->
        <div class="pt-2 border-t border-outline-variant">
          <span class="text-[11px] font-semibold text-on-surface-variant block mb-2 text-center">Quick Demo Profiles:</span>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" onclick="quickFillLogin('ramesh.kumar@gmail.com', 'password123')" class="p-2 bg-surface-container-low rounded-lg text-xs hover:bg-surface-container-high text-left">
              <div class="font-bold text-on-surface">Ramesh Kumar</div>
              <div class="text-[10px] text-on-surface-variant">Mysuru • Chamaraja</div>
            </button>
            <button type="button" onclick="quickFillLogin('deepa.sharma@yahoo.com', 'password123')" class="p-2 bg-surface-container-low rounded-lg text-xs hover:bg-surface-container-high text-left">
              <div class="font-bold text-on-surface">Deepa S.</div>
              <div class="text-[10px] text-on-surface-variant">Bengaluru • Malleshwaram</div>
            </button>
          </div>
        </div>
      </form>

      <!-- REGISTER FORM -->
      <form id="auth-register-form" onsubmit="handleRegisterSubmit(event)" class="space-y-3.5 hidden">
        <div>
          <label class="block text-xs font-semibold text-on-surface-variant mb-1">Full Name</label>
          <input type="text" id="reg-name" required placeholder="e.g. Anand Gowda" class="w-full h-10 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-on-surface-variant mb-1">Email Address</label>
          <input type="email" id="reg-email" required placeholder="e.g. anand.gowda@gmail.com" class="w-full h-10 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Gender</label>
            <select id="reg-gender" class="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary outline-none">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">State (Constant)</label>
            <input type="text" id="reg-state" value="Karnataka" readonly class="w-full h-10 px-3.5 bg-surface-container-high border border-outline-variant rounded-xl text-xs font-bold text-primary cursor-not-allowed" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">District</label>
            <select id="reg-district" onchange="handleDistrictChange(this.value)" class="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary outline-none">
              <!-- Populated dynamically -->
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Constituency</label>
            <select id="reg-constituency" class="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary outline-none">
              <!-- Populated dynamically based on district -->
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-on-surface-variant mb-1">Create Password</label>
          <div class="relative">
            <input type="password" id="reg-password" required minlength="6" placeholder="At least 6 characters" class="w-full h-10 pl-3.5 pr-10 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none" />
            <button type="button" onclick="togglePasswordVisibility('reg-password', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              <span class="material-symbols-outlined text-[18px]">visibility</span>
            </button>
          </div>
        </div>

        <button type="submit" class="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-95 shadow-md flex items-center justify-center gap-2 mt-2">
          <span class="material-symbols-outlined text-[18px]">how_to_reg</span> Register Citizen Account
        </button>
      </form>

      <!-- GUEST LOGIN DIVIDER & BUTTON -->
      <div class="mt-4 pt-4 border-t border-outline-variant text-center">
        <span class="text-xs text-on-surface-variant block mb-2">Don't want to create an account right now?</span>
        <button type="button" onclick="loginAsGuest()" class="w-full py-2.5 bg-surface border-2 border-dashed border-primary/50 hover:border-primary text-primary hover:bg-primary/5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs">
          <span class="material-symbols-outlined text-[18px]">badge</span>
          Use as Guest Citizen (Instant Access)
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function openAuthModal(mode = 'login') {
  renderAuthModalContainer();
  const modal = document.getElementById('auth-modal');
  const card = document.getElementById('auth-modal-card');
  
  // Populate districts
  const districtSelect = document.getElementById('reg-district');
  if (districtSelect && districtSelect.children.length === 0) {
    const districts = Object.keys(KARNATAKA_DISTRICTS_MAP);
    districtSelect.innerHTML = districts.map(d => `<option value="${d}">${d}</option>`).join('');
    handleDistrictChange(districts[0]);
  }

  setAuthTab(mode);

  if (modal && card) {
    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.remove('opacity-0');
      card.classList.remove('scale-95');
      card.classList.add('scale-100');
    }, 10);
  }
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  const card = document.getElementById('auth-modal-card');
  if (modal && card) {
    modal.classList.add('opacity-0');
    card.classList.remove('scale-100');
    card.classList.add('scale-95');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  }
}

function setAuthTab(tab) {
  const loginForm = document.getElementById('auth-login-form');
  const regForm = document.getElementById('auth-register-form');
  const tabLogin = document.getElementById('tab-btn-login');
  const tabReg = document.getElementById('tab-btn-register');

  if (tab === 'login') {
    loginForm?.classList.remove('hidden');
    regForm?.classList.add('hidden');
    tabLogin?.classList.add('text-primary', 'border-b-2', 'border-primary', 'font-bold');
    tabLogin?.classList.remove('text-on-surface-variant');
    tabReg?.classList.remove('text-primary', 'border-b-2', 'border-primary', 'font-bold');
    tabReg?.classList.add('text-on-surface-variant');
  } else {
    loginForm?.classList.add('hidden');
    regForm?.classList.remove('hidden');
    tabReg?.classList.add('text-primary', 'border-b-2', 'border-primary', 'font-bold');
    tabReg?.classList.remove('text-on-surface-variant');
    tabLogin?.classList.remove('text-primary', 'border-b-2', 'border-primary', 'font-bold');
    tabLogin?.classList.add('text-on-surface-variant');
  }
}

function handleDistrictChange(district) {
  const constSelect = document.getElementById('reg-constituency');
  if (constSelect && KARNATAKA_DISTRICTS_MAP[district]) {
    const constituencies = KARNATAKA_DISTRICTS_MAP[district];
    constSelect.innerHTML = constituencies.map(c => `<option value="${c}">${c}</option>`).join('');
  }
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input) {
    if (input.type === 'password') {
      input.type = 'text';
      btn.querySelector('span').innerText = 'visibility_off';
    } else {
      input.type = 'password';
      btn.querySelector('span').innerText = 'visibility';
    }
  }
}

function quickFillLogin(email, pass) {
  document.getElementById('login-email').value = email;
  document.getElementById('login-password').value = pass;
  showToast('Demo Credentials Filled', 'Click "Sign In" to proceed.', 'info');
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  const users = JSON.parse(localStorage.getItem('jansetu_users') || '[]');
  const match = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (match) {
    AppState.currentUser = { ...match };
    localStorage.setItem('jansetu_user', JSON.stringify(AppState.currentUser));
    closeAuthModal();
    updateAuthUI();
    showToast(`Welcome back, ${match.name}!`, `Logged in to ${match.constituency} Constituency portal.`, 'success');
  } else {
    // If not found in mock store, allow seamless login for demo
    const dynamicUser = {
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email: email,
      gender: "Male",
      state: "Karnataka",
      district: "Mysuru",
      constituency: "Chamaraja",
      password: password,
      reportsCount: 1,
      upvotesCount: 4
    };
    AppState.currentUser = dynamicUser;
    localStorage.setItem('jansetu_user', JSON.stringify(dynamicUser));
    closeAuthModal();
    updateAuthUI();
    showToast(`Signed In as ${dynamicUser.name}`, 'Connected to Karnataka Civic Network.', 'success');
  }
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const gender = document.getElementById('reg-gender').value;
  const state = "Karnataka"; // Constant
  const district = document.getElementById('reg-district').value;
  const constituency = document.getElementById('reg-constituency').value;
  const password = document.getElementById('reg-password').value;

  const newUser = {
    name,
    email,
    gender,
    state,
    district,
    constituency,
    password,
    reportsCount: 0,
    upvotesCount: 0,
    registeredAt: new Date().toISOString()
  };

  const users = JSON.parse(localStorage.getItem('jansetu_users') || '[]');
  users.push(newUser);
  localStorage.setItem('jansetu_users', JSON.stringify(users));

  AppState.currentUser = newUser;
  localStorage.setItem('jansetu_user', JSON.stringify(newUser));

  closeAuthModal();
  updateAuthUI();
  showToast(`Welcome to JanSetu AI, ${name}!`, `Citizen registered under ${constituency}, ${district}.`, 'success');
}

function loginAsGuest() {
  const guestUser = {
    name: "Guest Citizen",
    email: "guest.citizen@jansetu.karnataka.gov.in",
    gender: "Not specified",
    state: "Karnataka",
    district: "Mysuru",
    constituency: "Chamaraja",
    isGuest: true,
    reportsCount: 0,
    upvotesCount: 0
  };

  AppState.currentUser = guestUser;
  localStorage.setItem('jansetu_user', JSON.stringify(guestUser));
  closeAuthModal();
  updateAuthUI();
  showToast('Guest Mode Activated', 'Exploring JanSetu AI with guest citizen privileges.', 'info');
}

function logoutUser() {
  AppState.currentUser = null;
  localStorage.removeItem('jansetu_user');
  updateAuthUI();
  closeProfileModal();
  showToast('Logged Out', 'You have been signed out safely.', 'info');
}

// User Profile Drawer / Modal
function openProfileModal() {
  const user = AppState.currentUser;
  if (!user) {
    openAuthModal('login');
    return;
  }

  let profileModal = document.getElementById('user-profile-modal');
  if (!profileModal) {
    profileModal = document.createElement('div');
    profileModal.id = 'user-profile-modal';
    profileModal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4';
    document.body.appendChild(profileModal);
  }

  const initial = user.name.charAt(0).toUpperCase();

  profileModal.innerHTML = `
    <div class="bg-surface rounded-2xl border border-outline-variant level-3-shadow max-w-md w-full p-6 relative">
      <button onclick="closeProfileModal()" class="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high">
        <span class="material-symbols-outlined">close</span>
      </button>

      <!-- Profile Header -->
      <div class="flex items-center gap-4 mb-6">
        <div class="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
          ${initial}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-lg text-on-surface">${user.name}</h3>
            ${user.isGuest ? '<span class="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold rounded-full">Guest</span>' : '<span class="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full">Verified Citizen</span>'}
          </div>
          <p class="text-xs text-on-surface-variant">${user.email}</p>
        </div>
      </div>

      <!-- Profile Details Bento -->
      <div class="space-y-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant text-xs">
        <div class="flex justify-between items-center py-1 border-b border-outline-variant/60">
          <span class="text-on-surface-variant font-medium">State</span>
          <span class="font-bold text-primary">${user.state || 'Karnataka'}</span>
        </div>
        <div class="flex justify-between items-center py-1 border-b border-outline-variant/60">
          <span class="text-on-surface-variant font-medium">District</span>
          <span class="font-bold text-on-surface">${user.district || 'Mysuru'}</span>
        </div>
        <div class="flex justify-between items-center py-1 border-b border-outline-variant/60">
          <span class="text-on-surface-variant font-medium">Constituency</span>
          <span class="font-bold text-on-surface">${user.constituency || 'Chamaraja'}</span>
        </div>
        <div class="flex justify-between items-center py-1">
          <span class="text-on-surface-variant font-medium">Gender</span>
          <span class="font-bold text-on-surface">${user.gender || 'Not specified'}</span>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-2 gap-3 my-4">
        <div class="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant text-center">
          <div class="font-black text-xl text-primary">${user.reportsCount || 0}</div>
          <div class="text-[11px] text-on-surface-variant">Issues Reported</div>
        </div>
        <div class="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant text-center">
          <div class="font-black text-xl text-secondary">${user.upvotesCount || 0}</div>
          <div class="text-[11px] text-on-surface-variant">Civic Upvotes</div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2">
        <button onclick="switchView('report'); closeProfileModal();" class="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:opacity-95 shadow-sm flex items-center justify-center gap-1">
          <span class="material-symbols-outlined text-[16px]">campaign</span> Report Issue
        </button>
        <button onclick="logoutUser()" class="px-4 py-2.5 bg-surface border border-error/40 text-error rounded-xl font-bold text-xs hover:bg-error/10 transition-colors flex items-center justify-center gap-1">
          <span class="material-symbols-outlined text-[16px]">logout</span> Sign Out
        </button>
      </div>
    </div>
  `;

  profileModal.classList.remove('hidden');
}

function closeProfileModal() {
  const modal = document.getElementById('user-profile-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// ==========================================
// AUTHORITY PORTAL VERIFICATION (DEPARTMENT ID)
// ==========================================

function initAuthorityAuth() {
  const savedAuth = sessionStorage.getItem('jansetu_auth_officer');
  if (savedAuth) {
    try {
      const parsed = JSON.parse(savedAuth);
      AppState.isAuthorityAuthenticated = true;
      AppState.currentOfficerId = parsed.id || '123456';
      AppState.currentOfficerDept = parsed.dept || 'Mysuru City Corporation (MCC)';
    } catch (e) {
      AppState.isAuthorityAuthenticated = false;
    }
  }
  renderAuthorityModalContainer();
}

function renderAuthorityModalContainer() {
  if (document.getElementById('authority-auth-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'authority-auth-modal';
  modal.className = 'fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md hidden opacity-0 transition-opacity duration-300 p-4';
  
  modal.innerHTML = `
    <div id="authority-auth-card" class="bg-surface rounded-2xl border border-primary/40 level-3-shadow max-w-md w-full p-6 relative transform scale-95 transition-transform duration-300">
      <button onclick="closeAuthorityAuthModal()" class="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high">
        <span class="material-symbols-outlined">close</span>
      </button>

      <!-- Authority Header -->
      <div class="text-center mb-6">
        <div class="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl mx-auto mb-2 shadow-lg ring-4 ring-primary/20">
          <span class="material-symbols-outlined text-3xl">shield_person</span>
        </div>
        <div class="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[11px] mb-1">
          Government of Karnataka • Official Portal
        </div>
        <h2 class="text-2xl font-black text-on-surface">Authority Portal Login</h2>
        <p class="text-xs text-on-surface-variant mt-1">Authorized access for Municipal Commissioners, Ward Officers & Field Teams</p>
      </div>

      <!-- Department ID Verification Form -->
      <form id="authority-auth-form" onsubmit="handleAuthorityLoginSubmit(event)" class="space-y-4">
        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="block text-xs font-bold text-on-surface" for="auth-dept-id">
              Department Officer ID <span class="text-error">*</span>
            </label>
            <span class="text-[11px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded">Example: 123456</span>
          </div>
          <div class="relative">
            <input 
              type="text" 
              id="auth-dept-id" 
              required 
              value="123456" 
              placeholder="e.g. 123456 or MCC-123456" 
              class="w-full h-11 pl-10 pr-4 bg-surface-container-lowest border-2 border-primary/40 rounded-xl text-sm font-mono font-bold text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-[20px]">badge</span>
          </div>
          <p class="text-[11px] text-on-surface-variant mt-1">Enter your 6-digit Department ID (Try example: <code class="bg-surface-container-high px-1 py-0.5 rounded font-mono font-bold text-primary cursor-pointer" onclick="quickFillAuthorityId('123456')">123456</code>)</p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-on-surface-variant mb-1">Municipal Department / Division</label>
          <select id="auth-dept-div" class="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-semibold text-on-surface focus:ring-2 focus:ring-primary outline-none">
            <option value="Mysuru City Corporation (MCC) - Division 1">Mysuru City Corporation (MCC) - Division 1</option>
            <option value="Bruhat Bengaluru Mahanagara Palike (BBMP) - South">Bruhat Bengaluru Mahanagara Palike (BBMP) - South</option>
            <option value="Hubballi-Dharwad Municipal Corporation (HDMC)">Hubballi-Dharwad Municipal Corporation (HDMC)</option>
            <option value="Karnataka PWD Road Infrastructure Cell">Karnataka PWD Road Infrastructure Cell</option>
            <option value="CHESCOM / BESCOM Electrical Unit">CHESCOM / BESCOM Electrical Unit</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-on-surface-variant mb-1">Security PIN / Passcode</label>
          <div class="relative">
            <input 
              type="password" 
              id="auth-dept-pin" 
              required 
              value="1234" 
              placeholder="Enter PIN (Default: 1234)" 
              class="w-full h-11 pl-10 pr-10 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary outline-none"
            />
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">key</span>
            <button type="button" onclick="togglePasswordVisibility('auth-dept-pin', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              <span class="material-symbols-outlined text-[18px]">visibility</span>
            </button>
          </div>
        </div>

        <button type="submit" class="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-95 shadow-lg flex items-center justify-center gap-2 mt-2">
          <span class="material-symbols-outlined text-[18px]">verified_user</span>
          Verify & Enter Authority Console
        </button>

        <!-- Quick 1-Click Demo Login Button -->
        <button type="button" onclick="quickFillAuthorityId('123456'); document.getElementById('authority-auth-form').requestSubmit();" class="w-full py-2.5 bg-surface border border-primary text-primary hover:bg-primary/5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-[16px]">touch_app</span>
          Quick Demo Login with ID: 123456
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
}

function openAuthorityAuthModal(targetIssueId = null) {
  AppState.targetAuthorityIssueId = targetIssueId;
  renderAuthorityModalContainer();
  const modal = document.getElementById('authority-auth-modal');
  const card = document.getElementById('authority-auth-card');
  
  if (modal && card) {
    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.remove('opacity-0');
      card.classList.remove('scale-95');
      card.classList.add('scale-100');
    }, 10);
  }
}

function closeAuthorityAuthModal() {
  const modal = document.getElementById('authority-auth-modal');
  const card = document.getElementById('authority-auth-card');
  if (modal && card) {
    modal.classList.add('opacity-0');
    card.classList.remove('scale-100');
    card.classList.add('scale-95');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  }
}

function quickFillAuthorityId(id) {
  const input = document.getElementById('auth-dept-id');
  if (input) input.value = id;
}

function handleAuthorityLoginSubmit(e) {
  e.preventDefault();
  const deptIdInput = document.getElementById('auth-dept-id');
  const divSelect = document.getElementById('auth-dept-div');
  const deptId = deptIdInput ? (deptIdInput.value.trim() || '123456') : '123456';
  const division = divSelect ? divSelect.value : 'Mysuru City Corporation (MCC)';

  AppState.isAuthorityAuthenticated = true;
  AppState.currentOfficerId = deptId;
  AppState.currentOfficerDept = division;

  sessionStorage.setItem('jansetu_auth_officer', JSON.stringify({
    id: deptId,
    dept: division,
    authenticatedAt: new Date().toISOString()
  }));

  closeAuthorityAuthModal();

  showToast('Officer Verified • ID: ' + deptId, `Access Granted to ${division} Triage Console.`, 'success');

  // Check if we are on standalone authority.html or in SPA
  if (window.location.pathname.endsWith('authority.html')) {
    renderAuthorityPortal();
  } else {
    // If targeted a specific issue
    if (AppState.targetAuthorityIssueId) {
      AppState.selectedIssueId = AppState.targetAuthorityIssueId;
      AppState.targetAuthorityIssueId = null;
    }
    switchView('authority');
  }
}

function logoutAuthority() {
  AppState.isAuthorityAuthenticated = false;
  AppState.currentOfficerId = null;
  sessionStorage.removeItem('jansetu_auth_officer');
  showToast('Authority Session Terminated', 'Official portal locked safely.', 'info');

  if (window.location.pathname.endsWith('authority.html')) {
    openAuthorityAuthModal();
  } else {
    switchView('home');
  }
}

// ==========================================
// HUMAN RIGHTS CIVIC AWARENESS MARQUEE
// ==========================================

function renderHumanRightsMarquee() {
  const track = document.getElementById('human-rights-track');
  if (!track || typeof HUMAN_RIGHTS_DATA === 'undefined') return;

  const itemsHtml = HUMAN_RIGHTS_DATA.map(item => `
    <div class="human-right-item">
      <span class="human-right-pill">
        <strong class="font-bold text-on-surface tracking-wider uppercase text-xs">${item}</strong>
      </span>
      <span class="text-primary/50 text-xs select-none">✦</span>
    </div>
  `).join('');

  // Duplicate items twice for a seamless infinite 50% translation loop without gaps
  track.innerHTML = itemsHtml + itemsHtml;
}

// Global Init on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  initIssuesData();
  initAuth();
  initAuthorityAuth();
  populateConstituencyDatalist();
  renderHumanRightsMarquee();
  if (document.getElementById('public-issues-grid')) {
    renderPublicIssuesList();
  }

  // Global Keyboard Accessibility (Esc to close modals)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAuthModal();
      closeProfileModal();
      closeAuthorityAuthModal();
      const incidentDrawer = document.getElementById('authority-detail-drawer');
      if (incidentDrawer && !incidentDrawer.classList.contains('translate-x-full')) {
        incidentDrawer.classList.add('translate-x-full');
      }
    }
  });

  // Check if page is authority.html standalone and unauthenticated
  if (window.location.pathname.endsWith('authority.html') && !AppState.isAuthorityAuthenticated) {
    setTimeout(() => openAuthorityAuthModal(), 150);
  }

  // Handle Hash routing
  const hash = window.location.hash.replace('#', '') || 'home';
  if (['home', 'dashboard', 'report', 'authority'].includes(hash)) {
    switchView(hash);
  } else {
    switchView('home');
  }

  // Pre-load default AI preview in report page
  runAIVisionScan('garbage');
});




