package com.example.backend.controllers;

import com.example.backend.models.HostStats;
import com.example.backend.repositories.HostStatsRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/host-stats")
public class HostStatsController {

    private final HostStatsRepository hostStatsRepository;

    public HostStatsController(HostStatsRepository hostStatsRepository) {
        this.hostStatsRepository = hostStatsRepository;
    }

    @PostMapping
    public HostStats createStats(@RequestBody HostStats stats) {
        return hostStatsRepository.save(stats);
    }

    @GetMapping
    public List<HostStats> getAllStats() {
        return hostStatsRepository.findAll();
    }
}