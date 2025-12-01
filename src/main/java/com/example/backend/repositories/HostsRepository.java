package com.example.backend.repositories;


import com.example.backend.models.Hosts;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HostsRepository extends JpaRepository<Hosts, Long> {
    Optional<Hosts> findByHost(String host);
}
