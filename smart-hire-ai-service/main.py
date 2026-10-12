"""
main.py — SmartHire AI Microservice (Python FastAPI)
Responsible for resume parsing and AI scoring.
Runs on port 8001 to serve the Java Spring Boot backend.
"""
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from parser import parse_resume
from scorer import score_candidate

app = FastAPI(
    title="SmartHire AI Microservice",
    description="Python microservice for resume parsing and AI match scoring",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalysisResult(BaseModel):
    name: str
    email: Optional[str] = None
    resume_text: str
    extracted_skills: str
    match_score: float
    match_summary: str
    status: str


@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "SmartHire AI Microservice",
        "port": 8001
    }


@app.post("/parse-and-score", response_model=AnalysisResult)
@app.post("/api/ai/parse-and-score", response_model=AnalysisResult)
async def parse_and_score(
    resume: UploadFile = File(..., description="Uploaded resume file (PDF or TXT)"),
    job_title: str = Form(""),
    job_description: str = Form(""),
    required_skills: str = Form(""),
    experience_level: str = Form("Mid"),
):
    """
    Parses resume text, identifies candidate details & skills,
    and runs the AI evaluation engine against the job requirements.
    """
    file_bytes = await resume.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty resume file uploaded.")

    raw_text, name, email, skills = parse_resume(file_bytes, resume.filename or "resume.txt")

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from the uploaded file.")

    # Run AI / Keyword scoring
    result = score_candidate(
        resume_text=raw_text,
        job_title=job_title,
        job_description=job_description,
        required_skills=required_skills,
        experience_level=experience_level,
    )

    return AnalysisResult(
        name=name,
        email=email,
        resume_text=raw_text,
        extracted_skills=", ".join(skills),
        match_score=result.score,
        match_summary=result.summary,
        status=result.status,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
