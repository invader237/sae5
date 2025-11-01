The goal of the CI/CD pipeline is to **ensure code quality** throughout development and to **automate deployments** in order to save time and reduce human errors.

---

## ✅ 1. Branching & Development Workflow

The project follows a **three-stage development cycle**, each stage mapped to a dedicated branch:

| Stage | Git Branch | Purpose |
|--------|------------|---------|
| Development | `dev` | Feature integration and early testing |
| Testing / Pre-production | `test` | Functional validation before production |
| Production | `main` | Final stable version deployed to users |

### Feature workflow
- New features are implemented in branches named: `feature/<name>`
- They are merged into `dev` via Pull Requests (PR)
- Code moves from `dev` → `test` → `main` through PR-based validation

Each transition (`feature/<name → dev`, `dev → test`, `test → main`) triggers specific CI workflows.

---

## ✅ 2. Technologies Used

| Tool | Usage |
|------|-------|
| **GitHub Actions** | CI/CD execution and automation |
| **Docker & Docker Compose** | Containerization of backend (`api`) and frontend (`front`) |
| **FastAPI** | Backend API |
| **React** | Frontend application |
| **GitHub Hosted Runners** | Free build/test runners provided by GitHub |

---

## ✅ 3. Workflows Overview

| Workflow Name | Trigger | Type | Description |
|---------------|---------|------|-------------|
| **Feature/Fix → Dev CI** | PR to `dev` | CI | Lint + build + backend tests |
| **Dev → Test CI** | PR to `test` | CI | Same checks as above |
| **Test → Prod CI** | PR to `prod` | CI | Same checks as above |
| **Deploy Test** | `push` to `test` or manual | CD | Deploys to test VPS |
| **Deploy Prod** | `push` to `main` or manual | CD | Deploys to production VPS |

---

### 🔁 Workflow Diagrams

    ┌──────────────┐
    │ feature/*    │
    └──────┬───────┘
           │ Pull Request
           ▼
    ┌──────────────┐
    │     dev      │  (CI only: lint + test + build)
    └──────┬───────┘
           │ Pull Request
           ▼
    ┌──────────────┐
    │     test     │  (CI + auto deploy to Test VPS)
    └──────┬───────┘
           │ Pull Request
           ▼
    ┌──────────────┐
    │     main     │  (CI + auto deploy to Prod VPS)
    └──────────────┘

## ✅ 4. CI Workflow (Pull Requests)

Executed on every Pull Request targeting `dev`, `test`, or `prod`.

### Steps
1. **Checkout repository**
2. **Run linters**  
   - Backend: FastAPI linting (flake8)  
   - Frontend: React linting (ESLint)
3. **Build Docker images**  
   - `api` (backend image)  
   - `front` (frontend image)
4. **Start containers (Docker Compose)**
5. **Run backend tests only**  
   ✅ Frontend currently has no automated test stage

---

## ✅ 5. CD Workflow (Deploy)

Executed on:
- automatic push to `test` or `main`
- or manual trigger (`workflow_dispatch`)

### Steps
1. **Checkout repository**
2. **Establish SSH connection to VPS**
3. **Pull latest version of the repository**
4. **Build Docker images on server**
5. **Start services via `docker compose`** (recreates containers for `api` and `front`)

Deployment is made on a remote Debian VPS.

---

## ✅ 6. Secrets & Environment Variables

All secrets are stored in **GitHub Secrets** and injected into workflows.

| Secret Name | Used For | Description |
|-------------|----------|-------------|
| `APP_PROFILE` | Runtime | Application profile (`dev`, `test`, `prod`) |
| `DB_HOST` | Backend | Database hostname / IP |
| `DB_PASSWORD` | Backend | Database password |
| `DB_PORT` | Backend | Database port |
| `DB_USER` | Backend | DB username |
| `SERVER_IP` | Deployment | VPS IP address |
| `SERVER_USER_DEPLOYER` | Deployment | SSH user on VPS |
| `VPS_SSH_KEY` | Deployment | Private SSH key (base64 encoded) |

---

## ✅ 7. Manual Execution

Only the **deployment workflows** (`Deploy Test` and `Deploy Prod`) can be launched manually.

Steps to trigger manually:

1. Go to **GitHub → Actions** tab
2. Select workflow (`Deploy Test` or `Deploy Prod`)
3. Click **"Run workflow"**
4. Select branch (default: `test` or `main`)
5. Confirm execution ✅

---

## ✅ 8. Deployment Architecture

- The project runs via **Docker Compose** on the VPS  
- Two services are deployed:
  - `api` (FastAPI backend)
  - `front` (React frontend)
- Containers are rebuilt and restarted at each deployment
- No downtime strategy is implemented yet (future improvement possible)


