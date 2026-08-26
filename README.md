# 🏛️ JanSetu AI (ಜನಸೇತು AI)
> **Your Voice. Your Rights. Your Community.**
> *AI-Powered Civic Accountability & Rapid Municipal Incident Resolution Platform for Karnataka.*

---

## 🌟 Overview

**JanSetu AI** is a modern, bilingual civic-tech platform that empowers citizens to report community issues (potholes, garbage dumps, pipeline leaks, electrical hazards) and connects them directly with Karnataka Municipal Corporations (MCC, BBMP, HDMC) through **Multimodal AI Vision & Audio Triage**.

---

## 🚀 Key Features

### 1. 🤖 Multimodal AI Vision & Audio Triage
- **Photo Evidence Analysis**: Powered by simulated Gemini Vision for instant hazard categorization, severity scoring (**HIGH / MED / LOW**), and bounding box detection.
- **Voice Note Recording**: Interactive audio waveform visualizer supporting bilingual voice descriptions in English and Kannada.
- **GPS Jurisdictional Mapping**: Auto-detects location and routes incidents to the appropriate municipal corporation ward.

### 2. 📜 Human Rights Civic Awareness Marquee
- Continuous, smooth bilingual ticker highlighting fundamental constitutional rights:
  - *Right to Equality* / ಸಮಾನತೆಯ ಹಕ್ಕು
  - *Right to Freedom of Speech* / ಅಭಿವ್ಯಕ್ತಿ ಸ್ವಾತಂತ್ರ್ಯದ ಹಕ್ಕು
  - *Right to Life & Liberty* / ಜೀವಿಸುವ ಮತ್ತು ವೈಯಕ್ತಿಕ ಸ್ವಾತಂತ್ರ್ಯದ ಹಕ್ಕು
  - *Right to Education* / ಶಿಕ್ಷಣದ ಹಕ್ಕು
  - *Right to Clean Environment* / ಸ್ವಚ್ಛ ಪರಿಸರದ ಹಕ್ಕು
  - *Right to Information (RTI)* / ಮಾಹಿತಿ ಹಕ್ಕು (RTI)

### 3. 🗺️ Public Civic Issues Dashboard & Live Map
- Interactive **Leaflet.js** map with color-coded, pulsing priority pins.
- Filter by priority (**High**, **Medium**, **Resolved**).
- Real-time aggregated Karnataka metrics (12,482+ reports, 62% resolution rate).

### 4. 🏛️ Constituency & MLA Explorer
- Comprehensive lookup across **all 224 Karnataka Assembly Constituencies** spanning all 31 districts (*Mysuru, Varuna, Bengaluru South, Malleshwaram, Hubballi-Dharwad, Mangaluru, Belagavi, Kalaburagi, Shivamogga, Ballari, and all others*).
- Official **Government of Karnataka Emblem / Seal** presentation for representative offices and state-level civic cells.
- MLA / Legislative Secretariat profile card, constituent grievance desk connectivity, and ward/hobli-by-ward active vs resolved breakdown.
- Built-in live search with `<datalist>` autocomplete across all 224 constituencies and quick regional filters.

### 5. 🛡️ Official Municipal Authority Triage Portal
- **Department ID Verification Gate**: Authenticates municipal commissioners and ward officers with Department ID (e.g. `123456`).
- **Incident Inspector Drawer**: Full citizen evidence gallery, AI hazard assessment, team dispatching (e.g., *MCC Health Squad*, *PWD Road Crew*, *CHESCOM*), and resolution status logging.

### 6. 👤 Citizen User Login & Profile System
- Multi-district registration (*Mysuru, Bengaluru Urban, Dharwad, Belagavi, etc.*) with dynamic constituency dropdowns.
- State locked to **Karnataka**.
- Instant 1-click **"Use as Guest"** mode and pre-configured demo profiles (*Ramesh Kumar - Mysuru*, *Deepa S. - Bengaluru*).
- Whistleblower **Privacy Identity Shield** for encrypted anonymous reporting.

### 7. 🌐 Bilingual (English / ಕನ್ನಡ) & Dark Mode
- Seamless single-line header and instant language switcher (`English` $\leftrightarrow$ `ಕನ್ನಡ`).
- Dark mode toggle with persistent local theme synchronization.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: HTML5, Tailwind CSS, Google Fonts (`Inter`, `Geist`, `Noto Sans Kannada`), Google Material Symbols.
- **Mapping Engine**: Leaflet.js with CartoDB Voyager / DarkMatter map tiles.
- **State Management**: Zero-dependency client-side architecture with persistent `localStorage` synchronization across Citizen and Authority portals.
- **Backend/Server**: Native static server (`server.ps1`).

---

## 💻 Quick Start & Installation

### Option 1: Native PowerShell Local Server
```powershell
# Clone the repository
git clone https://github.com/Nishanth-M-P/Jansatu.git
cd Jansatu

# Start the native local server on port 8080
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
Open **[http://localhost:8080](http://localhost:8080)** in your browser.

### Option 2: Direct File (Offline Mode)
Simply double-click `index.html` to open it in any web browser!

---

## 📂 Project Structure

```
Jansatu/
├── index.html          # Master Single Page Application (Home, Report, Dashboard, Authority)
├── dashboard.html      # Standalone Public Civic Issues Dashboard & Live Map
├── report.html         # Standalone 4-Step Incident Reporting Wizard
├── authority.html      # Standalone Municipal Incident Triage Portal
├── server.ps1          # Native PowerShell static HTTP server
├── css/
│   └── styles.css      # Custom animations (marquee, laser scanner, audio wave, dark theme)
├── js/
│   ├── data.js         # Datasets, MLA profiles, I18N strings, Human Rights data
│   └── app.js          # Core controller, router, Leaflet map, auth engine, AI scanner
└── README.md           # Project documentation
```

---

## 👥 Authors
- **JanSetu AI Team**
- GitHub: [@Nishanth-M-P](https://github.com/Nishanth-M-P)

---
*© 2026 JanSetu AI. Built for Karnataka Civic Accountability.*
