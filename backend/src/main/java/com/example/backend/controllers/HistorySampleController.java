package com.example.backend.controllers;

import com.example.backend.models.MlDataResponse;
import com.example.backend.services.HistoryQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class HistorySampleController {
    private final HistoryQueryService historyQueryService;

    public HistorySampleController(HistoryQueryService historyQueryService) {
        this.historyQueryService = historyQueryService;
    }

    @GetMapping("/history-sample")
    List<MlDataResponse> getHistorySample() {
        return historyQueryService.getHistorySample();
    }
}
