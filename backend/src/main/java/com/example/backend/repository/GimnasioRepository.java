package com.example.backend.repository;

import com.example.backend.model.Gimnasio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GimnasioRepository extends JpaRepository<Gimnasio, Integer> {
}
