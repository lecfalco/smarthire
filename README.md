# SmartHire — AI-Powered Applicant Screening Platform

An enterprise-grade applicant screening and resume sorting platform built with a high-performance decoupled microservice architecture:
- **`smart-hire-backend`**: Core Java Spring Boot 3 enterprise application managing jobs, candidate records, persistence (JPA/Hibernate + H2), and orchestrating business workflows.
- **`smart-hire-ai-service`**: Dedicated Python microservice running FastAPI, responsible for resume text extraction (PDF & TXT) and automated scoring (OpenAI GPT-4o-mini with local keyword matching fallback).
- **`frontend`**: Modern React dashboard for recruiters and HR professionals.

---

## 📁 Project Structure

```
smart-hire-project/
├── smart-hire-ai-service/         # Python Microservice (Port 8001)
│   ├── main.py                    # FastAPI server & /parse-and-score endpoint
│   ├── parser.py                  # PDF/TXT extraction & skill identification
│   ├── scorer.py                  # AI evaluation engine (OpenAI / keyword fallback)
│   ├── requirements.txt           # Dependencies
│   └── .env.example               # Optional OpenAI API Key configuration
│
├── smart-hire-backend/            # Java Spring Boot Backend (Port 8080)
│   ├── pom.xml                    # Maven build configuration (Java 17+, Spring Boot 3)
│   ├── mvnw / mvnw.cmd            # Maven wrapper (runs with zero pre-installed Maven)
│   └── src/
│       └── main/
│           ├── resources/
│           │   └── application.properties # H2 database & service configuration
│           └── java/
│               └── com/
│                   └── smarthire/
│                       ├── SmartHireApplication.java       # Spring Boot main class
│                       ├── controller/
│                       │   └── JobController.java          # REST API endpoints & CORS
│                       ├── model/
│                       │   ├── Job.java                    # JPA Job Entity
│                       │   └── Candidate.java              # JPA Candidate Entity
│                       ├── repository/
│                       │   ├── JobRepository.java          # Spring Data JPA repository
│                       │   └── CandidateRepository.java    # Spring Data JPA repository
│                       └── service/
│                           └── CandidateService.java       # Business logic & microservice client
│
└── frontend/                      # React UI Dashboard (Port 5173)
    ├── src/
    │   ├── components/            # Dashboard, JobForm, CandidateCard
    │   ├── api.js                 # Axios API bindings
    │   └── App.jsx
    ├── package.json
    └── vite.config.js             # Proxies /api to Spring Boot (:8080)
```

---

## 🚀 System Architecture & Workflow

```
[ Client / React Dashboard / Curl ]
            │
            │ 1. POST /jobs/{id}/apply (Multipart Resume)
            ▼
[ Java Spring Boot Backend ] (Port 8080)
   ├── JobController receives upload request
   ├── CandidateService fetches Job from H2 DB
   │        │
   │        │ 2. HTTP POST multipart (/parse-and-score) via RestTemplate
   │        ▼
   │  [ Python AI Microservice ] (Port 8001)
   │     ├── parser.py: extracts text, candidate name, email, skills
   │     ├── scorer.py: evaluates match against job requirements (0 - 100)
   │     └── returns JSON evaluation
   │        │
   │        ▼
   ├── CandidateService persists Candidate entity into H2 Database
   └── Returns saved Candidate to client
```

---

## 🚦 Scoring Logic & Categorization

| Score Range | Status | Action |
|---|---|---|
| **70 – 100** | `shortlisted` | Highest priority ranking; immediately surfaces in interview queue |
| **40 – 69** | `talent_pool` | Qualified near-miss; automatically saved to Talent Pool for future openings |
| **0 – 39** | `rejected` | Below job threshold; logged in records |

---

## 🛠️ Step-by-Step Running Guide

### 1. Start the Python AI Microservice (Port 8001)

```bash
cd smart-hire-project/smart-hire-ai-service

# Windows PowerShell:
..\..\.venv\Scripts\Activate.ps1

# Install requirements if needed:
pip install -r requirements.txt

# Start the microservice:
python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

- Health Check: `http://127.0.0.1:8001/health`
- Swagger Docs: `http://127.0.0.1:8001/docs`

---

### 2. Start the Java Spring Boot Backend (Port 8080)

```bash
cd smart-hire-project/smart-hire-backend

# Windows:
.\mvnw.cmd spring-boot:run

# Linux / macOS:
./mvnw spring-boot:run
```

- Spring Boot API: `http://localhost:8080/`
- Interactive H2 Database Console: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:smarthiredb`
  - User: `sa`
  - Password: *(leave blank)*

---

### 3. (Optional) Start the Frontend Dashboard (Port 5173)

```bash
cd smart-hire-project/frontend
npm install
npm run dev
```

- Dashboard UI: `http://localhost:5173`

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` or `/api/health` | Health check & engine status |
| `GET` | `/jobs` | List all job openings (includes pre-seeded demo jobs) |
| `POST` | `/jobs` | Create a new job opening |
| `GET` | `/jobs/{id}` | Retrieve specific job details |
| `DELETE`| `/jobs/{id}` | Delete a job opening |
| `POST` | `/jobs/{id}/apply` | Upload resume file (`multipart/form-data`) → Triggers AI scoring |
| `GET` | `/jobs/{id}/candidates` | Get ranked candidates for a specific job |
| `GET` | `/candidates/{id}` | Get individual candidate details |
| `GET` | `/talent-pool` | Retrieve candidates in the talent pool (optional `?skill=`) |
| `GET` | `/talent-pool/search` | Search talent pool by role/skill keyword (`?role=`) |
| `GET` | `/stats` | Aggregate dashboard statistics |
