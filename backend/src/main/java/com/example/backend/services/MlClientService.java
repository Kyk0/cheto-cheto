package com.example.backend.services;

import com.example.backend.models.MlDataRequest;
import com.example.backend.models.MlDataResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class MlClientService {

    private final String mlBaseUrl;
    private final RestTemplate restTemplate;

    public MlClientService(@Value("${app.ml.base-url}") String mlBaseUrl) {

        this.mlBaseUrl = mlBaseUrl;
        this.restTemplate = new RestTemplate();
    }

    public List<MlDataResponse> requestPrediction(List<MlDataRequest> mlDataRequest, String path) {
        String url = mlBaseUrl + path;

        MlDataResponse[] response = restTemplate.postForObject(
                url,
                mlDataRequest,
                MlDataResponse[].class);
        return response != null ? List.of(response) : List.of();
    }

    public List<MlDataResponse> sendSafariDbToMl(MultipartFile file, MultipartFile zipFile, String path) {
        String url = mlBaseUrl + path;
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        if (file != null && !file.isEmpty()) {
            ByteArrayResource fileResource;
            try {
                fileResource = new ByteArrayResource(file.getBytes()) {
                    @Override
                    public String getFilename() {
                        return file.getOriginalFilename() != null
                                ? file.getOriginalFilename()
                                : "history.db";
                    }
                };
            } catch (IOException e) {
                throw new RuntimeException("Failed to read uploaded file", e);
            }
            body.add("file", fileResource);
        } else if (zipFile != null && !zipFile.isEmpty()) {

            ByteArrayResource fileResource;
            try {
                fileResource = new ByteArrayResource(zipFile.getBytes()) {
                    @Override
                    public String getFilename() {
                        return zipFile.getOriginalFilename() != null
                                ? zipFile.getOriginalFilename()
                                : "data.zip";
                    }
                };
            } catch (IOException e) {
                throw new RuntimeException("Failed to read uploaded zip file", e);
            }
            body.add("file", fileResource);
        }

        if (zipFile != null && !zipFile.isEmpty()) {
            try {
                ByteArrayResource zipResource = new ByteArrayResource(zipFile.getBytes()) {
                    @Override
                    public String getFilename() {
                        return zipFile.getOriginalFilename() != null
                                ? zipFile.getOriginalFilename()
                                : "data.zip";
                    }
                };
                body.add("zip", zipResource);
            } catch (IOException e) {
                throw new RuntimeException("Failed to read uploaded zip file", e);
            }
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<MlDataResponse[]> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                MlDataResponse[].class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new IllegalStateException(
                    "ML service returned status " + response.getStatusCode());
        }

        return List.of(response.getBody());
    }
}
