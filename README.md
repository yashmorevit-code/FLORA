# FLORA — Botanical 3D Plant Growth Simulator

FLORA is an interactive 3D botanical simulation and research workbench built with React, Three.js, React Three Fiber, and a deterministic discrete-time plant physiology engine. It enables botanical researchers, educators, and students to simulate, visualize, inspect, and analyze plant morphogenesis across multiple species (*Solanum lycopersicum* / Tomato and *Helianthus annuus* / Sunflower) under dynamically varying environmental conditions.

---

## Key Features

- **Cinematic Interactive Landing Page**: An immersive botanical entry portal with a real-time 3D Three.js specimen viewport, interactive species switcher, live biophysical microclimate tuner, 12-milestone phenological scrubber, and seamless navigation into the simulator.
- **Procedural & Photorealistic 3D Botanical Engine**: High-fidelity 3D plant morphogenesis powered by Three.js & React Three Fiber across 7 distinct species:
  - **Tomato (*Solanum lycopersicum*)**: Sympodial vine architecture, compound pinnate foliage, inflorescence cymes with yellow star blossoms, and multi-stage breaker tomato fruit ripening (green $\to$ breaker $\to$ ripe crimson).
  - **Strawberry (*Fragaria × ananassa*)**: Stoloniferous rosette habit, serrated trifoliate leaflets, 5-petaled white blossoms with golden receptacles, and aggregate berries with persistent calyxes and achenes attached to arching crown pedicel stalks.
  - **Sunflower (*Helianthus annuus*)**: Tall monopodial column ($3.4\,\text{m}$), unbranched stem, alternating cordate leaves, terminal composite capitulum (involucral bracts, golden ray petals, disk florets, nodding head, and achene seed maturation).
  - **Chilli Pepper (*Capsicum annuum*)**: Sympodial dichotomous branching shrub with broad ovate leaves and hanging tapered cayenne pods.
  - **Rose (*Rosa rubiginosa*)**: Woody perennial shrub with prickle-bearing canes and fragrant corollas.
  - **Paddy Rice (*Oryza sativa*)**: Tillering culms with drooping branched panicles.
  - **Winter Wheat (*Triticum aestivum*)**: Seminal tillering culms with terminal distichous spikes.
- **Rhizosphere & Root System**: Subterranean root visualization with primary taproots, fibrous lateral feeder roots, and geological soil strata layers.
- **Dynamic Physics & Lighting**: Natural continuous wind breeze sway animation with variable leaf/stem harmonics and dynamic solar irradiance responding to sunlight controls.
- **Deterministic Physiology Engine**: Mathematical simulation of moisture deficit/waterlogging, photic stress, thermal stress, and nutrient deficiency affecting growth rates, health, and homeostasis.
- **Calibrated Educational Timescales**: True-to-life milestone stages mapped to educational growth days ($90\,\text{s}$ at $1\times$ speed corresponds to 100 days for Tomato and 110 days for Sunflower).
- **Five Specialized Workspaces**:
  1. **Simulator**: Interactive 3D scene, real-time environment controls, timeline bar, and vital statistics panel.
  2. **Analytics**: Growth curves, multi-metric time-series telemetry charts, and downsampled snapshot analysis.
  3. **Experiments**: LocalStorage trial catalog with quick-save, execution, duplicate, deletion, and full JSON file Export/Import.
  4. **Compare**: Side-by-side experiment benchmarking, variance metrics, and overlay comparison charts.
  5. **Species**: Central botanical registry displaying taxonomy, growth habit, reproductive biology, and one-click launch.
- **Interactive Botanical Inspection**: Clickable plant organs (leaves, stems, flowers, fruits, roots) opening a detailed anatomical inspection drawer.

---

## Technology Stack

- **Runtime & Build**: Node.js $\ge 20$, Vite 6, pnpm
- **Frontend Framework**: React 18, React DOM 18
- **3D Graphics & WebGL**: Three.js (v0.174), `@react-three/fiber` (v8.18), `@react-three/drei` (v9.122)
- **Icons & UI Design**: Lucide React, Custom Dark Botanical Modern CSS
- **Testing**: Vitest (v3.0.7) unit and integration test runner
- **Containerization**: Multi-stage Docker, Nginx Alpine, Docker Compose

---

## Prerequisites

- **Node.js**: `v20.x` or higher (tested on Node 20 and 24)
- **Package Manager**: `pnpm` $\ge 9.x$
- **Docker & Docker Compose**: Docker Desktop or Docker Engine $\ge 20.10$ with Compose v2/v5 (optional, for containerized execution)

---

## Local Development Setup

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd flora-plant-simulator

# Install dependencies using pnpm
pnpm install
```

### 2. Run the Development Server
```bash
pnpm run dev
```
Open your browser and navigate to `http://localhost:5173` (or the port indicated in your terminal).

### 3. Run Unit Tests
```bash
pnpm test
```
Executes all 82 unit and integration test suites covering the simulation engine, history buffer, multi-species registry, experiment management, and comparison metrics.

### 4. Build for Production
```bash
pnpm run build
```
Generates optimized, minified production assets in the `dist/` directory.

### 5. Preview Production Build
```bash
pnpm run preview
```
Serves the local `dist/` bundle on `http://localhost:5174`.

---

## Production Deployment (Vercel)

FLORA is configured for zero-friction continuous deployment to Vercel:

1. Push this repository to GitHub (`yashmorevit-code/FLORA`).
2. In the [Vercel Dashboard](https://vercel.com/new), import the `yashmorevit-code/FLORA` repository.
3. Vercel automatically detects the **Vite** framework preset, `pnpm` package manager, and `dist` output directory.
4. The bundled [`vercel.json`](./vercel.json) routes single-page application routes (`/` and `/simulator`) with SPA rewrites.
5. All future pushes to the `main` branch trigger continuous automated production deployments.

---

## Docker & Containerization

FLORA includes a production-grade multi-stage `Dockerfile` and `docker-compose.yml` for reproducible deployment.

### Quick Start with Docker Compose (Production)
```bash
# Build and launch the production container
docker compose up --build -d

# Check status and health
docker compose ps

# View container logs
docker compose logs -f flora-app
```
Access the application at `http://localhost:8080` (or the configured `PORT` in your `.env` file).

### Stop the Container
```bash
docker compose down
```

### Interactive Development via Docker
If you prefer developing inside a container with live code reload:
```bash
docker compose --profile dev up --build
```
This mounts `./src`, `./public`, and `index.html` into the container with Vite HMR enabled at `http://localhost:5174`.

### Docker Architecture Summary
- **Builder Stage**: `node:20-alpine` installs dependencies with `pnpm install --frozen-lockfile` and runs `pnpm run build`.
- **Production Stage**: Lightweight `nginx:alpine` serves static assets with:
  - SPA fallback routing (`try_files $uri $uri/ /index.html`)
  - Long-term caching for hashed assets (`/assets/`)
  - Gzip compression for text, JavaScript, CSS, and SVG
  - Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`)
  - Health check endpoint at `/health` returning `200 OK`

---

## Environment Configuration

Copy the example environment configuration:
```bash
cp .env.example .env
```

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8080` | Host port mapped to the production Nginx web server |
| `DEV_PORT` | `5174` | Host port mapped to the containerized Vite development server |
| `NODE_ENV` | `production` | Node environment mode (`production` or `development`) |
| `VITE_APP_NAME` | `FLORA` | Application brand name |
| `VITE_APP_VERSION` | `0.1.0` | Application version tag |

---

## Project Structure Overview

```
c:\SB2\
├── Dockerfile                  # Multi-stage production & dev Dockerfile
├── docker-compose.yml          # Container orchestration with healthchecks
├── nginx.conf                  # Nginx SPA configuration with gzip & caching
├── .dockerignore               # Build context exclusions
├── .env.example                # Safe environment variable template
├── index.html                  # HTML5 entrypoint with Google Fonts
├── package.json                # Project dependencies & scripts
├── pnpm-lock.yaml              # Frozen dependency lockfile
├── vite.config.js              # Vite React configuration
├── PROJECT_HANDOVER.md         # Comprehensive developer handover documentation
├── public/                     # Static media assets & reference videos
│   └── referrencevideos/       # Growth study timelapse videos
└── src/
    ├── main.jsx                # Application root entry point
    ├── App.jsx                 # Top-level state, workspace router & layout
    ├── index.css               # Design system & dark botanical stylesheet
    ├── components/             # UI and 3D Canvas React components
    │   ├── BotanicalScene.jsx  # Three.js 3D viewport, lighting & controls
    │   ├── ProceduralPlant.jsx # Solanum lycopersicum procedural 3D model
    │   ├── ProceduralSunflower.jsx # Helianthus annuus procedural 3D model
    │   ├── ProceduralRoots.jsx # Procedural taproot & lateral root system
    │   ├── SoilCrossSection.jsx# Geological soil stratification
    │   ├── EnvironmentPanel.jsx# Moisture, light, temp & nutrient sliders
    │   ├── StatusPanel.jsx     # Plant vitals, stresses & biometrics
    │   ├── TimelineBar.jsx     # Playback, speed, stage chips & age indicator
    │   ├── AnalyticsWorkspace.jsx  # Growth curves & historical analytics
    │   ├── ExperimentsWorkspace.jsx# Trial catalog, export & import
    │   ├── CompareWorkspace.jsx    # Side-by-side run comparison
    │   ├── SpeciesWorkspace.jsx    # Central species registry & launchpad
    │   ├── BotanicalLineChart.jsx  # Canvas-drawn telemetry graph
    │   ├── BotanicalComparisonChart.jsx # Multi-experiment overlay chart
    │   ├── InspectionModal.jsx     # Plant organ anatomical details drawer
    │   ├── CreateExperimentModal.jsx # New experiment setup modal
    │   └── ReferenceVideoModal.jsx # Time-lapse study clip viewer
    └── simulation/             # Pure deterministic simulation logic & tests
        ├── types.js            # Interfaces, stage enums & constants
        ├── species.js          # Species registry & educational timelines
        ├── engine.js           # Discrete-time physiological simulation step
        ├── history.js          # Telemetry sampling & ring buffer
        ├── experiments.js      # LocalStorage & JSON persistence
        ├── engine.test.js      # Simulation step & stress unit tests
        ├── history.test.js     # Telemetry & downsampling unit tests
        ├── experiments.test.js # Persistence & serialization unit tests
        ├── compare.test.js     # Multi-run comparison metric tests
        └── species.test.js     # Species registry & Part 8 verification tests
```

---

## Detailed Developer Handover

For developers continuing development on FLORA, please consult [`PROJECT_HANDOVER.md`](./PROJECT_HANDOVER.md). It provides an in-depth architectural breakdown, feature inventory, data flow diagrams, recommended continuation plan, and prioritized roadmap.
