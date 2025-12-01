package com.example.backend.repositories;

import com.example.backend.models.HostStats;
import com.example.backend.models.Hosts;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HostStatsRepository extends JpaRepository<HostStats, Long> {
    Optional<HostStats> findByHost(Hosts host);
}


