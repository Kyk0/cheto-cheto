package com.example.backend.controllers;

import com.example.backend.models.MlDataResponse;
import com.example.backend.services.HistoryQueryService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class HistorySampleController {
    private final HistoryQueryService historyQueryService;

    public HistorySampleController(HistoryQueryService historyQueryService) {
        this.historyQueryService = historyQueryService;
    }

    @GetMapping("/history-sample")
    public List<MlDataResponse> getHistorySample() {
        return historyQueryService.getHistorySample();
    }

    @PostMapping("/history/upload")
    public String uploadHistory(@RequestParam("file") MultipartFile file) {
        return historyQueryService.processUploadedHistory(file);
    }
}
