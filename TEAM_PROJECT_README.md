# SmartHire — AI-Powered Applicant Screening & Resume Sorting Platform

> **Course:** Advanced Java & Enterprise Application Development  
> **Team Members:** Kshitij, Aditya, Varad, Devika  
> **Architecture:** Microservices (Java Spring Boot 3 + Python FastAPI + React Frontend)

---

## 📌 Executive Summary

**SmartHire** is an enterprise-grade applicant tracking and resume screening system developed as a collaborative group project. The platform automatically ingests applicant resumes (PDF/TXT), parses metadata and candidate competencies, evaluates qualification alignment against job requirements through an intelligent scoring engine, and categorizes candidates into **Shortlisted**, **Talent Pool**, or **Rejected** tiers.

The system is architected around a distributed, decoupled pattern:
1. **Java Spring Boot Backend (`smart-hire-backend`)**: Enterprise business logic, JPA persistence with H2, RESTful routing, and inter-service client orchestration.
2. **Python AI Microservice (`smart-hire-ai-service`)**: NLP parsing, optical skill matching, and LLM scoring engine.
3. **Frontend Dashboard (`frontend`)**: Single-Page Application (SPA) offering an interactive HR workspace.

---

## 👥 Team Work Breakdown & Contribution Matrix

The workload was distributed cleanly across 4 core engineering modules according to software development lifecycle (SDLC) domains and individual component ownership:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             PROJECT RESPONSIBILITIES                             │
├───────────────┬────────────────────────────────────┬─────────────────────────────┤
│ Team Member   │ Primary Role                       │ Core Deliverables           │
├───────────────┼────────────────────────────────────┼─────────────────────────────┤
│ Aditya        │ Core Java Backend & Microservice   │ Spring Boot Application,    │
│               │ Orchestration Lead                 │ CandidateService, HTTP      │
│               │                                    │ RestTemplate Client, Fallback│
├───────────────┼────────────────────────────────────┼─────────────────────────────┤
│ Kshitij       │ AI Microservice & NLP Lead         │ Python FastAPI Service,     │
│               │                                    │ PDF/TXT Parser, LLM &       │
│               │                                    │ Keyword Scoring Engine      │
├───────────────┼────────────────────────────────────┼─────────────────────────────┤
│ Varad         │ Java API Controller & Database Lead│ REST Controllers, H2/JPA    │
│               │                                    │ Data Layer, Repositories,   │
│               │                                    │ Seed Data, API Endpoints    │
├───────────────┼────────────────────────────────────┼─────────────────────────────┤
│ Devika        │ Frontend Dashboard & QA Lead       │ React UI Components, API    │
│               │                                    │ Integration, Error Handling,│
│               │                                    │ System Testing & Docs       │
└───────────────┴────────────────────────────────────┴─────────────────────────────┘
```

---

### 1. Aditya — Core Java Backend Architecture & Microservice Integration
**Focus Area:** Java Spring Boot business logic, service layer, inter-service networking, and fault tolerance.

* **Key Deliverables & Files:**
  * [`CandidateService.java`](file:///c:/RESUME%20SORTER%20PROJECT%20CLAUDE/smart-hire-project/smart-hire-backend/src/main/java/com/smarthire/service/CandidateService.java): Implemented core domain workflows for resume ingestion and candidate evaluation.
  * **Inter-Service Orchestration:** Configured Spring's `RestTemplate` to perform multipart HTTP communication with the Python microservice (`/parse-and-score`) using custom `ByteArrayResource` streams.
  * **Fault Tolerance & Graceful Degradation:** Built circuit-resilient fallback handlers so that if the Python microservice is temporarily unavailable or network latency spikes, candidates are safely stored with provisional scores rather than failing the request.
  * **Maven Build & Packaging:** Configured `pom.xml`, dependency management (`spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `h2`), and configured portable wrapper tools (`mvnw`, `mvnw.cmd`).

---

### 2. Kshitij — AI Microservice, NLP Parsing & Scoring Engine
**Focus Area:** Python FastAPI microservice, resume document processing, and algorithm scoring.

* **Key Deliverables & Files:**
  * [`main.py`](file:///c:/RESUME%20SORTER%20PROJECT%20CLAUDE/smart-hire-project/smart-hire-ai-service/main.py): Built high-concurrency asynchronous FastAPI server operating on port `8001`.
  * [`parser.py`](file:///c:/RESUME%20SORTER%20PROJECT%20CLAUDE/smart-hire-project/smart-hire-ai-service/parser.py): Developed binary PDF parsing with `pdfplumber`, regex text normalization, candidate contact information extraction (email/name heuristics), and custom skill dictionary scanning.
  * [`scorer.py`](file:///c:/RESUME%20SORTER%20PROJECT%20CLAUDE/smart-hire-project/smart-hire-ai-service/scorer.py): Created dual-tier scoring engine:
    * **Primary:** OpenAI GPT-4o-mini prompt orchestration for deep semantic matching and qualitative fit summary generation.
    * **Fallback:** Zero-cost local keyword overlap algorithm for deterministic offline operation.
  * **Requirements & Environment:** Setup `requirements.txt` and `.env` configuration.

---

### 3. Varad — Java REST API Controllers, Data Persistence & ORM Layer
**Focus Area:** REST API contract design, Spring Data JPA entity modeling, and database persistence.

* **Key Deliverables & Files:**
  * [`JobController.java`](file:///c:/RESUME%20SORTER%20PROJECT%20CLAUDE/smart-hire-project/smart-hire-backend/src/main/java/com/smarthire/controller/JobController.java): Implemented REST endpoints with `@CrossOrigin` support:
    * `GET /jobs`, `POST /jobs`, `GET /jobs/{id}`, `DELETE /jobs/{id}`
    * `POST /jobs/{id}/apply` (Multipart resume upload)
    * `GET /jobs/{id}/candidates` (Sorted candidate rankings)
    * `GET /talent-pool` & `GET /talent-pool/search` (Near-miss filtering)
    * `GET /stats` (Dashboard aggregate statistics)
  * [`Job.java`](file:///c:/RESUME%20SORTER%20PROJECT%20CLAUDE/smart-hire-project/smart-hire-backend/src/main/java/com/smarthire/model/Job.java) & [`Candidate.java`](file:///c:/RESUME%20SORTER%20PROJECT%20CLAUDE/smart-hire-project/smart-hire-backend/src/main/java/com/smarthire/model/Candidate.java): Designed JPA entity models with `@Entity`, `@Table`, lifecycle hooks (`@PrePersist`), and text column definitions.
  * [`JobRepository.java`](file:///c:/RESUME%20SORTER%20PROJECT%20CLAUDE/smart-hire-project/smart-hire-backend/src/main/java/com/smarthire/repository/JobRepository.java) & [`CandidateRepository.java`](file:///c:/RESUME%20SORTER%20PROJECT%20CLAUDE/smart-hire-project/smart-hire-backend/src/main/java/com/smarthire/repository/CandidateRepository.java): Implemented Spring Data JPA repository interfaces with derived query methods (e.g., `findByJobIdOrderByMatchScoreDesc`).
  * [`SmartHireApplication.java`](file:///c:/RESUME%20SORTER%20PROJECT%20CLAUDE/smart-hire-project/smart-hire-backend/src/main/java/com/smarthire/SmartHireApplication.java) (Data Seeder): Programmed initial database seeding (`CommandLineRunner`) with mock job openings for instant demo readiness.

---

### 4. Devika — Frontend Client, API Integration & System QA
**Focus Area:** React SPA user interface, client-side API layer, system testing, and documentation.

* **Key Deliverables & Files:**
  * **Frontend UI Components (`frontend/src/components/`)**:
    * `Dashboard.jsx`: Job overview, candidate screening tables, and talent pool navigator.
    * `JobForm.jsx`: Modal and input controls for authoring job requisitions.
    * `CandidateCard.jsx`: Visual badges for score tiers (Shortlisted, Talent Pool, Rejected).
  * **API Client & Proxy:** Created centralized Axios client (`api.js`) and configured `vite.config.js` proxy forwarding `/api` calls directly to Spring Boot at `http://localhost:8080`.
  * **Quality Assurance & Verification:** Performed end-to-end integration tests (PDF upload → Java Controller → Python Service → JPA Persistence → UI rendering). Authored technical setup documentation and validation scripts.

---

## 🏛️ System Architecture

```
                                      ┌─────────────────────────────────────┐
                                      │       HR Recruiter Browser UI       │
                                      │        (React SPA on :5173)         │
                                      └──────────────────┬──────────────────┘
                                                         │
                                                         │ HTTP REST (/api/*)
                                                         ▼
                                      ┌─────────────────────────────────────┐
                                      │      Java Spring Boot Backend       │
                                      │       (Spring Boot on :8080)        │
                                      │                                     │
                                      │   • JobController (Varad)           │
                                      │   • CandidateService (Aditya)       │
                                      │   • Job & Candidate Repos (Varad)   │
                                      └─────────┬───────────────────┬───────┘
                                                │                   │
                  Internal HTTP Multipart POST  │                   │ JPA / Hibernate
                      (/parse-and-score)        │                   │
                                                ▼                   ▼
     ┌──────────────────────────────────────────────┐    ┌──────────────────┐
     │           Python AI Microservice             │    │    Embedded H2   │
     │           (FastAPI on :8001)                 │    │     Database     │
     │                                              │    │   (In-Memory)    │
     │   • main.py: API Router (Kshitij)            │    └──────────────────┘
     │   • parser.py: PDF / Skill Extractor (Kshitij)│
     │   • scorer.py: OpenAI / Keyword (Kshitij)    │
     └──────────────────────────────────────────────┘
```

---

## 🚦 Candidate Scoring Logic & Business Rules

Candidates are scored between **0 and 100** by the evaluation engine and routed into distinct hiring categories:

| Score Bracket | Status | System Action & Recruiter Visibility |
|---|---|---|
| **70 – 100** | `shortlisted` | Highest priority ranking; surfaced immediately in the recruiter interview queue. |
| **40 – 69** | `talent_pool` | Qualified near-miss; archived into reusable Talent Pool for future job openings. |
| **0 – 39** | `rejected` | Below threshold; recorded in database audit log but filtered out of main view. |

---

## 💻 How to Run the Entire Project

### Step 1: Start the Python AI Microservice (Port 8001)
```powershell
cd smart-hire-project/smart-hire-ai-service
# Activate virtual environment
..\..\.venv\Scripts\Activate.ps1
# Run service
python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```
*Health Check:* `http://127.0.0.1:8001/health`

### Step 2: Start the Java Spring Boot Backend (Port 8080)
```powershell
cd smart-hire-project/smart-hire-backend
# Run with bundled Maven wrapper
.\mvnw.cmd spring-boot:run
```
*Backend API:* `http://localhost:8080/`  
*H2 Interactive Console:* `http://localhost:8080/h2-console` (`jdbc:h2:mem:smarthiredb`, user `sa`, blank password)

### Step 3 (Optional): Start the React Frontend Dashboard (Port 5173)
```powershell
cd smart-hire-project/frontend
npm install
npm run dev
```
*Dashboard URL:* `http://localhost:5173`

---

## 🧪 Comprehensive API Endpoint Reference

| Method | Endpoint | Responsibility | Description |
|---|---|---|---|
| `GET` | `/` | Varad / Aditya | Health check & system status |
| `GET` | `/jobs` | Varad | List all job postings |
| `POST` | `/jobs` | Varad | Create a new job opening |
| `GET` | `/jobs/{id}` | Varad | Retrieve job details by ID |
| `DELETE` | `/jobs/{id}` | Varad | Delete job posting |
| `POST` | `/jobs/{id}/apply` | Aditya / Kshitij | Upload resume (multipart), trigger AI scoring & save candidate |
| `GET` | `/jobs/{id}/candidates` | Varad | Get candidates ranked by score for a job |
| `GET` | `/talent-pool` | Varad | View candidates in Talent Pool (supports `?skill=`) |
| `GET` | `/stats` | Varad / Aditya | Aggregate statistics (total jobs, candidates, shortlisted, avg score) |

---

## 🎓 College Academic Highlights

1. **Object-Oriented Design**: Clean implementation of POJOs, encapsulated entities, services, and repositories.
2. **Spring Framework & Dependency Injection**: Loose coupling using `@Service`, `@Repository`, `@RestController`, and `@Autowired`/constructor injection.
3. **Enterprise Persistence**: Object-Relational Mapping (ORM) via Hibernate and Spring Data JPA with database-agnostic repository interfaces.
4. **Modern Microservice Architecture**: Decoupling compute-heavy NLP/AI tasks (Python) from transactional business logic and persistence (Java).
