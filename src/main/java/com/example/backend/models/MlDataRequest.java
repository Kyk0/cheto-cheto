package com.example.backend.models;

public class MlDataRequest {

    private String title;
    private String url;
    private Long time_usec;
    private String host;

    public MlDataRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Long getTime_usec() {
        return time_usec;
    }

    public void setTime_usec(Long time_usec) {
        this.time_usec = time_usec;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }
}
