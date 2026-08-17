package com.example.backend.repository;

import com.example.backend.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    // Con solo extender JpaRepository, Spring Boot ya nos regala
    // métodos como save(), findAll(), findById(), deleteById() automáticamente.
}