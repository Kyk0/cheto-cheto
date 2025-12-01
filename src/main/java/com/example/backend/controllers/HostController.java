package com.example.backend.controllers;

import com.example.backend.models.Hosts;
import com.example.backend.repositories.HostsRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hosts")
public class HostController {

    private final HostsRepository hostsRepository;

    public HostController(HostsRepository hostsRepository) {
        this.hostsRepository = hostsRepository;
    }

    // create a new host
    @PostMapping
    public Hosts createHost(@RequestBody Hosts host) {
        // you only need to send {"host": "youtube.com"} in JSON
        return hostsRepository.save(host);
    }

    // list all hosts
    @GetMapping
    public List<Hosts> getAllHosts() {
        return hostsRepository.findAll();
    }
}


