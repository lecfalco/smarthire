"""
scorer.py — Evaluates resume text against job requirements using OpenAI or keyword matching.
"""
import os
import json
import re
from dataclasses import dataclass

try:
    from openai import OpenAI
    _openai_available = True
except ImportError:
    _openai_available = False

from dotenv import load_dotenv

load_dotenv()

SHORTLIST_THRESHOLD = 70   # score >= 70  → shortlisted
TALENT_POOL_THRESHOLD = 40 # score 40–69  → talent_pool
                           # score < 40   → rejected


@dataclass
class ScoreResult:
    score: float          # 0–100
    summary: str          # 2-3 sentence human-readable explanation
    status: str           # "shortlisted" | "talent_pool" | "rejected"


SYSTEM_PROMPT = """
You are an expert technical recruiter. You will be given a job description and a
candidate's resume text. Evaluate the candidate's fit for the role and respond
ONLY with a valid JSON object in this exact format (no markdown, no extra explanation):

{
  "score": <integer 0-100>,
  "summary": "<2-3 sentence explanation of fit, highlighting strengths and gaps>"
}

Scoring rubric:
- 80-100: Excellent fit — meets or exceeds all key requirements.
- 60-79 : Good fit — meets most requirements with minor gaps.
- 40-59 : Partial fit — relevant background but significant gaps.
- 20-39 : Weak fit — some tangential skills but mostly mismatched.
- 0-19  : No fit — clearly mismatched for this role.
"""


def _score_with_openai(
    resume_text: str,
    job_title: str,
    job_description: str,
    required_skills: str,
    experience_level: str
) -> ScoreResult:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    user_message = f"""
JOB TITLE: {job_title}
EXPERIENCE LEVEL: {experience_level}
REQUIRED SKILLS: {required_skills}
JOB DESCRIPTION:
{job_description}

---

CANDIDATE RESUME:
{resume_text[:3000]}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.2,
        max_tokens=300,
    )

    raw = response.choices[0].message.content.strip()
    data = json.loads(raw)
    score = float(data["score"])
    summary = data["summary"]
    return _build_result(score, summary)


def _score_with_keywords(resume_text: str, required_skills: str) -> ScoreResult:
    """
    Keyword overlap scoring fallback when OpenAI is unavailable or without API key.
    """
    required = [s.strip().lower() for s in (required_skills or "").split(",") if s.strip()]
    if not required:
        return _build_result(50.0, "No specific required skills provided; default evaluation score 50.")

    resume_lower = resume_text.lower()
    matched = [s for s in required if re.search(r'\b' + re.escape(s) + r'\b', resume_lower)]
    score = round((len(matched) / len(required)) * 100, 1)

    if matched:
        summary = (
            f"Keyword match: {len(matched)}/{len(required)} required skills identified "
            f"({', '.join(matched[:4])}{'...' if len(matched) > 4 else ''}). "
            "Evaluated via automated skill matching algorithm."
        )
    else:
        summary = "No matching core skills identified in resume text based on job criteria."

    return _build_result(score, summary)


def _build_result(score: float, summary: str) -> ScoreResult:
    if score >= SHORTLIST_THRESHOLD:
        status = "shortlisted"
    elif score >= TALENT_POOL_THRESHOLD:
        status = "talent_pool"
    else:
        status = "rejected"
    return ScoreResult(score=score, summary=summary, status=status)


def score_candidate(
    resume_text: str,
    job_title: str,
    job_description: str,
    required_skills: str,
    experience_level: str,
) -> ScoreResult:
    """
    Main evaluation function called by the microservice.
    Uses OpenAI if configured; otherwise gracefully falls back to keyword matching.
    """
    api_key = os.getenv("OPENAI_API_KEY", "")
    if _openai_available and api_key and api_key.startswith("sk-"):
        try:
            return _score_with_openai(
                resume_text, job_title, job_description,
                required_skills, experience_level
            )
        except Exception as e:
            print(f"[scorer] OpenAI API error ({e}), utilizing local matching fallback.")

    return _score_with_keywords(resume_text, required_skills)
