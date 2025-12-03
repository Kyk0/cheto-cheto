package com.example.backend.services;

import com.example.backend.models.MlDataRequest;
import com.example.backend.models.MlDataResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.client.RestTemplate;

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
                MlDataResponse[].class
        );
        return response != null ? List.of(response) : List.of();
    }


}
