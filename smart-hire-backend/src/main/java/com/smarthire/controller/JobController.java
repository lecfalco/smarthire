package com.smarthire.controller;

import com.smarthire.model.Candidate;
import com.smarthire.model.Job;
import com.smarthire.repository.JobRepository;
import com.smarthire.service.CandidateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class JobController {

    private final JobRepository jobRepository;
    private final CandidateService candidateService;

    public JobController(JobRepository jobRepository, CandidateService candidateService) {
        this.jobRepository = jobRepository;
        this.candidateService = candidateService;
    }

    // ── Health Check ─────────────────────────────────────────────────────────────

    @GetMapping({"/", "/api/health"})
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "SmartHire Java Spring Boot Backend is running 🚀");
        response.put("engine", "Spring Boot + H2 JPA + Python AI Microservice");
        return ResponseEntity.ok(response);
    }

    // ── Jobs ─────────────────────────────────────────────────────────────────────

    @GetMapping({"/jobs", "/api/jobs"})
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping({"/jobs", "/api/jobs"})
    public ResponseEntity<Job> createJob(@RequestBody Job job) {
        Job saved = jobRepository.save(job);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping({"/jobs/{id}", "/api/jobs/{id}"})
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        return jobRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping({"/jobs/{id}", "/api/jobs/{id}"})
    public ResponseEntity<Map<String, String>> deleteJob(@PathVariable Long id) {
        if (!jobRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        jobRepository.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Job " + id + " deleted successfully.");
        return ResponseEntity.ok(response);
    }

    // ── Candidates & Resume Upload ───────────────────────────────────────────────

    @PostMapping({"/jobs/{id}/apply", "/api/jobs/{id}/apply"})
    public ResponseEntity<?> applyForJob(
            @PathVariable Long id,
            @RequestParam("resume") MultipartFile resumeFile) {
        try {
            if (resumeFile == null || resumeFile.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("detail", "Please upload a valid resume file."));
            }
            Candidate candidate = candidateService.applyCandidate(id, resumeFile);
            return ResponseEntity.ok(candidate);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("detail", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("detail", "Failed to process resume: " + e.getMessage()));
        }
    }

    @GetMapping({"/jobs/{id}/candidates", "/api/jobs/{id}/candidates"})
    public ResponseEntity<List<Candidate>> getJobCandidates(@PathVariable Long id) {
        return ResponseEntity.ok(candidateService.getCandidatesByJobId(id));
    }

    @GetMapping({"/candidates/{id}", "/api/candidates/{id}"})
    public ResponseEntity<Candidate> getCandidate(@PathVariable Long id) {
        return candidateService.getCandidateById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Talent Pool ───────────────────────────────────────────────────────────────

    @GetMapping({"/talent-pool", "/api/talent-pool"})
    public ResponseEntity<List<Candidate>> getTalentPool(
            @RequestParam(value = "skill", required = false) String skill) {
        return ResponseEntity.ok(candidateService.getTalentPool(skill));
    }

    @GetMapping({"/talent-pool/search", "/api/talent-pool/search"})
    public ResponseEntity<List<Candidate>> searchTalentPool(
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "skill", required = false) String skill) {
        String filter = (skill != null && !skill.isEmpty()) ? skill : role;
        return ResponseEntity.ok(candidateService.getTalentPool(filter));
    }

    // ── Stats ─────────────────────────────────────────────────────────────────────

    @GetMapping({"/stats", "/api/stats"})
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(candidateService.getDashboardStats());
    }
}
