package com.example.backend.services;


import com.example.backend.models.HostStats;
import com.example.backend.models.Hosts;
import com.example.backend.models.Urls;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import tools.jackson.core.type.TypeReference;
import com.example.backend.models.FlatMlData;
import com.example.backend.repositories.HostStatsRepository;
import com.example.backend.repositories.HostsRepository;
import com.example.backend.repositories.UrlsRepository;
import tools.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Service
public class HistoryImportService {

    private final HostsRepository hostsRepository;
    private final HostStatsRepository hostStatsRepository;
    private final UrlsRepository urlsRepository;
    private final ObjectMapper objectMapper;

    public HistoryImportService(HostStatsRepository hostStatsRepository,
                                HostsRepository hostsRepository,
                                UrlsRepository urlsRepository,
                                ObjectMapper objectMapper) {
        this.hostStatsRepository = hostStatsRepository;
        this.hostsRepository = hostsRepository;
        this.urlsRepository = urlsRepository;
        this.objectMapper = objectMapper;
    }

    public List<FlatMlData> parseJson(String path) {
        try{
            String json = Files.readString(Path.of(path));
            return objectMapper.readValue(
                    json,
                    new TypeReference<List<FlatMlData>>() {}
            );
        } catch (Exception e) {
            throw new RuntimeException("Error loading sample data from file: " + path, e);
        }
    }

    @Transactional
    public void updateHistorySample(List<FlatMlData> rows) {
        for (FlatMlData row : rows) {

            Hosts host = hostsRepository
                    .findByHost(row.getHost())
                    .orElseGet(() -> {
                        Hosts h = new Hosts();
                        h.setHost(row.getHost());
                        return hostsRepository.save(h);
                    });

            HostStats stats = hostStatsRepository
                    .findByHost(host)
                    .orElseGet(() -> {
                        HostStats s = new HostStats();
                        s.setHost(host);
                        return s;
                    });

            stats.setPred_topic(row.getPred_topic());
            stats.setPred_prob(row.getPred_prob());
            stats.setProb_news(row.getProb_news());
            stats.setProb_shopping(row.getProb_shopping());
            stats.setProb_social(row.getProb_social());
            stats.setProb_video(row.getProb_video());
            stats.setProb_education(row.getProb_education());
            stats.setProb_work(row.getProb_work());
            stats.setProb_finance(row.getProb_finance());
            stats.setProb_travel(row.getProb_travel());
            stats.setProb_gaming(row.getProb_gaming());
            stats.setProb_entertainment(row.getProb_entertainment());
            stats.setProb_tech(row.getProb_tech());
            stats.setProb_services(row.getProb_services());
            stats.setProb_health(row.getProb_health());
            stats.setProb_government(row.getProb_government());
            stats.setProb_other(row.getProb_other());

            hostStatsRepository.save(stats);

            Urls url = new Urls();
            url.setHost(host);
            url.setTitle(row.getTitle());
            url.setUrl(row.getUrl());
            url.setTime_usec(row.getTime_usec());

            urlsRepository.save(url);
        }
    }

    @PostConstruct
    @Transactional
    public void loadSampleDataFromFile() {
        List<FlatMlData> rows = parseJson("src/main/resources/data/history_sample_data.json");
        updateHistorySample(rows);
    }



}
