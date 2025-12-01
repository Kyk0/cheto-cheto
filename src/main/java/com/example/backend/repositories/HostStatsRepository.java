package com.example.backend.repositories;

import com.example.backend.models.HostStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HostStatsRepository extends JpaRepository<HostStats, Long> {

}
