package com.example.backend.services;


import com.example.backend.models.*;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import tools.jackson.core.type.TypeReference;
import com.example.backend.repositories.HostStatsRepository;
import com.example.backend.repositories.HostsRepository;
import com.example.backend.repositories.UrlsRepository;
import tools.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
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

    public List<MlDataResponse> parseJson(String path) {
        try{
            String json = Files.readString(Path.of(path));
            return objectMapper.readValue(
                    json,
                    new TypeReference<List<MlDataResponse>>() {}
            );
        } catch (Exception e) {
            throw new RuntimeException("Error loading sample data from file: " + path, e);
        }
    }

    @Transactional
    public void updateHistorySample(List<MlDataResponse> rows) {
        for (MlDataResponse row : rows) {

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
        List<MlDataResponse> rows = parseJson("src/main/resources/data/history_sample_data.json");
        updateHistorySample(rows);
    }

    public List<MlDataRequest> formateHistorySampleRequest() {
        List<Urls> urls = urlsRepository.findAll();

        return urls.stream()
                .map(u -> {
                    MlDataRequest dto = new MlDataRequest();
                    dto.setTitle(u.getTitle());
                    dto.setUrl(u.getUrl());
                    dto.setTime_usec(u.getTime_usec());

                    Hosts host = u.getHost();
                    dto.setHost(host != null ? host.getHost() : null);

                    return dto;
                })
                .toList();
    }


    public List<MlDataResponse> formateHistorySampleResponse() {
        List<Urls> urls = urlsRepository.findAll();
        List<MlDataResponse> res = new ArrayList<>();

        for (Urls url : urls) {
            Hosts host = url.getHost();
            HostStats stats = hostStatsRepository
                    .findByHost(host)
                    .orElse(null);

            MlDataResponse dto = new MlDataResponse();

            dto.setTitle(url.getTitle());
            dto.setUrl(url.getUrl());
            dto.setTime_usec(url.getTime_usec());
            dto.setHost(host.getHost());

            if (stats != null) {
                dto.setPred_topic(stats.getPred_topic());
                dto.setPred_prob(stats.getPred_prob());
                dto.setProb_news(stats.getProb_news());
                dto.setProb_shopping(stats.getProb_shopping());
                dto.setProb_social(stats.getProb_social());
                dto.setProb_video(stats.getProb_video());
                dto.setProb_education(stats.getProb_education());
                dto.setProb_work(stats.getProb_work());
                dto.setProb_finance(stats.getProb_finance());
                dto.setProb_travel(stats.getProb_travel());
                dto.setProb_gaming(stats.getProb_gaming());
                dto.setProb_entertainment(stats.getProb_entertainment());
                dto.setProb_tech(stats.getProb_tech());
                dto.setProb_services(stats.getProb_services());
                dto.setProb_health(stats.getProb_health());
                dto.setProb_government(stats.getProb_government());
                dto.setProb_other(stats.getProb_other());
            }

            res.add(dto);
        }
        return res;
    }




}
