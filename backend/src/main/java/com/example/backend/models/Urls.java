package com.example.backend.models;


import jakarta.persistence.*;

@Entity
@Table(name = "urls")
public class Urls {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(columnDefinition = "text")
    private String title;

    @Column(columnDefinition = "text")
    private String url;

    private Long time_usec;

    @ManyToOne
    @JoinColumn(name = "host_id", nullable = false)
    private Hosts host;

    public Urls() {

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Hosts getHost() {
        return host;
    }

    public void setHost(Hosts host) {
        this.host = host;
    }
}
