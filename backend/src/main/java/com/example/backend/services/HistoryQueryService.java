package com.example.backend.services;

import com.example.backend.models.MlDataRequest;
import com.example.backend.models.MlDataResponse;
import com.example.backend.repositories.HostStatsRepository;
import com.example.backend.repositories.HostsRepository;
import com.example.backend.repositories.UrlsRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class HistoryQueryService {

    private final HostStatsRepository hostStatsRepository;
    private final HostsRepository hostsRepository;
    private final UrlsRepository urlsRepository;
    private final boolean refreshOnRequest;
    private final HistoryImportService historyImportService;
    private final MlClientService mlClientService;
    private final String mlPredictPath;
    private final String mlPredictZipPath;
    private static final long MAX_UPLOAD_SIZE_BYTES = 500L * 1024 * 1024;

    public HistoryQueryService(HostsRepository hostsRepository,
                               HostStatsRepository hostStatsRepository,
                               UrlsRepository urlsRepository,
                               @Value("${app.history-sample.refresh-on-request}") boolean refreshOnRequest,
                               HistoryImportService historyImportService,
                               MlClientService mlClientService,
                               @Value("${app.ml.predict-path}") String mlPredictPath) {

        this.hostStatsRepository = hostStatsRepository;
        this.hostsRepository = hostsRepository;
        this.urlsRepository = urlsRepository;
        this.refreshOnRequest = refreshOnRequest;
        this.historyImportService = historyImportService;
        this.mlClientService = mlClientService;
        this.mlPredictPath =  mlPredictPath
        mlPredictZipPath = mlPredictPath + "/safari";
    }

    public List<MlDataResponse> getHistorySample() {
        if (refreshOnRequest) {

            List<MlDataRequest> requests = historyImportService.formateHistorySampleRequest();
            List<MlDataResponse> response = mlClientService.requestPrediction(requests, mlPredictPath);
            historyImportService.updateHistorySample(response);
            return response;

        }else  {
            return historyImportService.formateHistorySampleResponse();
        }
    }

    public List<MlDataResponse> processUploadedHistory(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file must not be empty");
        }

        if (file.getSize() > MAX_UPLOAD_SIZE_BYTES) {
            throw new IllegalArgumentException("Uploaded file is too large: " + file.getSize());
        }

        return mlClientService.sendSafariDbToMl(file, "/predict-history/safari");
    }


}
