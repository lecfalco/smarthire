package com.smarthire.service;

import com.smarthire.model.Candidate;
import com.smarthire.model.Job;
import com.smarthire.repository.CandidateRepository;
import com.smarthire.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
public class CandidateService {

    private static final Logger logger = LoggerFactory.getLogger(CandidateService.class);

    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://localhost:8001}")
    private String aiServiceUrl;

    public CandidateService(CandidateRepository candidateRepository,
                            JobRepository jobRepository,
                            RestTemplate restTemplate) {
        this.candidateRepository = candidateRepository;
        this.jobRepository = jobRepository;
        this.restTemplate = restTemplate;
    }

    /**
     * Uploads resume, calls Python AI microservice for parsing & scoring,
     * and saves candidate into the database.
     */
    public Candidate applyCandidate(Long jobId, MultipartFile resumeFile) throws IOException {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new NoSuchElementException("Job not found with id: " + jobId));

        String candidateName = "Applicant";
        String candidateEmail = null;
        String resumeText = "";
        String extractedSkills = "";
        Double matchScore = 50.0;
        String matchSummary = "Pending evaluation.";
        String status = "talent_pool";

        try {
            // Prepare multipart payload for Python microservice
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            final String filename = (resumeFile.getOriginalFilename() != null)
                    ? resumeFile.getOriginalFilename()
                    : "resume.pdf";

            ByteArrayResource fileResource = new ByteArrayResource(resumeFile.getBytes()) {
                @Override
                public String getFilename() {
                    return filename;
                }
            };

            body.add("resume", fileResource);
            body.add("job_title", job.getTitle() != null ? job.getTitle() : "");
            body.add("job_description", job.getDescription() != null ? job.getDescription() : "");
            body.add("required_skills", job.getRequiredSkills() != null ? job.getRequiredSkills() : "");
            body.add("experience_level", job.getExperienceLevel() != null ? job.getExperienceLevel() : "Mid");

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            String targetUrl = aiServiceUrl + "/parse-and-score";
            logger.info("Calling AI Microservice at: {}", targetUrl);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(targetUrl, requestEntity, Map.class);

            if (response != null) {
                if (response.get("name") != null) {
                    candidateName = response.get("name").toString();
                }
                if (response.get("email") != null) {
                    candidateEmail = response.get("email").toString();
                }
                if (response.get("resume_text") != null) {
                    resumeText = response.get("resume_text").toString();
                }
                if (response.get("extracted_skills") != null) {
                    extractedSkills = response.get("extracted_skills").toString();
                }
                if (response.get("match_score") != null) {
                    matchScore = Double.valueOf(response.get("match_score").toString());
                }
                if (response.get("match_summary") != null) {
                    matchSummary = response.get("match_summary").toString();
                }
                if (response.get("status") != null) {
                    status = response.get("status").toString();
                }
            }
        } catch (Exception ex) {
            logger.warn("Could not reach Python AI microservice: {}. Using fallback assessment.", ex.getMessage());
            // Fallback: simple text preview and default score
            candidateName = (resumeFile.getOriginalFilename() != null)
                    ? resumeFile.getOriginalFilename().replaceFirst("[.][^.]+$", "")
                    : "Candidate";
            matchSummary = "Candidate saved. (Note: AI service offline, pending NLP parsing).";
        }

        Candidate candidate = new Candidate(
                candidateName,
                candidateEmail,
                resumeText,
                extractedSkills,
                matchScore,
                matchSummary,
                status,
                jobId
        );

        return candidateRepository.save(candidate);
    }

    public List<Candidate> getCandidatesByJobId(Long jobId) {
        return candidateRepository.findByJobIdOrderByMatchScoreDesc(jobId);
    }

    public Optional<Candidate> getCandidateById(Long candidateId) {
        return candidateRepository.findById(candidateId);
    }

    public List<Candidate> getTalentPool(String skill) {
        if (skill != null && !skill.trim().isEmpty()) {
            return candidateRepository.findByStatusAndExtractedSkillsContainingIgnoreCaseOrderByMatchScoreDesc(
                    "talent_pool", skill.trim()
            );
        }
        return candidateRepository.findByStatusOrderByMatchScoreDesc("talent_pool");
    }

    public Map<String, Object> getDashboardStats() {
        long totalJobs = jobRepository.count();
        long totalCandidates = candidateRepository.count();
        long shortlisted = candidateRepository.countByStatus("shortlisted");
        long talentPool = candidateRepository.countByStatus("talent_pool");

        List<Candidate> allCandidates = candidateRepository.findAll();
        double avgScore = 0.0;
        if (!allCandidates.isEmpty()) {
            double sum = allCandidates.stream()
                    .mapToDouble(c -> c.getMatchScore() != null ? c.getMatchScore() : 0.0)
                    .sum();
            avgScore = Math.round((sum / allCandidates.size()) * 10.0) / 10.0;
        }

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total_jobs", totalJobs);
        stats.put("total_candidates", totalCandidates);
        stats.put("shortlisted", shortlisted);
        stats.put("talent_pool", talentPool);
        stats.put("avg_match_score", avgScore);
        return stats;
    }
}
