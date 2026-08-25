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
  activeConstituency: 'Mysuru',
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
      link.classList.add('text-primary', 'font-bold', 'border-b-2', 'border-primary');
      link.classList.remove('text-on-surface-variant');
    } else {
      link.classList.remove('text-primary', 'font-bold', 'border-b-2', 'border-primary');
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


// Language Switcher
function toggleLanguage() {
  AppState.currentLang = AppState.currentLang === 'en' ? 'kn' : 'en';
  const langKey = AppState.currentLang;
  const t = I18N[langKey];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.innerText = t[key];
    }
  });

  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.innerHTML = `
      <span class="material-symbols-outlined text-[16px] text-primary">translate</span>
      <span class="whitespace-nowrap">${langKey === 'en' ? 'English/ಕನ್ನಡ' : 'ಕನ್ನಡ/EN'}</span>
    `;
  }

  updateAuthUI();

  showToast(langKey === 'en' ? 'Language switched to English' : 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ', '', 'info');
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
  const objEl = document.getElementById('ai-obj-val');
  const confEl = document.getElementById('ai-conf-val');
  const confBar = document.getElementById('ai-conf-bar');
  const draftBox = document.getElementById('ai-draft-box');
  const descText = document.getElementById('issue-description');

  if (imgPreview) {
    imgPreview.src = AppState.currentDraftAnalysis.image;
  }

  // Trigger Scanning State
  if (scanLaser) scanLaser.classList.remove('hidden');
  if (statusPill) {
    statusPill.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-primary animate-ping"></span>
      <span class="font-label-sm text-label-sm text-primary font-bold">Scanning with Gemini Vision...</span>
    `;
    statusPill.className = 'px-3 py-1 bg-primary/10 rounded-full flex items-center gap-xs border border-primary/20 animate-pulse';
  }

  // Animate AI results arrival
  setTimeout(() => {
    if (scanLaser) scanLaser.classList.add('hidden');
    if (statusPill) {
      statusPill.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-secondary"></span>
        <span class="font-label-sm text-label-sm text-secondary font-bold">Analysis Complete (AI Vision)</span>
      `;
      statusPill.className = 'px-3 py-1 bg-secondary/10 rounded-full flex items-center gap-xs border border-secondary/20';
    }

    if (catEl) catEl.innerText = AppState.currentDraftAnalysis.category;
    if (sevEl) {
      sevEl.innerHTML = `
        <span class="w-3 h-3 rounded-full ${analysis.severity === 'High' ? 'bg-error' : 'bg-tertiary-container'}"></span>
        <span class="font-label-md text-label-md font-bold ${analysis.severity === 'High' ? 'text-error' : 'text-on-tertiary-container'}">${analysis.severity}</span>
      `;
    }
    if (objEl) objEl.innerText = AppState.currentDraftAnalysis.objects;
    if (confEl) confEl.innerText = `${AppState.currentDraftAnalysis.confidence}%`;
    if (confBar) confBar.style.width = `${AppState.currentDraftAnalysis.confidence}%`;
    if (draftBox) draftBox.innerText = `"${AppState.currentDraftAnalysis.draft}"`;
    if (descText && (!descText.value || descText.value.length < 10 || descText.value.startsWith('There is garbage'))) {
      descText.value = AppState.currentDraftAnalysis.draft;
    }

    showToast('AI Vision Analysis Complete', `Detected ${AppState.currentDraftAnalysis.category} • Severity: ${AppState.currentDraftAnalysis.severity}`, 'success');
  }, 1000);
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

// Constituency Explorer
function renderConstituencyExplorer(name = 'Mysuru') {
  AppState.activeConstituency = name;
  const data = CONSTITUENCIES_DATA[name] || CONSTITUENCIES_DATA['Mysuru'];

  const nameEl = document.getElementById('mla-name');
  const desigEl = document.getElementById('mla-desig');
  const partyEl = document.getElementById('mla-party');
  const photoEl = document.getElementById('mla-photo');
  const totEl = document.getElementById('const-total-issues');
  const highEl = document.getElementById('const-high-issues');
  const rateEl = document.getElementById('const-rate-issues');
  const titleEl = document.getElementById('const-stats-title');

  if (nameEl) nameEl.innerText = data.mlaName;
  if (desigEl) desigEl.innerText = data.designation;
  if (partyEl) partyEl.innerText = data.party;
  if (photoEl) photoEl.src = data.photo;
  if (totEl) totEl.innerText = data.totalIssues.toLocaleString();
  if (highEl) highEl.innerText = data.highPriority;
  if (rateEl) rateEl.innerText = data.resolvedRate;
  if (titleEl) titleEl.innerText = `${name} Local Stats`;

  const wardContainer = document.getElementById('const-ward-list');
  if (wardContainer && data.wards) {
    wardContainer.innerHTML = data.wards.map(w => `
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

function handleConstituencySearch(query) {
  const notFoundEl = document.getElementById('constituency-not-found');
  const detailsEl = document.getElementById('constituency-details-container');

  if (!query || !query.trim()) {
    if (notFoundEl) notFoundEl.classList.add('hidden');
    if (detailsEl) detailsEl.classList.remove('hidden');
    renderConstituencyExplorer('Mysuru');
    return;
  }

  const match = Object.keys(CONSTITUENCIES_DATA).find(k => k.toLowerCase().includes(query.toLowerCase().trim()));
  if (match) {
    if (notFoundEl) notFoundEl.classList.add('hidden');
    if (detailsEl) detailsEl.classList.remove('hidden');
    renderConstituencyExplorer(match);
  } else {
    if (notFoundEl) notFoundEl.classList.remove('hidden');
    if (detailsEl) detailsEl.classList.add('hidden');
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
        <strong class="font-bold text-on-surface tracking-wide uppercase text-xs">${item.en}</strong>
        <span class="text-primary/70 font-bold">/</span>
        <span class="font-semibold text-primary font-kannada text-xs">${item.kn}</span>
      </span>
      <span class="text-secondary/70 text-xs select-none">✦</span>
    </div>
  `).join('');

  // Duplicate items twice for a seamless infinite 50% translation loop without gaps
  track.innerHTML = itemsHtml + itemsHtml;
}

// Global Init on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initIssuesData();
  initAuth();
  initAuthorityAuth();
  renderHumanRightsMarquee();

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




