package com.example.backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "host_stats")
public class HostStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @OneToOne
    @JoinColumn(name = "host_id", nullable = false, unique = true)
    private Hosts host;

    private String pred_topic;
    private Double pred_prob;
    private Double prob_news;
    private Double prob_shopping;
    private Double prob_social;
    private Double prob_video;
    private Double prob_education;
    private Double prob_work;
    private Double prob_finance;
    private Double prob_travel;
    private Double prob_gaming;
    private Double prob_entertainment;
    private Double prob_tech;
    private Double prob_services;
    private Double prob_health;
    private Double prob_government;
    private Double prob_other;


    public HostStats() {
    }


    public Double getProb_other() {
        return prob_other;
    }

    public void setProb_other(Double prob_other) {
        this.prob_other = prob_other;
    }

    public Double getProb_government() {
        return prob_government;
    }

    public void setProb_government(Double prob_government) {
        this.prob_government = prob_government;
    }

    public Double getProb_health() {
        return prob_health;
    }

    public void setProb_health(Double prob_health) {
        this.prob_health = prob_health;
    }

    public Double getProb_services() {
        return prob_services;
    }

    public void setProb_services(Double prob_services) {
        this.prob_services = prob_services;
    }

    public Double getProb_tech() {
        return prob_tech;
    }

    public void setProb_tech(Double prob_tech) {
        this.prob_tech = prob_tech;
    }

    public Double getProb_entertainment() {
        return prob_entertainment;
    }

    public void setProb_entertainment(Double prob_entertainment) {
        this.prob_entertainment = prob_entertainment;
    }

    public Double getProb_gaming() {
        return prob_gaming;
    }

    public void setProb_gaming(Double prob_gaming) {
        this.prob_gaming = prob_gaming;
    }

    public Double getProb_travel() {
        return prob_travel;
    }

    public void setProb_travel(Double prob_travel) {
        this.prob_travel = prob_travel;
    }

    public Double getProb_finance() {
        return prob_finance;
    }

    public void setProb_finance(Double prob_finance) {
        this.prob_finance = prob_finance;
    }

    public Double getProb_work() {
        return prob_work;
    }

    public void setProb_work(Double prob_work) {
        this.prob_work = prob_work;
    }

    public Double getProb_education() {
        return prob_education;
    }

    public void setProb_education(Double prob_education) {
        this.prob_education = prob_education;
    }

    public Double getProb_video() {
        return prob_video;
    }

    public void setProb_video(Double prob_video) {
        this.prob_video = prob_video;
    }

    public Double getProb_social() {
        return prob_social;
    }

    public void setProb_social(Double prob_social) {
        this.prob_social = prob_social;
    }

    public Double getProb_shopping() {
        return prob_shopping;
    }

    public void setProb_shopping(Double prob_shopping) {
        this.prob_shopping = prob_shopping;
    }

    public Double getProb_news() {
        return prob_news;
    }

    public void setProb_news(Double prob_news) {
        this.prob_news = prob_news;
    }

    public Double getPred_prob() {
        return pred_prob;
    }

    public void setPred_prob(Double pred_prob) {
        this.pred_prob = pred_prob;
    }

    public String getPred_topic() {
        return pred_topic;
    }

    public void setPred_topic(String pred_topic) {
        this.pred_topic = pred_topic;
    }

    public Hosts getHost() {
        return host;
    }

    public void setHost(Hosts host) {
        this.host = host;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
