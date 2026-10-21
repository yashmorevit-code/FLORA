# FLORA — Botanical 3D Plant Growth Simulator
# Comprehensive Project Handover & Technical Architecture Dossier

**Target Audience**: Incoming Full-Stack / Graphics / Simulation Software Engineers  
**Document Purpose**: Complete, self-contained project transition documentation for immediate development continuation, local execution, Docker containerization, and roadmap implementation.  
**Version**: 0.1.0  
**Date**: October 2026  
**Primary Working Directory**: `C:\SB2` (or root repository checkout)

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Current Implementation Status](#2-current-implementation-status)
3. [Technology Stack](#3-technology-stack)
4. [Architecture and Application Flow](#4-architecture-and-application-flow)
5. [Project Structure](#5-project-structure)
6. [Frontend Details](#6-frontend-details)
7. [Backend and API Details](#7-backend-and-api-details)
8. [Database and Data Management](#8-database-and-data-management)
9. [Environment Configuration](#9-environment-configuration)
10. [Setup and Execution](#10-setup-and-execution)
11. [Docker Documentation](#11-docker-documentation)
12. [Tests and Verification](#12-tests-and-verification)
13. [Known Bugs and Technical Debt](#13-known-bugs-and-technical-debt)
14. [Remaining-Work Roadmap (P0 - P3)](#14-remaining-work-roadmap)
15. [Recommended Continuation Plan](#15-recommended-continuation-plan)
16. [Handover Checklist](#16-handover-checklist)

---

## 1. Project Overview

### 1.1 Purpose & Problem Statement
Botanical morphogenesis and plant physiological responses to environmental fluctuations are dynamic, multi-factor biological phenomena that are challenging to teach and visualize through static 2D textbooks or simplistic animations. Traditional botanical models often lack mathematical rigor or fail to display the relationship between underground root architecture, vascular growth, phototropism, stress responses, and reproductive organogenesis.

**FLORA** solves this by providing a real-time, biologically calibrated, interactive 3D botanical research simulator and laboratory workbench. It models plant morphology procedurally while simultaneously running a continuous, deterministic physiological simulation engine.

### 1.2 Core Objectives
- **Dynamic 3D Morphogenesis**: Procedurally synthesize anatomical botanical structures (stems, nodes, compound leaves, petiole angles, inflorescence cymes, flowers, fruit trusses, taproots, and lateral root systems) in real time without pre-baked static meshes.
- **Species Diversity**: Support morphologically distinct plant species with realistic botanical architectures:
  - *Solanum lycopersicum* (Indeterminate Heirloom Tomato): Sympodial vine habit, compound pinnate leaves, 5-petal star cymes, multi-stage breaker tomato fruit ripening.
  - *Helianthus annuus* (Single-Stem Mammoth Sunflower): Monopodial upright column ($3.4\,\text{m}$ max height), broad cordate foliage, terminal composite capitulum (involucre bracts, golden ray petals, centripetal disk anthesis, nodding head, and achene seed maturation).
- **Physiological Stress Response**: Model real-time plant health, moisture stress (drought vs. waterlogging), photic irradiance stress, thermal stress, and nutrient deficiency.
- **Calibrated Educational Timescales**: Map simulation progression to educational lifecycle days ($90\,\text{s}$ at $1\times$ speed corresponds to 100 days for Tomato and 110 days for Sunflower).
- **Experimental Workbench**: Enable researchers and students to record, save, export, import, and comparatively analyze plant trials under divergent micro-climates.

### 1.3 Intended Users & Primary Use Cases
1. **Botanical & Agricultural Students**: Learn developmental stages (germination, vegetative elongation, anthesis, fruit set, senescence) and physiological stress dynamics interactively.
2. **Plant Biology Educators**: Demonstrate microclimate impacts (e.g. drought, heatwave, nutrient depletion) with real-time visual feedback and growth curves.
3. **Agronomy Researchers**: Run multi-variable comparative experiments to observe hypothetical yield curves, root-to-shoot ratios, and stress resilience.

### 1.4 Current Development Stage
The core 3D procedural simulation, multi-species engine, time-series telemetry, analytics, experiment persistence, and comparative workspaces are fully operational. The application is a client-side Single Page Application (SPA) containerized via multi-stage Docker and ready for collaborative team development.

---

## 2. Current Implementation Status

### Status Legend
- **Implemented and verified**: Functionality exists in code, passes automated tests, and verified in browser/build.
- **Implemented but unverified**: Code exists but lacks complete integration or automated test verification.
- **Partially implemented**: Core functionality exists, but secondary features or integrations remain.
- **Not implemented**: Identified feature/requirement that has not yet been started.
- **Potential issue**: Suspected defect or architectural consideration requiring developer review.

| Feature / Subsystem | Status | Primary Files | Details & Test Coverage |
|---|---|---|---|
| **Deterministic Simulation Engine** | Implemented and verified | `src/simulation/engine.js`, `types.js` | Discrete-time Euler integration with stress modeling, continuous adult homeostasis, and biological limits. Covered by 17 unit tests in `engine.test.js`. |
| **Multi-Species Registry & Lifecycles** | Implemented and verified | `src/simulation/species.js` | Data-driven configurations for Tomato and Sunflower with 12 developmental milestones, educational day mappings, and fallback handling. Covered by 23 tests in `species.test.js`. |
| **Procedural 3D Tomato Model** | Implemented and verified | `src/components/ProceduralPlant.jsx` | Sympodial vine, 4 branches, compound pinnate leaves, 5-petal star blossoms, 5 oblate tomato berries with calyx and ripening colors (#388e3c $\to$ #ffa726 $\to$ #c62828). Continuous wind sway. |
| **Procedural 3D Sunflower Model** | Implemented and verified | `src/components/ProceduralSunflower.jsx` | Monopodial column ($3.4\,\text{m}$), cordate leaves, terminal capitulum with ray petals, disc florets, seed filling, nodding head animation, and wind sway. |
| **Procedural Rhizosphere & Roots** | Implemented and verified | `src/components/ProceduralRoots.jsx`, `SoilCrossSection.jsx` | Deep taproots, lateral feeder roots, root depth/spread scaling, geological soil layers, togglable underground view. |
| **Dynamic Lighting & Camera** | Implemented and verified | `src/components/BotanicalScene.jsx` | Sunlight irradiance linked to light slider (color temperature, intensity, vector), ambient fill, dynamic camera target adapted to plant height. |
| **Organ Inspection System** | Implemented and verified | `src/components/InspectionModal.jsx` | Raycast click detection on leaves, stems, flowers, fruits, and roots displaying detailed botanical taxonomy, maturity, and dimensions. |
| **Environment Control Panel** | Implemented and verified | `src/components/EnvironmentPanel.jsx` | Sliders for moisture, light, temp, nutrients with presets (Optimal, Drought, Waterlogged, Dark, Heatwave, Starvation). |
| **Vital Statistics & Health Monitor** | Implemented and verified | `src/components/StatusPanel.jsx` | Real-time health gauge, growth vigour, stress progress bars, organ counters, and biometric height/depth readouts. |
| **Timeline & Playback Controls** | Implemented and verified | `src/components/TimelineBar.jsx` | Play/pause, step forward, reset, 0.5x–5x speed multipliers, 12 clickable milestone chips, calibrated day counters, and full maturity badge. |
| **Time-Series Telemetry Buffer** | Implemented and verified | `src/simulation/history.js` | 600-sample ring buffer, linear interpolation downsampling. Covered by 8 unit tests in `history.test.js`. |
| **Analytics Workspace** | Implemented and verified | `src/components/AnalyticsWorkspace.jsx`, `BotanicalLineChart.jsx` | Growth curves, multi-metric telemetry graphs, stress correlation charts. |
| **Experiments Catalog & Persistence** | Implemented and verified | `src/simulation/experiments.js`, `ExperimentsWorkspace.jsx` | LocalStorage persistence (`flora_experiments_v1`), schema validation, trial cards, duplication, deletion, JSON Export/Import. Covered by 8 unit tests in `experiments.test.js`. |
| **Experiment Comparison Workspace** | Implemented and verified | `src/components/CompareWorkspace.jsx`, `BotanicalComparisonChart.jsx` | Side-by-side run selection, variance calculation, multi-run overlay line charts. Covered by 6 unit tests in `compare.test.js`. |
| **Species Registry Workspace** | Implemented and verified | `src/components/SpeciesWorkspace.jsx` | Botanical dossiers, taxonomy, habit description, educational timeline charts, one-click "Select & Launch" action. |
| **Reference Video Modal** | Implemented and verified | `src/components/ReferenceVideoModal.jsx` | 3 botanical time-lapse study videos (`/referrencevideos/*.mp4`) served from `public/`. |
| **Docker Containerization** | Implemented and verified | `Dockerfile`, `docker-compose.yml`, `nginx.conf` | Multi-stage Docker build, Nginx Alpine SPA web server, healthcheck, compose orchestration, dev service profile. |
| **Remote Backend / Cloud Sync** | Not implemented (by design) | N/A | Application operates fully client-side using browser `localStorage` and JSON file exchange. No remote database or backend is currently configured. |
| **Automated E2E Browser Tests** | Partially implemented | Vitest test runner (50 unit/integration tests) | Comprehensive unit/integration test suite exists (62 tests), but no Cypress/Playwright headless browser E2E test suite. |

---

## 3. Technology Stack

### 3.1 Core Technologies
- **JavaScript (ES Modules)**: Modern ES2022+ syntax throughout simulation and UI layers.
- **React (v18.3.1)**: UI component architecture, declarative state hooks (`useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`).
- **React DOM (v18.3.1)**: Web rendering.
- **Three.js (v0.174.0)**: Low-level WebGL graphics engine, procedural geometries (`CylinderGeometry`, `SphereGeometry`, `ExtrudeGeometry`, `CatmullRomCurve3`), lighting, PBR materials (`MeshStandardMaterial`), and raycasting.
- **@react-three/fiber (v8.18.0)**: React wrapper for Three.js render loop, canvas management, and scene graph hierarchy.
- **@react-three/drei (v9.122.0)**: Three.js helper library providing `OrbitControls`.
- **Lucide React (v0.477.0)**: High-quality SVG icon set for dark botanical UI.

### 3.2 Build & Tooling
- **Vite (v6.2.0 / v6.4.4)**: Ultra-fast development server with Hot Module Replacement (HMR) and Rollup-based production bundler.
- **@vitejs/plugin-react (v4.3.4)**: Babel/Fast Refresh React plugin.
- **pnpm (v10.x / v12.x lockfile)**: Fast, disk-efficient package manager.
- **Vitest (v3.0.7 / v3.2.7)**: Vite-native unit and integration test runner with in-memory DOM / localStorage mocking.

### 3.3 Containerization & Production Web Server
- **Docker Engine & Docker Compose (v29.7.2 / Compose v5.5.1)**: Container packaging and orchestration.
- **Node 20 Alpine (`node:20-alpine`)**: Lightweight build image (~140MB).
- **Nginx Alpine (`nginx:alpine`)**: Production web server (~40MB) serving optimized static assets with gzip compression, security headers, and SPA fallback routing.

---

## 4. Architecture and Application Flow

### 4.1 High-Level Architecture Diagram
```
+-----------------------------------------------------------------------------------+
|                                  USER BROWSER                                     |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |                           App.jsx (Root Layout)                           |   |
|   |   - Workspace Navigation ('simulator' | 'analytics' | 'experiments' | ...) |   |
|   |   - Active Plant State & Environment State                                 |   |
|   |   - RequestAnimationFrame Continuous Simulation Loop                      |   |
|   +--------------------+------------------------------------+-----------------+   |
|                        |                                    |                     |
|                        v                                    v                     |
|   +------------------------------------+   +----------------------------------+   |
|   |    Three.js / R3F Canvas Viewport  |   |        UI Control Panels         |   |
|   |  - BotanicalScene.jsx              |   |  - EnvironmentPanel.jsx          |   |
|   |  - ProceduralPlant (Tomato)        |   |  - StatusPanel.jsx               |   |
|   |  - ProceduralSunflower (Sunflower) |   |  - TimelineBar.jsx               |   |
|   |  - ProceduralRoots & Soil          |   |  - InspectionModal.jsx           |   |
|   |  - Dynamic Sunlight & Wind Sway    |   |  - Species / Compare Workspaces  |   |
|   +--------------------+---------------+   +----------------+-----------------+   |
|                        |                                    |                     |
|                        +-----------------+------------------+                     |
|                                          |                                        |
|                                          v                                        |
|   +---------------------------------------------------------------------------+   |
|   |                        SIMULATION SUBSYSTEM                               |   |
|   |                                                                           |   |
|   |  +------------------------+      +-------------------------------------+  |   |
|   |  |   engine.js            | <--> |   species.js                        |  |   |
|   |  |   - stepSimulation()   |      |   - SPECIES_REGISTRY                |  |   |
|   |  |   - Stress Modeling    |      |   - 12 Stage Milestone Configs      |  |   |
|   |  |   - Organogenesis      |      |   - getActiveStage() / Fallbacks    |  |   |
|   |  +-----------+------------+      +-------------------------------------+  |   |
|   |              |                                                            |   |
|   |              v                                                            |   |
|   |  +------------------------+      +-------------------------------------+  |   |
|   |  |   history.js           |      |   experiments.js                    |  |   |
|   |  |   - 600-sample buffer  |      |   - localStorage ('flora_exp_v1')   |  |   |
|   |  |   - Downsampling LERP  |      |   - JSON Import / Export            |  |   |
|   |  +------------------------+      +-------------------------------------+  |   |
|   +---------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------+
```

### 4.2 Application Execution & Data Flow
1. **Application Bootstrapping**:
   - `index.html` loads Google Fonts (*Plus Jakarta Sans*, *Playfair Display*, *JetBrains Mono*) and mounts `src/main.jsx`.
   - `main.jsx` renders `<App />` into `#root`.
   - `App.jsx` initializes default environmental parameters (`INITIAL_ENVIRONMENT`: moisture: 60%, light: 80%, temp: 24°C, nutrients: 70%) and plant state (`INITIAL_PLANT_STATE`: age 0.0d, health 100%, stage: Seed).
2. **Simulation Animation Loop**:
   - When `isPlaying` is true, a `requestAnimationFrame` loop in `App.jsx` runs every frame.
   - It calculates elapsed delta time `dt`, multiplies by `speedMultiplier` (0.5x–5x), and invokes `stepSimulation(plantState, environment, dt)`.
   - `stepSimulation` retrieves the species biological profile from `getSpeciesConfig(plantState.speciesId)`.
   - It computes moisture, light, thermal, and nutrient stresses, updates plant health, advances overall progress and calibrated `ageDays`, resolves the active developmental stage via `getActiveStage()`, and calculates physical organ sizes (height, stem thickness, root depth/spread, flowers, fruits/seeds).
   - Telemetry snapshots are recorded into the historical ring buffer via `recordHistorySample()`.
3. **3D Scene Rendering & Interaction**:
   - `BotanicalScene.jsx` receives the updated `plantState` and renders the appropriate species 3D component.
   - If `plantState.speciesId === 'sunflower'`, `<ProceduralSunflower />` renders; otherwise `<ProceduralPlant />` (Tomato) renders.
   - An internal `useFrame` hook applies continuous harmonic wind oscillation to leaves, branches, flowers, and fruits based on elapsed clock time.
   - User clicks on plant meshes trigger `onSelectPart(partDetails)`, populating `selectedPart` and opening `InspectionModal.jsx`.
4. **Experiment Persistence**:
   - Users can save the active run via `handleSaveCurrentExperiment()`.
   - Experiments are validated, timestamped, serialized, and written to browser `localStorage`.
   - Saved trials can be re-launched into the live simulator, exported as `.json` files, or imported from other users.

---

## 5. Project Structure

```
c:\SB2\
├── .dockerignore                # Build context exclusions for Docker
├── .env.example                 # Template for local and container environment variables
├── .gitignore                   # Git version control ignore rules
├── Dockerfile                   # Multi-stage production & dev Dockerfile
├── docker-compose.yml           # Multi-service Compose orchestration
├── index.html                   # HTML5 application root entrypoint
├── nginx.conf                   # High-performance Nginx web server config for SPA
├── package.json                 # Project dependencies, scripts, and metadata
├── pnpm-lock.yaml               # Pnpm dependency lockfile
├── PROJECT_HANDOVER.md          # This complete handover guide
├── README.md                    # Quick-start guide and high-level overview
├── vite.config.js               # Vite React configuration with port/host binding
├── dist/                        # Production build output (generated by pnpm run build)
├── public/                      # Static assets copied verbatim to dist root
│   └── referrencevideos/        # Growth study timelapse MP4 videos
│       ├── Refferencevideo1.mp4 # Shoot emergence study clip
│       ├── Refferencevideo2.mp4 # Vegetative foliage study clip
│       └── Refferencevideo3.mp4 # Fruit maturation study clip
└── src/
    ├── main.jsx                 # Application entry point mounting React root
    ├── App.jsx                  # Top-level state coordinator, loop & workspace switcher
    ├── index.css                # Global design system & dark botanical UI theme
    ├── components/              # React UI & 3D WebGL Canvas components
    │   ├── AnalyticsWorkspace.jsx   # Telemetry graphs & growth rate analysis
    │   ├── BotanicalComparisonChart.jsx # Canvas multi-run comparative overlay chart
    │   ├── BotanicalLineChart.jsx   # Canvas single-run time-series telemetry chart
    │   ├── BotanicalScene.jsx       # Three.js Canvas, lighting, orbit & camera controller
    │   ├── CompareWorkspace.jsx     # Side-by-side experiment benchmarking
    │   ├── CreateExperimentModal.jsx# Setup modal for configuring new trials
    │   ├── EnvironmentPanel.jsx     # Real-time sliders & environmental presets
    │   ├── ExperimentsWorkspace.jsx # Saved experiment cards, filter, export & import
    │   ├── InspectionModal.jsx      # Anatomical organ inspection drawer
    │   ├── NavigationBar.jsx        # Top workspace navigation bar
    │   ├── PlaceholderWorkspace.jsx # Safe fallback workspace for future modules
    │   ├── ProceduralPlant.jsx      # Solanum lycopersicum procedural 3D model
    │   ├── ProceduralRoots.jsx      # Procedural taproot & lateral fibrous roots
    │   ├── ProceduralSunflower.jsx  # Helianthus annuus procedural 3D model
    │   ├── ReferenceVideoModal.jsx  # Time-lapse study video modal player
    │   ├── SoilCrossSection.jsx     # 3D geological strata soil layer visualization
    │   ├── SpeciesWorkspace.jsx     # Central botanical species registry & launchpad
    │   ├── StatusPanel.jsx          # Real-time vital signs, stresses & biometrics
    │   └── TimelineBar.jsx          # Simulation playback, speed & stage chips
    └── simulation/              # Pure mathematical simulation logic & test suites
        ├── types.js             # Initial states, constants, stage enums, presets
        ├── species.js           # Central species registry, traits & stage configs
        ├── engine.js            # Discrete-time simulation step & stress equations
        ├── history.js           # Time-series ring buffer & downsampling LERP
        ├── experiments.js       # LocalStorage persistence & JSON import/export
        ├── engine.test.js       # Simulation engine unit tests (17 tests)
        ├── history.test.js      # Telemetry buffer unit tests (8 tests)
        ├── experiments.test.js  # Persistence & migration unit tests (8 tests)
        ├── compare.test.js      # Multi-run comparison metric tests (6 tests)
        └── species.test.js      # Species registry & Part 8 verification (23 tests)
```

---

## 6. Frontend Details

### 6.1 Workspaces
The application utilizes a single-page workspace navigation pattern managed by `currentWorkspace` state in `App.jsx`:
1. **Simulator (`'simulator'`)**:
   - Center: 3D Three.js canvas `<BotanicalScene />` with interactive orbit controls, camera auto-framing, dynamic sunlight, and organ raycasting.
   - Left Overlay: `<EnvironmentPanel />` with sliders for Moisture, Light, Temperature, and Nutrients, plus 6 instant micro-climate presets.
   - Right Overlay: `<StatusPanel />` showing plant health, vigour, individual stress gauges, biometric height/depth, and flower/fruit counts.
   - Bottom Overlay: `<TimelineBar />` with simulation playback (play/pause/step/reset), speed multipliers (0.5x, 1x, 2x, 5x), calibrated age display, and 12 interactive milestone chips.
2. **Analytics (`'analytics'`)**:
   - Displays real-time and historical growth charts rendered via HTML5 Canvas (`<BotanicalLineChart />`).
   - Graphs: Height vs. Root Depth, Total Stress vs. Health, and Environmental Parameters over time.
   - Shows active sample counts, downsampling statistics, and current physiological explanation.
3. **Experiments (`'experiments'`)**:
   - Filterable catalog of saved plant trials.
   - Experiment cards displaying species badge, duration, health, final height, and creation date.
   - Actions: **Run Trial** (loads trial state into active simulator), **Duplicate**, **Delete**, **Export JSON**, and **Import JSON**.
4. **Compare (`'compare'`)**:
   - Side-by-side selection of two or more saved experiments.
   - Calculates percentage variance between runs (final height, maximum stress, health variance).
   - Renders multi-series overlay chart (`<BotanicalComparisonChart />`) comparing morphological progression over simulated days.
5. **Species (`'species'`)**:
   - Dedicated botanical species registry displaying detailed dossiers for *Solanum lycopersicum* (Tomato) and *Helianthus annuus* (Sunflower).
   - Displays common name, scientific name, family, variety, growth habit, mature height, and educational lifecycle charts.
   - **"Select & Launch Simulation"** button instantly resets the simulator to day 0.0 with the selected species and optimal environment.

### 6.2 3D Graphics & Procedural Mesh Synthesis
- **Procedural Tomato (`ProceduralPlant.jsx`)**:
  - Main Stem: Curved multi-segment cylinder with natural apical tapering.
  - Branches: Sympodial lateral branches emerging at nodal intervals.
  - Compound Foliage: Articulated petiole/rachis with 1 terminal apical leaflet, 2 lateral leaflet pairs, and 2 mini-foliolules.
  - Inflorescence: Star-shaped cymes with 5 lanceolate sepals, 5 yellow stellate petals, central anther cone, and stigma tip.
  - Fruit Trusses: Oblate tomato berries with calyx crowns and smooth three-phase color transition based on `fruitMaturity`:
    $$\text{Green } (\#388e3c) \xrightarrow{\text{breaker}} \text{Amber } (\#ffa726) \xrightarrow{\text{ripe}} \text{Crimson } (\#c62828)$$
- **Procedural Sunflower (`ProceduralSunflower.jsx`)**:
  - Main Column: Heavy vertical stem ($3.4\,\text{m}$ max height, $0.22\,\text{m}$ base thickness) with lignified bark texture.
  - Foliage: Alternating broad cordate leaves with central midrib veins.
  - Capitulum (Flower Head): Pseudanthium inflorescence comprising 16 green involucral bracts, 24 golden-yellow ray floret petals, and a central disc with 120 spiral-packed disc florets / achenes that nod downward as seed weight increases.
- **Continuous Wind Sway**:
  - Implemented via `@react-three/fiber`'s `useFrame` hook.
  - Multi-harmonic sinusoidal oscillations:
    $$\theta(t) = \sin(t \cdot \omega_1 + \phi_1) \cdot A_1 + \cos(t \cdot \omega_2 + \phi_2) \cdot A_2$$
  - Applied with phase offsets across branches, leaves, and fruits, keeping the stem base anchored firmly at the soil surface.

---

## 7. Backend and API Details

### 7.1 Architecture Classification
**FLORA currently has no external backend server.** It is designed as an ultra-responsive, offline-capable, pure client-side Single Page Application (SPA).
- **Simulation Processing**: Executed deterministically on the client's main thread (using optimized numerical mathematics in `engine.js`).
- **Data Persistence**: Handled locally via browser `localStorage` and client-side JSON file export/import.
- **Media Delivery**: Static video clips are bundled in `public/referrencevideos/` and served directly by the web server (Nginx in Docker, or Vite in local dev).

### 7.2 Future Backend & API Readiness
If a future developer needs to introduce a central cloud backend (e.g. Node.js/Express, Python/FastAPI, or Go) for multi-user synchronization or cloud model runs:
- `experiments.js` already provides clean serialization methods (`exportExperimentToJSON`, `importExperimentFromJSON`, `createExperiment`).
- The experiment schema (`schemaVersion: 1`) is fully JSON-serializable and ready to be transmitted over REST or GraphQL endpoints (`POST /api/v1/experiments`, `GET /api/v1/experiments/:id`).

---

## 8. Database and Data Management

### 8.1 Client-Side LocalStorage Schema
- **Storage Key**: `flora_experiments_v1`
- **Data Format**: JSON Array of serialized experiment objects.
- **Entity Model**:
```typescript
interface SavedExperiment {
  schemaVersion: 1;
  id: string;                      // e.g. "exp_1728954200000_abc12"
  name: string;                    // User-defined trial title
  description: string;             // Detailed hypothesis / notes
  speciesId: 'tomato' | 'sunflower' | string;
  speciesName: string;             // Common + Scientific display name
  createdAt: string;               // ISO 8601 timestamp
  updatedAt: string;               // ISO 8601 timestamp
  environment: {
    moisture: number;              // 0 - 100 (%)
    light: number;                 // 0 - 100 (%)
    temperature: number;           // 0 - 50 (°C)
    nutrients: number;             // 0 - 100 (%)
  };
  plantState: {
    speciesId: string;
    stage: string;                 // Developmental stage enum
    stageIndex: number;            // 0 - 11
    stageProgress: number;         // 0.0 - 1.0 within stage
    overallProgress: number;       // 0.0 - 1.0 total lifecycle
    ageDays: number;               // Simulated plant age in days
    health: number;                // 0 - 100 (%)
    stemHeight: number;            // Meters
    stemThickness: number;         // Meters
    rootDepth: number;             // Meters
    rootSpread: number;            // Meters
    leafCount: number;             // Organ count
    flowerCount: number;           // Organ count
    fruitCount: number;            // Organ count
    fruitMaturity: number;         // 0.0 - 1.0
    waterStress: number;           // 0.0 - 1.0
    waterloggingStress: number;    // 0.0 - 1.0
    lightStress: number;           // 0.0 - 1.0
    tempStress: number;            // 0.0 - 1.0
    nutrientStress: number;        // 0.0 - 1.0
    totalStress: number;           // 0.0 - 1.0
  };
  history: Array<{
    timestamp: number;
    step: number;
    overallProgress: number;
    ageDays: number;
    health: number;
    stemHeight: number;
    rootDepth: number;
    totalStress: number;
    // ...
  }>;
}
```

### 8.2 Migration & Backward Compatibility
`src/simulation/experiments.js` implements defensive sanitization via `sanitizeLoadedExperiment()`:
- **Missing Species ID**: Automatically defaults to `'tomato'` (*Solanum lycopersicum*).
- **Legacy Aliases**: Transparently normalizes `'solanum_lycopersicum'` to `'tomato'` and `'helianthus_annuus'` to `'sunflower'`.
- **Corrupted Data**: Wrapped in try/catch blocks; invalid JSON logs an error and returns an empty list without crashing the application.
- **Age Preservation**: Stored `ageDays` values are strictly preserved and never reset on load.

---

## 9. Environment Configuration

### 9.1 Environment Variables
Configuration is defined in `.env.example` and can be customized in `.env`:

| Variable | Environment | Default | Description |
|---|---|---|---|
| `PORT` | Container (Production) | `8080` | Host port mapped to Nginx web server inside Docker |
| `DEV_PORT` | Container (Development) | `5174` | Host port mapped to Vite dev server in Docker compose |
| `NODE_ENV` | Build / Runtime | `production` | Execution environment (`production` or `development`) |
| `VITE_APP_NAME` | Frontend Build | `FLORA` | Application title display string |
| `VITE_APP_VERSION`| Frontend Build | `0.1.0` | Application release version tag |

> [!NOTE]
> Since FLORA operates client-side, Vite embeds environment variables prefixed with `VITE_` into client bundles at build time. Never store private API keys or database secrets in client bundles.

---

## 10. Setup and Execution

### 10.1 Prerequisites
- **Node.js**: $\ge 20.0.0$
- **Package Manager**: `pnpm` $\ge 9.0.0$ (host uses `pnpm@10.27.0`)
- **Modern Browser**: Chrome, Firefox, Edge, or Safari with WebGL 2.0 support.

### 10.2 Development Commands
```bash
# 1. Install dependencies using frozen lockfile
pnpm install --frozen-lockfile

# 2. Start local development server with Hot Module Replacement
pnpm run dev

# 3. Execute the full Vitest unit & integration test suite
pnpm test

# 4. Build optimized production assets
pnpm run build

# 5. Preview production build locally
pnpm run preview
```

---

## 11. Docker Documentation

### 11.1 Container Architecture
FLORA features a multi-stage Docker architecture defined in `Dockerfile`:
1. **`base` Stage**: Uses `node:20-alpine`, installs `pnpm` via corepack, and copies `package.json` and `pnpm-lock.yaml`.
2. **`development` Stage**: Installs dependencies and runs Vite dev server (`0.0.0.0:5173`).
3. **`builder` Stage**: Installs dependencies with `pnpm install --frozen-lockfile` and compiles production assets with `pnpm run build`.
4. **`production` Stage**: Uses lightweight `nginx:alpine` to serve `/usr/share/nginx/html` with SPA routing and security headers.

### 11.2 Docker Compose Services
Orchestrated via `docker-compose.yml`:
- **`flora-app` (Default / Production)**:
  - Serves compiled static assets via Nginx on port `5173`.
  - Configured with automatic healthcheck querying `http://127.0.0.1:80/health`.
  - Restart policy: `unless-stopped`.
- **`flora-dev` (Development Profile)**:
  - Runs interactive Vite development server on port `5174`.
  - Mounts `./src`, `./public`, and `./index.html` as live volumes for real-time HMR.
  - Activated using Compose profile: `--profile dev`.

### 11.3 Common Docker Commands
```bash
# Build and run the production application
docker compose up --build -d

# Check running status and health check state
docker compose ps

# View live Nginx web server logs
docker compose logs -f flora-app

# Stop production containers safely
docker compose down

# Launch interactive development container with live reload
docker compose --profile dev up --build

# Rebuild containers from scratch without cache
docker compose build --no-cache
```

### 11.4 Nginx Web Server Configuration (`nginx.conf`)
- **SPA Routing**: `try_files $uri $uri/ /index.html;` ensures client-side routes resolve properly.
- **Cache Policy**: 1-year immutable caching for hashed `/assets/` files; `no-cache` for `index.html`.
- **Compression**: Gzip enabled for text, JavaScript, CSS, JSON, and SVG.
- **Security Headers**: `X-Frame-Options SAMEORIGIN`, `X-Content-Type-Options nosniff`, `X-XSS-Protection "1; mode=block"`.
- **Healthcheck**: `/health` endpoint returning HTTP 200 `healthy`.

---

## 12. Tests and Verification

### 12.1 Existing Automated Test Suite
FLORA has **62 passing unit and integration tests** across 5 test suites executed via Vitest:

| Test Suite | File | Tests | Focus Area |
|---|---|---|---|
| **Simulation Engine** | `src/simulation/engine.test.js` | 17 | Stress functions, growth calculations, mature continuous homeostasis, morphological bounds. |
| **Telemetry History** | `src/simulation/history.test.js` | 8 | Ring buffer sampling, snapshot creation, downsampling interpolation. |
| **Experiments Persistence** | `src/simulation/experiments.test.js` | 8 | LocalStorage persistence, JSON export/import, corrupted data handling. |
| **Multi-Run Comparison** | `src/simulation/compare.test.js` | 6 | Multi-run delta computation, variance calculation, timeline alignment. |
| **Species Registry & Part 8** | `src/simulation/species.test.js` | 23 | Central registry, Tomato & Sunflower lifecycles, 12 explicit lifecycle requirements. |

### 12.2 Verification of the 12 Explicit Part 8 Requirements
1. **Req 1 (Initial Age 0.0d)**: Passed (`Fresh Run` experiment initializes at `ageDays: 0.0`).
2. **Req 2 (Tomato Lifecycle Order)**: Passed (Sequenced strictly: germination $\to$ vegetative $\to$ flowering $\to$ reproductive $\to$ maturity, 0 to 100 days).
3. **Req 3 (Sunflower Lifecycle Order)**: Passed (Sequenced strictly: emergence $\to$ vegetative $\to$ anthesis $\to$ seed filling $\to$ maturity, 0 to 110 days).
4. **Req 4 (Tomato Flowers Precede Fruits)**: Passed (At progress 0.45: flowers present, fruit count = 0; at 0.65: fruit count = 5).
5. **Req 5 (Tomato Fruits Green to Ripe)**: Passed (Early fruit set: low maturity unripe; maturity 0.95: deep ripe crimson).
6. **Req 6 (Sunflower Capitulum Precedes Seed Fill)**: Passed (Anthesis: capitulum active, seed fill = 0.0; seed stage: achene filling $> 0.3$).
7. **Req 7 (Species Switching & 3D Model Selection)**: Passed (`BotanicalScene` cleanly switches models and camera limits).
8. **Req 8 (Saved Experiment Age Preserved)**: Passed (`ageDays: 45.8` survives persistence and reload without modification).
9. **Req 9 (Legacy Experiment Fallback)**: Passed (Unspecified species assigns fallback to tomato).
10. **Req 10 (Speed Multiplier Consistency)**: Passed ($2\,\text{s}$ at $1\times$ equals $1\,\text{s}$ at $2\times$ speed).
11. **Req 11 (Monotonic Age Increase)**: Passed (Age increases strictly monotonically forward in time).
12. **Req 12 (Bounded Growth at Maturity)**: Passed (Stem height capped firmly at adult limits under continuous simulation).

### 12.3 Recommended Manual / Functional Test Cases

#### Test Case TC-01: Species Switching & Morphological Re-Rendering
- **Preconditions**: Application open in browser (`http://localhost:5173`).
- **Steps**:
  1. Click on **Species** in the top navigation bar.
  2. Locate the **Sunflower (*Helianthus annuus*)** card and click **Select & Launch Simulation**.
  3. Verify the simulator workspace opens.
- **Expected Results**:
  - The 3D scene re-renders showing a seedling with sunflower morphology.
  - Camera automatically frames higher for sunflower's taller growth ceiling.
  - The top header badge displays `Sunflower (Helianthus annuus)`.
- **Status**: Executed & verified in live browser.

#### Test Case TC-02: Environmental Stress & Health Degradation
- **Preconditions**: Plant actively growing at $1\times$ or $2\times$ speed.
- **Steps**:
  1. On the left **Environment** panel, click the **Drought Stress** preset (Moisture: 10%).
  2. Observe the **Status Panel** and 3D scene over 15 seconds.
- **Expected Results**:
  - Water stress gauge rises toward 100%.
  - Overall vigour declines and health percentage drops steadily.
  - Foliage color transitions toward dull dehydrated green/yellow.
- **Status**: Executed & verified in live browser.

#### Test Case TC-03: Experiment Save, Export & Reload
- **Preconditions**: Plant run advanced to Day 40+.
- **Steps**:
  1. Click **Save Experiment** in top toolbar.
  2. Enter experiment name "Mid-Vegetative Trial" and submit.
  3. Navigate to **Experiments** workspace; click **Export JSON** on the saved trial.
  4. Reset simulator, return to Experiments, and click **Import Experiment**, selecting the downloaded JSON.
- **Expected Results**:
  - Experiment imports successfully with intact age, metrics, and species identity.
  - Clicking **Run Trial** restores the exact 3D plant state and telemetry history.
- **Status**: Executed & verified in live browser.

---

## 13. Known Bugs and Technical Debt

### 13.1 Confirmed Technical Debt
1. **Single Large Bundle Chunk Warning**:
   - `dist/assets/index-Il7_vNQY.js` is currently ~1.12MB (gzip: 308kB).
   - Vite issues a warning: `Some chunks are larger than 500 kB after minification`.
   - **Remediation**: Configure `build.rollupOptions.output.manualChunks` in `vite.config.js` to split Three.js (`three`, `@react-three/fiber`, `@react-three/drei`) into a dedicated `vendor-three` chunk.
2. **In-Memory Ring Buffer Limit (`MAX_HISTORY_SAMPLES = 600`)**:
   - Telemetry history is capped at 600 points in memory to avoid unbounded RAM consumption.
   - For ultra-long simulation sessions (e.g. 5+ hours), earlier data points are dropped.
   - **Remediation**: Implement a two-tiered decimation algorithm (retaining hourly/daily downsampled averages for long sessions).
3. **Reference Video Asset Duplication**:
   - The directory `referrencevideos/` exists in both the root workspace and `public/referrencevideos/`.
   - Root folder is excluded in `.dockerignore` to avoid bloated images, but can be safely removed from the local workspace to save ~18MB disk space.

### 13.2 Suspected Issues Requiring Investigation
1. **WebGL Context Loss on Mobile / Low-End GPUs**:
   - Heavy procedural geometry regeneration every frame under high speed multipliers (5x) could theoretically cause frame drops on devices with low VRAM.
   - Investigation: Profile frame budgets using Chrome DevTools Performance panel under 5x speed.

---

## 14. Remaining-Work Roadmap

### Priority P0: Critical Operational & Structural Improvements
*Must be addressed before public deployment or multi-developer feature branches.*

| Task ID | Description | Rationale | Files | Effort | Acceptance Criteria |
|---|---|---|---|---|---|
| **P0-1** | **Vite Bundle Code-Splitting** | The production JS bundle exceeds 1.1MB, triggering bundler warnings and increasing initial page load latency. | `vite.config.js` | Small (S) | `vite.config.js` configured with `manualChunks` separating Three.js/R3F; no single chunk $> 500\,\text{kB}$. |
| **P0-2** | **Root Media Cleanup** | Duplicate `referrencevideos/` directory in root consumes repository storage. | Root directory | Small (S) | Verified that `public/referrencevideos/` serves all modal videos; redundant root directory removed. |

### Priority P1: High-Priority Core Extensions
*Essential features needed to complete the botanical research vision.*

| Task ID | Description | Rationale | Files | Effort | Acceptance Criteria |
|---|---|---|---|---|---|
| **P1-1** | **Third Botanical Species (*Arabidopsis thaliana*)** | Model organism widely used in plant genetics; provides rapid life cycle for rapid educational demonstrations. | `src/simulation/species.js`, new `ProceduralArabidopsis.jsx` | Medium (M) | Registered in `SPECIES_REGISTRY`; rosette leaf geometry + slender inflorescence racemes; passes all 12 lifecycle tests. |
| **P1-2** | **Circadian Photoperiod Cycle** | Plants currently operate under fixed diurnal conditions; modeling day/night cycles enables photoperiodism (short-day vs. long-day flowering). | `engine.js`, `EnvironmentPanel.jsx`, `BotanicalScene.jsx` | Medium (M) | Day/night toggle or 24h clock slider; sun position moves across sky; dark respiration modeled in health calculation. |
| **P1-3** | **Automated Playwright E2E Test Suite** | Complement unit tests with automated headless browser tests verifying WebGL canvas mounting and user interaction. | New `tests/e2e/*.spec.js` | Medium (M) | Playwright test suite running in CI; verifies canvas renders and stage chips jump correctly. |

### Priority P2: Medium-Priority Enhancements
*Visual realism, scientific data export, and UX polish.*

| Task ID | Description | Rationale | Files | Effort | Acceptance Criteria |
|---|---|---|---|---|---|
| **P2-1** | **CSV / Excel Telemetry Export** | Agronomy researchers need to export raw numerical time-series data into R, Python, or Excel. | `AnalyticsWorkspace.jsx`, `history.js` | Small (S) | **"Export CSV"** button in Analytics generating downloadable `.csv` file with time-series columns. |
| **P2-2** | **Phototropism & Gravitropism Bending** | Stems should bend toward directional sunlight; roots should orient along the gravity vector. | `ProceduralPlant.jsx`, `ProceduralSunflower.jsx` | Medium (M) | Asymmetric stem curve angle adjusted dynamically based on directional sunlight vector. |
| **P2-3** | **Leaf Wilting & Turgor Physics** | Under extreme water stress, leaves should droop and curl downward due to loss of cellular turgor pressure. | `ProceduralPlant.jsx`, `ProceduralSunflower.jsx` | Medium (M) | Rachis and leaflet pitch angles dynamically interpolate downward when `waterStress > 0.4`. |

### Priority P3: Low-Priority / Future Explorations
*Nice-to-have features for future major releases.*

| Task ID | Description | Rationale | Files | Effort | Acceptance Criteria |
|---|---|---|---|---|---|
| **P3-1** | **Optional Cloud Sync Backend** | Enable cross-device trial sharing and community experiment libraries. | New `backend/` service | Large (L) | Lightweight Express or FastAPI container syncing experiment JSON to PostgreSQL/SQLite. |
| **P3-2** | **WebXR / VR Greenhouse Inspection** | Enable VR headset users to walk around simulated plants and inspect organs using controllers. | `BotanicalScene.jsx` | Large (L) | WebXR button enabling immersive inspection in supported headsets (Meta Quest, Apple Vision Pro). |

---

## 15. Recommended Continuation Plan

For the engineer taking over this repository, follow this structured sequence:

### Step 1: Verification & Environment Familiarization (Day 1)
1. Verify Node and Docker installations on your workstation.
2. Run `pnpm install` and verify the test suite:
   ```bash
   pnpm test
   ```
3. Run `docker compose up --build -d` and open `http://localhost:5173`.
4. Switch to the **Sunflower** species in the Species workspace, adjust the environment sliders to **Drought**, and observe stress response and wind animation.

### Step 2: Implement P0-1 (Vite Code-Splitting) (Day 1 - 2)
1. Open `vite.config.js`.
2. Add Rollup chunking rules:
   ```javascript
   build: {
     rollupOptions: {
       output: {
         manualChunks: {
           'vendor-react': ['react', 'react-dom'],
           'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
           'vendor-icons': ['lucide-react'],
         },
       },
     },
   },
   ```
3. Run `pnpm run build` and confirm all chunk sizes are under $500\,\text{kB}$.
4. Run `pnpm test` to ensure zero regressions.

### Step 3: Implement P1-1 or P2-1 (CSV Telemetry Export) (Day 2 - 3)
1. Open `src/simulation/history.js`.
2. Add a helper `exportHistoryToCSV(historySamples)`.
3. Wire a button in `src/components/AnalyticsWorkspace.jsx` enabling instant CSV download.

---

## 16. Handover Checklist

- [x] **Local Codebase State**: Clean, operational workspace with zero uncommitted broken code.
- [x] **Test Suite**: 62 unit and integration tests passing (`pnpm test`).
- [x] **Production Build**: Verified clean compilation (`pnpm run build`).
- [x] **Multi-Stage Dockerfile**: Implemented with development and production targets (`Dockerfile`).
- [x] **Docker Compose Configuration**: Orchestrated with health checks (`docker-compose.yml`).
- [x] **Web Server Configuration**: Nginx SPA fallback routing, caching, and gzip compression (`nginx.conf`).
- [x] **Environment Variable Template**: Safe placeholder configuration (`.env.example`).
- [x] **Documentation**: Comprehensive `PROJECT_HANDOVER.md` and user-friendly `README.md`.
- [ ] **Next Developer Action**: Review P0 tasks in Section 14 and execute Step 2 in Section 15.
